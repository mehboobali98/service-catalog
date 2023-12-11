import { loadExternalFiles } from './utility.js';

class NewRequestForm {
  constructor(ezoFieldId, ezoSubdomain, ezoServiceItemFieldId) {
    this.ezoFieldId             = ezoFieldId;
    this.ezoSubdomain           = ezoSubdomain;
    this.ezoServiceItemFieldId  = ezoServiceItemFieldId;
  }

  updateRequestForm() {
    const files = this.filesToLoad();
    loadExternalFiles(files, () => {
      this.updateForm();
    })
  }

  updateForm() {
    if ($('.nesty-input')[0].text === "-") { return; }

    const searchParams      = this.extractQueryParams(window.location);
    const customFieldValue  = searchParams.get('item_name');

    $('#request_subject').val(this.prepareSubject(searchParams));
    $('#request_custom_fields_' + this.ezoServiceItemFieldId).val(customFieldValue);
    this.getTokenAndFetchAssignedAssets();
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
            'Authorization': 'Bearer ' + token,
            'ngrok-skip-browser-warning': true
          }
        };

        const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/user_assigned_assets_and_software_entitlements.json';
        return this.populateAssignedAssets(url, options);
      }
    });
  }

  withToken() {
    return $.getJSON('/hc/api/v2/integration/token').then(data => data.token);
  }

  populateAssignedAssets(url, options) {
    fetch(url, options).then(response => response.json())
      .then(data => {

        const assetsData = { data: [] };
        const ezoCustomFieldEle = $('#request_custom_fields_' + this.ezoFieldId);

        debugger;
        if (data.assets) {
          $.each(data.assets, function(index, asset) {
            debugger;
            assetsData.data[index] = { id: asset.sequence_num, text: `Asset # ${asset.sequence_num} - ${asset.name}` }
          });
        }
        ezoCustomFieldEle.hide();
        ezoCustomFieldEle.after("<select multiple='multiple' id='ezo-asset-select' style='width: 100%;'></select>");

        this.renderSelect2PaginationForUsers($('#ezo-asset-select'), url, options);
        this.preselectAssetsCustomField(this.extractQueryParams(window.location));

        $('form.request-form').on('submit', function() {
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
            page: params.page || 1,
            search: params.term,
            include_blank: $(element).data('include-blank')
          }
          return query;
        },

        processResults: function(data, params) {
          var results = $.map(data.assets, function(asset) {
            debugger;
            var objHash = { id: asset.sequence_num, text: `Asset # ${asset.sequence_num} - ${asset.name}` };
            return objHash;
          });

          return {
            results: results,
            pagination: { more: data.page < data.total_pages }
          };
        }
      },
    });
  }

  prepareSubject(searchParams) {
    const itemName        = searchParams.get('item_name');
    const serviceCategory = searchParams.get('service_category');
    return `${serviceCategory} - ${itemName}`;
  }

  preselectAssetsCustomField(searchParams) {
    let ezoCustomFieldEle = $('#request_custom_fields_' + this.ezoFieldId);
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
              { type: 'link',   url: 'https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/css/select2.min.css'},
              { type: 'script', url: 'https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/js/select2.min.js'  }
            ];
  }
}

export { NewRequestForm };