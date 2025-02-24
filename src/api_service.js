import {
  setLocale
} from './i18n.js';

import {
  serviceCatalogDataPresent
} from './utility.js';

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
        const requestOptions  = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': true } };

        if(options.searchQuery) {
          queryParams.search_query = options.searchQuery; 
        }

        debugger;
        const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json' + '?' + $.param(queryParams);
        fetch(url, requestOptions)
          .then(response => {
            if (response.status == 400) {
              throw new Error('Bad Request: There was an issue with the request.');
            } else if (response.status == 403) {
              return response.json().catch(() => {
                // Handle non-JSON response here
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
            debugger;
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

  fetchServiceCategoriesAndItemsUsingCustomObjects(callback, noAccessPageCallback, options) {
    $.getJSON("/api/v2/users/me")
        .then(userData => userData.user.email)
        .then(userEmail => {
            if (userEmail) {
              const assetsRequest       = fetch(`/api/v2/custom_objects/assetsonar_assets/records/search?query=${userEmail}`);
              const serviceItemsRequest = fetch("/api/v2/custom_objects/assetsonar_service_items/records/search");

              debugger;
              Promise.all([serviceItemsRequest, assetsRequest])
                  .then(responses => {
                      // Check response statuses
                      responses.forEach(response => {
                        if (response.status === 400) {
                          throw new Error('Bad Request: There was an issue with the request.');
                        } else if (response.status === 403 || response.status === 404) {
                          throw new Error('Access or resource not found.');
                        } else if (!response.ok) {
                          throw new Error('Network response was not ok');
                        }
                      });

                      // Parse JSON responses
                      return Promise.all(responses.map(response => response.json()));
                  })
                  .then(([serviceItemsData, assetsData]) => {
                      $('#loading_icon_container').empty();

                      const combinedCustomObjectRecords = [
                        ...(assetsData.custom_object_records || []),
                        ...(serviceItemsData.custom_object_records || [])
                      ];

                      debugger;
                      const filteredCustomObjectRecords = combinedCustomObjectRecords.filter(record => {
                        const isVisible = record.custom_object_fields.visible === 'true';
                        const matchesSearchQuery = options.searchQuery
                            ? record.name && record.name.toLowerCase().includes(options.searchQuery.toLowerCase())
                            : true; // If no search query, include all visible records
                        return isVisible && matchesSearchQuery;
                      });
                      const restructuredData = {};
                      debugger;
                      filteredCustomObjectRecords.forEach((record, index) => {
                        const categoryKey = `${record.custom_object_fields.service_category_id || index}_${(record.custom_object_fields.service_category_title || 'Unknown').replace(/\s+/g, '_')}`;
                        const resourceType = record.custom_object_fields.resource_type;

                        if (!restructuredData[categoryKey]) {
                          restructuredData[categoryKey] = {
                            title:          record.custom_object_fields.service_category_title || 'Unknown',
                            description:    record.custom_object_fields.service_category_description || '',
                            service_items:  []
                          };
                        }

                        if (resourceType === 'FixedAsset') {
                          restructuredData[categoryKey].service_items.push({
                            id: record.custom_object_fields.asset_id,
                            name: record.custom_object_fields.asset_name || record.name, 
                            display_fields: {
                              'AIN':       record.custom_object_fields.identifier,
                              'Asset #':   record.custom_object_fields.sequence_num,
                              'Location':  record.custom_object_fields.location
                            },
                            sequence_num:                     record.custom_object_fields.sequence_num,
                            zendesk_form_id:                  record.custom_object_fields.zd_form_id || null,
                            display_picture_url:              record.custom_object_fields.display_picture_url || '',
                            service_category_title_with_id:   categoryKey
                          });
                        } else if (resourceType === 'EzPortal::Card') {
                          var serviceItemHash = {
                            id: record.custom_object_fields.service_item_id,
                            display_fields: {
                              title:              { value: record.custom_object_fields.title || '' },
                              cost_price:         { value: record.custom_object_fields.cost_price || null },
                              description:        { value: record.custom_object_fields.description || '' },
                              short_description:  { value: record.custom_object_fields.short_description || '' },
                            },
                            zendesk_form_id:                  record.custom_object_fields.zd_form_id || null,
                            display_picture_url:              record.custom_object_fields.display_picture_url || '',
                            service_category_title_with_id:   categoryKey
                          };
                          restructuredData[categoryKey].service_items.push(serviceItemHash);
                        }
                      });

                      debugger;

                      // Create the final data structure
                      const combinedData = {
                        service_catalog_data:    restructuredData,
                        service_catalog_enabled: serviceItemsData.service_catalog_enabled,
                      };

                      debugger;
                      if (options.searchQuery && options.searchQuery.length) {
                        combinedData.search_results = Object.values(restructuredData).flatMap(category => category.service_items);
                      }

                      debugger;
                      if (combinedData.service_catalog_enabled !== undefined && !combinedData.service_catalog_enabled) {
                        $('main').append(serviceCatalogDisabled(this.ezoSubdomain));
                      } else if (!serviceCatalogDataPresent(combinedData) && Object.keys(combinedData.service_catalog_data).length === 0) {
                        $('main').append(serviceCatalogEmpty(this.ezoSubdomain));
                      } else {
                        callback(combinedData, options);
                      }

                      setLocale(this.locale, true);
                  })
                  .catch(error => {
                      debugger;
                      console.error('An error occurred while fetching service categories and items: ' + error.message);
                      noAccessPageCallback();
                  });
            }
        });
  }

  fetchServiceCategoryItems(categoryId, callback, callBackOptions) {
    $.getJSON('/hc/api/v2/integration/token').then(data => data.token).then(token => {
      if (token) {
        const options       = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': true } };
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