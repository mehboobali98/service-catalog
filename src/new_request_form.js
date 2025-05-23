import { t }                  from './i18n.js';
import { loadExternalFiles }  from './utility.js';
import { RESOURCE_PREFIXES }  from './constant.js';

class NewRequestForm {
  constructor(locale, ezoFieldId, ezoSubdomain, ezoServiceItemFieldId, integrationMode) {
    this.locale                 = locale;
    this.ezoFieldId             = ezoFieldId;
    this.ezoSubdomain           = ezoSubdomain;
    this.integrationMode        = integrationMode;
    this.ezoServiceItemFieldId  = ezoServiceItemFieldId;
  }

  updateRequestForm() {
    const files = this.filesToLoad();
    loadExternalFiles(files, () => {
      this.updateForm();
    })
  }

  updateForm() {
    if (!this.isRequestFormSelected()) { return; }

    const searchParams          = this.extractQueryParams(window.location);
    const formSubject           = this.prepareSubject(searchParams);
    const serviceItemFieldValue = this.prepareServiceItemFieldValue(searchParams);

    if (formSubject) { this.subjectFieldElement().val(formSubject); }
    if (serviceItemFieldValue) { this.customFieldElement(this.ezoServiceItemFieldId).val(serviceItemFieldValue); }

    if (this.integrationMode === 'custom_objects') {
      this.fetchCustomObjects();
    } else {
      this.getTokenAndFetchAssignedAssets();
    }
  }

  fetchCustomObjects() {
    this.fetchUserData()
      .done((userData) => this.handleUserData(userData))
      .fail(function(error) {
        console.error("Failed to fetch user data:", error);
      });
  }

  handleUserData(userData) {
    var userId    = userData.user.id;
    var userEmail = userData.user.email;
    if (userId) {
      this.populateAssetFieldUsingCustomObjects(userId, userEmail);
    } else {
      console.error("User ID not found in response.");
    }
  }

  populateAssetFieldUsingCustomObjects(userId, userEmail) {
    $.getJSON(`/api/v2/custom_objects/assetsonar_assets/records/search?query=${userEmail}`).done((data) => {
      if (!data || !data.custom_object_records) {
        console.error("No custom object records found");
        return;
      }

      const assetsData = { data: [] };
      const ezoCustomFieldEle = this.customFieldElement(this.ezoFieldId);

      data.custom_object_records.forEach((asset, index) => {
        const { resource_type: resourceType, sequence_num: sequenceNum, asset_name: assetName } = asset.custom_object_fields;
        const prefix = RESOURCE_PREFIXES[resourceType] || '';
        assetsData.data[index] = {
          id:   sequenceNum,
          text: `${prefix} # ${sequenceNum} - ${assetName}`,
        };
      });

      ezoCustomFieldEle.hide();
      ezoCustomFieldEle.after("<select multiple='multiple' id='ezo-asset-select' style='width: 100%;'></select>");
      $("#ezo-asset-select").select2({
        data: assetsData.data
      });
      $("#ezo-asset-select").next().css("font-size", "15px");

      $("#ezo-asset-select").on("change", function () {
        const selectedIds = $(this).val();

        if (selectedIds && selectedIds.length > 0) {
          const selectedAssets = assetsData.data.filter((asset) =>
            selectedIds.includes(asset.id.toString())
          );

          const mappedAssets = selectedAssets.map((asset) => ({
            [asset.id]: asset.text,
          }));

          ezoCustomFieldEle.val(JSON.stringify({ assets: mappedAssets }));
        } else {
          ezoCustomFieldEle.val("");
        }
      });

      this.preselectAssetsCustomField(this.extractQueryParams(window.location));
    }).fail((error) => {
      console.error("Error fetching custom object records:", error);
    });
  }

  extractQueryParams(url) {
    return new URL(url).searchParams;
  }

  getTokenAndFetchAssignedAssets() {
    return this.withToken().then(token => {
      if (token) {
        const options = {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        };

        const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/user_assigned_assets_and_software_entitlements.json';
        return this.populateAssignedAssets(url, options);
      }
    });
  }

  fetchUserData() {
    return $.getJSON('/api/v2/users/me')
  }

  withToken() {
    return $.getJSON('/hc/api/v2/integration/token').then(data => data.token);
  }

  populateAssignedAssets(url, options) {
    fetch(url, options).then(response => response.json())
      .then(data => {

        const assetsData = { data: [] };
        const ezoCustomFieldEle = this.customFieldElement(this.ezoFieldId);

        this.processData(data.assets, assetsData, 'Asset');
        this.processData(data.stock_assets, assetsData, 'Asset Stock')
        this.processData(data.software_entitlements, assetsData, 'Software License');

        ezoCustomFieldEle.hide();
        ezoCustomFieldEle.after("<select multiple='multiple' id='ezo-asset-select' style='width: 100%;'></select>");

        this.renderSelect2PaginationForUsers($('#ezo-asset-select'), url, options);
        // handle it using css classes
        $('#ezo-asset-select').next().css('font-size', '15px');

        $('#ezo-asset-select').on('change', function() {
          var selectedIds = $('#ezo-asset-select').val();
          if (selectedIds.length > 0) {
            let data = assetsData.data.filter(asset => selectedIds.includes(asset.id.toString()));
            data = data.map((asset) => {
              let assetObj = {
                [asset.id]: asset.text };
              return assetObj;
            });
            ezoCustomFieldEle.val(JSON.stringify({ assets: data }));
          }
        });

        this.preselectAssetsCustomField(this.extractQueryParams(window.location));
      });
  }

