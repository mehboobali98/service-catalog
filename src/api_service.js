import { setLocale } from './i18n.js';
import { serviceCatalogDataPresent } from './utility.js';
import { MANDATORY_SERVICE_ITEM_FIELDS } from './constant.js';
import { 
  noResultsFound, serviceCatalogEmpty, serviceCatalogDisabled
} from './view_helper.js';

class ApiService {
  constructor(locale, ezoSubdomain, integrationMode) {
    this.locale           = locale;
    this.ezoSubdomain     = ezoSubdomain;
    this.integrationMode  = integrationMode;
  }

  fetchServiceCategoriesAndItems(callback, noAccessPageCallback, options) {
    $.getJSON('/hc/api/v2/integration/token').then(data => data.token).then(token => {
      if (token) {
        const endPoint        = 'visible_service_categories_and_items';
        const queryParams     = {};
        const requestOptions  = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token }};

        if(options.searchQuery) {
          queryParams.search_query = options.searchQuery; 
        }

        const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json' + '?' + $.param(queryParams);
        fetch(url, requestOptions)
          .then(response => {
            if (response.status == 400) {
              throw new Error('Bad Request: There was an issue with the request.');
            } else if (response.status == 403) {
              return response.json().catch(() => {
                return noAccessPageCallback();
              });
            } else if (response.status == 404) {
              return noAccessPageCallback();
            }

            if (!response.ok) {
              throw new Error('Network response was not ok');
            }

            return response.json();
          })
          .then(data => {
            $('#loading_icon_container').empty();
            if (data.service_catalog_enabled !== undefined && !data.service_catalog_enabled) {
              $('main').append(serviceCatalogDisabled(this.ezoSubdomain));
            } else if (!serviceCatalogDataPresent(data) && !data.search_results) {
              $('main').append(serviceCatalogEmpty(this.ezoSubdomain));
            } else {
              callback(data, options);
            }
            setLocale(this.locale, true);
          })
          .catch(error => {
            console.error('An error occurred while fetching service categories and items: ' + error.message);
          });
      }
    });
  }

  async fetchServiceCategoriesAndItemsUsingCustomObjects(callback, noAccessPageCallback, options) {
    try {
      const userEmail = await this._getUserEmail();
      if (!userEmail) {
        throw new Error('Unable to fetch user email');
      }

      const customObjectData = await this._fetchCustomObjectData(userEmail);
      const filteredRecords = this._filterVisibleRecords(customObjectData, options.searchQuery);
      const { data: restructuredData, ezPortalCategories } = this._restructureServiceData(filteredRecords);
      const cleanedData = this._removeEmptyEzPortalCategories(restructuredData, ezPortalCategories);
      
      const finalData = this._buildFinalDataStructure(cleanedData, options);
      
      this._handleUIUpdates(finalData, callback, options);
    } catch (error) {
      console.error('An error occurred while fetching service categories and items: ' + error.message);
      noAccessPageCallback();
    }
  }

  // Private helper methods
  async _getUserEmail() {
    const userData = await $.getJSON("/api/v2/users/me");
    return userData.user.email;
  }

  async _fetchCustomObjectData(userEmail) {
    const assetsRequest = fetch(`/api/v2/custom_objects/assetsonar_assets/records/search?query=${userEmail}`);
    const serviceItemsRequest = fetch("/api/v2/custom_objects/assetsonar_service_items/records/search");

    const responses = await Promise.all([assetsRequest, serviceItemsRequest]);
    
    this._validateResponses(responses);
    
    const [assetsData, serviceItemsData] = await Promise.all(
      responses.map(response => response.json())
    );

    return [
      ...(assetsData.custom_object_records || []),
      ...(serviceItemsData.custom_object_records || [])
    ];
  }

  _validateResponses(responses) {
    responses.forEach(response => {
      if (response.status === 400) {
        throw new Error('Bad Request: There was an issue with the request.');
      } else if (response.status === 403 || response.status === 404) {
        throw new Error('Access or resource not found.');
      } else if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    });
  }

  _filterVisibleRecords(records, searchQuery) {
    return records.filter(record => {
      const isVisible = record.custom_object_fields.visible === 'true';
      const matchesSearchQuery = searchQuery
        ? record.name && record.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return isVisible && matchesSearchQuery;
    });
  }

  _restructureServiceData(filteredRecords) {
    const restructuredData = {};
    const ezPortalCategories = new Set(); // Track categories created for EzPortal::Card items

    filteredRecords.forEach((record, index) => {
      const categoryKey = this._generateCategoryKey(record, index);
      const resourceType = record.custom_object_fields.resource_type;

      this._ensureCategoryExists(restructuredData, categoryKey, record);

      // Track if this category was created for EzPortal::Card items
      if (resourceType === 'EzPortal::Card') {
        ezPortalCategories.add(categoryKey);
      }

      const serviceItem = this._createServiceItem(record, resourceType, categoryKey);
      if (serviceItem) {
        restructuredData[categoryKey].service_items.push(serviceItem);
      }
    });

    return { data: restructuredData, ezPortalCategories };
  }

  _generateCategoryKey(record, index) {
    const categoryId = record.custom_object_fields.service_category_id || index;
    const categoryTitle = (record.custom_object_fields.service_category_title || 'Unknown')
      .replace(/\s+/g, '_');
    return `${categoryId}_${categoryTitle}`;
  }

  _ensureCategoryExists(data, categoryKey, record) {
    if (!data[categoryKey]) {
      data[categoryKey] = {
        title: record.custom_object_fields.service_category_title || 'Unknown',
        description: record.custom_object_fields.service_category_description || '',
        service_items: []
      };
    }
  }

  _createServiceItem(record, resourceType, categoryKey) {
    const commonFields = {
      id: record.custom_object_fields.asset_id || record.custom_object_fields.service_item_id,
      name: record.custom_object_fields.asset_name || record.name,
      sequence_num: record.custom_object_fields.sequence_num,
      resource_type: resourceType,
      zendesk_form_id: record.custom_object_fields.zd_form_id || null,
      display_picture_url: record.custom_object_fields.display_picture_url || '',
      service_category_title_with_id: categoryKey
    };

    switch (resourceType) {
      case 'FixedAsset':
        return {
          ...commonFields,
          display_fields: {
            'AIN': record.custom_object_fields.identifier,
            'Asset #': record.custom_object_fields.sequence_num,
            'Location': record.custom_object_fields.location
          }
        };

      case 'StockAsset':
        return {
          ...commonFields,
          display_fields: {
            'Asset #': record.custom_object_fields.sequence_num,
            'Quantity': record.custom_object_fields.quantity,
            'Location': record.custom_object_fields.location
          }
        };

      case 'SoftwareLicense':
        return {
          ...commonFields,
          display_fields: {
            'Entitled on': record.custom_object_fields.entitled_on,
            'Expiring in': record.custom_object_fields.expiring_in,
            'Available seats': record.custom_object_fields.available_seats
          }
        };

      case 'EzPortal::Card':
        if (!this._validateMandatoryFields(record, resourceType)) {
          return null; // Skip invalid records
        }
        return {
          id: record.custom_object_fields.service_item_id,
          resource_type: resourceType,
          display_fields: {
            title: { value: record.custom_object_fields.title },
            cost_price: { value: record.custom_object_fields.cost_price || null },
            description: { value: record.custom_object_fields.description },
            short_description: { value: record.custom_object_fields.short_description }
          },
          zendesk_form_id: record.custom_object_fields.zd_form_id || null,
          display_picture_url: record.custom_object_fields.display_picture_url || '',
          service_category_title_with_id: categoryKey
        };

      default:
        return null;
    }
  }

  _validateMandatoryFields(record, resourceType) {
    const mandatoryFields = MANDATORY_SERVICE_ITEM_FIELDS[resourceType] || [];
    return !mandatoryFields.some(field => {
      const value = record.custom_object_fields[field]?.trim() || '';
      return !value;
    });
  }

  _removeEmptyEzPortalCategories(restructuredData, ezPortalCategories) {
    const cleanedData = {};
    
    Object.entries(restructuredData).forEach(([categoryKey, categoryData]) => {
      // If this category was created for EzPortal::Card items and is now empty, skip it
      if (ezPortalCategories.has(categoryKey) && categoryData.service_items.length === 0) {
        return;
      }
      
      // Include all other categories (even if empty, as they might be for other resource types)
      cleanedData[categoryKey] = categoryData;
    });
    
    return cleanedData;
  }

  _buildFinalDataStructure(restructuredData, options) {
    const combinedData = {
      service_catalog_data: restructuredData,
      service_catalog_enabled: true,
    };

    if (options.searchQuery && options.searchQuery.length) {
      combinedData.search_results = Object.values(restructuredData)
        .flatMap(category => category.service_items);
    }

    return combinedData;
  }

  _handleUIUpdates(finalData, callback, options) {
    $('#loading_icon_container').empty();

    if (finalData.service_catalog_enabled !== undefined && !finalData.service_catalog_enabled) {
      $('main').append(serviceCatalogDisabled(this.ezoSubdomain));
    } else if (!serviceCatalogDataPresent(finalData) && 
               Object.keys(finalData.service_catalog_data).length === 0 && 
               !finalData.search_results) {
      $('main').append(serviceCatalogEmpty(this.ezoSubdomain));
    } else {
      callback(finalData, options);
    }

    setLocale(this.locale, true);
  }

  fetchServiceCategoryItems(categoryId, callback, callBackOptions) {
    $.getJSON('/hc/api/v2/integration/token').then(data => data.token).then(token => {
      if (token) {
        const options       = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } };
        const endPoint      = 'visible_service_categories_and_items';
        const queryParams   = {
          service_category_id: categoryId
        }; 
        const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json' + '?' + $.param(queryParams);
        $('#loading_icon_container').show();
        fetch(url, options)
          .then(response => {
            if (response.status === 400) {
              throw new Error('Bad Request: There was an issue with the request.');
            } else if (response.status === 404) {
              return noAccessPageCallback();
            }
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            callback(data, callBackOptions.serviceItemsContainerId);
            setLocale(this.locale, true);
          })
          .catch(error => {
            console.error('An error occurred while fetching service categories and items: ' + error.message);
          });
      }
    });
  }

  withToken() {
    return $.getJSON('/hc/api/v2/integration/token').then(data => data.token);
  }
}

export { ApiService };
