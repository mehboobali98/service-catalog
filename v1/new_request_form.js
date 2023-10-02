import { loadExternalFiles } from './utility.js'

class NewRequestForm {
  constructor(ezoFieldId, ezoSubdomain, zendeskFormData) {
    this.ezoFieldId = ezoFieldId;
    this.ezoSubdomain = ezoSubdomain;
    this.zendeskFormData = zendeskFormData;
  }

  updateRequestForm() {
    loadExternalFiles((filesToLoad) => {
      this.updateForm();
    })
  }

  updateForm() {
    if ($('.nesty-input')[0].text === "-") { return; }

    const searchParams = this.extractQueryParams(window.location);
    const serviceCategory = searchParams.get('service_category');
    const ticketFormData = this.extractTicketFormData(serviceCategory, searchParams);
    if (ticketFormData) {
      const customFieldId = ticketFormData.custom_field_id;
      const customFieldValue = ticketFormData.custom_field_value;
      const ticketFormSubject = ticketFormData.ticket_form_subject;

      $('#request_subject').val(this.updateSubject(ticketFormSubject, searchParams, serviceCategory));
      $('#request_custom_fields_' + customFieldId).val(customFieldValue);
    }
    this.getTokenAndFetchAssignedAssets();
  }

  extractQueryParams(url) {
    return new URL(url).searchParams;
  }

  extractTicketFormData(serviceCategory, searchParams) {
    if (!this.zendeskFormData) { return; }

    if (serviceCategory === 'my_it_assets') {
      const type = searchParams.get('type');
      return this.zendeskFormData[serviceCategory][type]['ticketFormData'];
    } else {
      return this.zendeskFormData[serviceCategory]['ticketFormData'];
    }
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

        const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/get_assigned_assets.json';
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

        if (data.assets) {
          $.each(data.assets, function(index, asset) {
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
        url: url,
        delay: 250,
        dataType: 'json',
        headers: options.headers,
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

  updateSubject(subject, searchParams, serviceCategory) {
    switch (serviceCategory) {
      case 'my_it_assets':
        return subject + searchParams.get('asset_name');
      case 'request_new_software':
      case 'request_laptops':
        return subject + searchParams.get('name');
      default:
        return subject;
    }
  }

  preselectAssetsCustomField(searchParams) {
    let ezoCustomFieldEle = $('#request_custom_fields_' + this.ezoFieldId);
    if (!this.assetsCustomFieldPresent(ezoCustomFieldEle)) { return; }

    let assetId = searchParams.get('asset_id');
    let assetName = searchParams.get('asset_name');

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