  renderSelect2PaginationForUsers(element, url, options) {
    const parentElementSelector = 'body';
    element.select2({
      dropdownParent: element.parents(parentElementSelector),
      ajax: {
        url:      url,
        delay:    250,
        headers:  options.headers,
        dataType: 'json',
        data: function(params) {
          var query = {
            page:          params.page || 1,
            search:        params.term,
            include_blank: $(element).data('include-blank')
          }
          return query;
        },

        processResults: function(data, params) {
          var assignedAssets = $.map(data.assets, function(asset) {
            var sequenceNum = asset.sequence_num;
            return { id: sequenceNum, text: `Asset # ${sequenceNum} - ${asset.name}` };
          });

          var assignedStockAssets = $.map(data.stock_assets, function(asset) {
            var sequenceNum = asset.sequence_num;
            return { id: sequenceNum, text: `Asset Stock # ${sequenceNum} - ${asset.name}` };
          });

          var assignedSoftwareLicenses = $.map(data.software_entitlements, function(softwareEntitlement) {
            var sequenceNum = softwareEntitlement.sequence_num;
            return { id: sequenceNum, text: `Software License # ${sequenceNum} - ${softwareEntitlement.name}` };
          });

          var records = assignedAssets.concat(assignedStockAssets, assignedSoftwareLicenses);
          return {
            results:    records,
            pagination: { more: data.page < data.total_pages }
          };
        }
      },
    });
  }

  prepareSubject(searchParams) {
    const itemName            = searchParams.get('item_name');
    const serviceCategory     = searchParams.get('service_category');
    const subjectPlaceholder  = searchParams.get('subject-placeholder');

    if (itemName == null || serviceCategory == null) { return null; }

    let serviceCategoryLabel    = serviceCategory;
    let subjectPlaceholderLabel = subjectPlaceholder;

    if (this.locale == 'en') {
      if (serviceCategory === 'Mes actifs') {
        serviceCategoryLabel = 'My Assigned Assets';
      }
      if (subjectPlaceholder === 'Signaler un problème') {
        subjectPlaceholderLabel = 'Report Issue';
      } else if (subjectPlaceholder === 'Demander un service') {
        subjectPlaceholderLabel = 'Request Service';
      }
    } else if(this.locale == 'fr') {
      if (serviceCategory === 'My Assigned Assets') {
        serviceCategoryLabel = 'Mes actifs';
      }
      if (subjectPlaceholder === 'Report Issue') {
        subjectPlaceholderLabel = 'Signaler un problème';
      } else if (subjectPlaceholder === 'Request Service') {
        subjectPlaceholderLabel = 'Demander un service';
      }
    }

    return `${subjectPlaceholderLabel} on ${serviceCategoryLabel} - ${itemName}`;
  }

  prepareServiceItemFieldValue(searchParams) {
    const itemName      = searchParams.get('item_name');
    const serviceItemId = searchParams.get('service_item_id');

    if (itemName == null && serviceItemId == null) { return null; }

    if(serviceItemId) {
      return `${serviceItemId} - ${itemName}`;
    } else {
      return itemName;
    }
  }

  preselectAssetsCustomField(searchParams) {
    let ezoCustomFieldEle = this.customFieldElement(this.ezoFieldId);
    if (!this.assetsCustomFieldPresent(ezoCustomFieldEle)) { return; }

    let assetId   = searchParams.get('item_id');
    let assetName = searchParams.get('item_name');

    if (!assetName || !assetId) { return; }

    let ezoSelectEle = $('#ezo-asset-select');
    if (ezoSelectEle.length === 0) { this.renderEzoSelect2Field(ezoCustomFieldEle); }

    // Set the value, creating a new option if necessary
    if (ezoSelectEle.find("option[value='" + assetId + "']").length) {
      ezoSelectEle.val(assetId).trigger('change');
    } else {
      var newOption = new Option(assetName, assetId, true, true);
      ezoSelectEle.append(newOption).trigger('change');
    }
  }

  assetsCustomFieldPresent(ezoCustomFieldEle) {
    return ezoCustomFieldEle.length > 0;
  }

  renderEzoSelect2Field(ezoCustomFieldEle) {
    ezoCustomFieldEle.hide();
    ezoCustomFieldEle.after("<select multiple='multiple' id='ezo-asset-select' style='width: 100%;'></select>");
  }

  filesToLoad() {
    return  [
              { type: 'link',   url: 'https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/css/select2.min.css' },
              { type: 'script', url: 'https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/js/select2.min.js'  }
            ];
  }

  processData(records, dataContainer, textPrefix) {
    if (records) {
      $.each(records, function(index, record) {
        var sequenceNum = record.sequence_num;
        dataContainer.data[sequenceNum] = { id: sequenceNum, text: `${textPrefix} # ${sequenceNum} - ${record.name}` };
      });
    }
  }

  isRequestFormSelected() {
    const oldTemplateSelector = $('.nesty-input');
    const newTemplateSelector = $('#downshift-0-input');

    if (oldTemplateSelector.length) {
      return oldTemplateSelector.text() !== '-';
    } else if (newTemplateSelector.length) {
      return newTemplateSelector.val().trim().length > 0;
    } else if (this.subjectFieldElement().length) {
      return true;
    }
    return false;
  }

  subjectFieldElement() {
    return $('#request_subject').length 
      ? $('#request_subject') 
      : $("[name='request[subject]']");
  }

  customFieldElement(customFieldId) {
    const idSelector    = `#request_custom_fields_${customFieldId}`;
    const nameSelector  = `[name='request[custom_fields][${customFieldId}]']`;

    return $(idSelector).length 
      ? $(idSelector) 
      : $(nameSelector);
  }
}

export {
  NewRequestForm
};