import { getServiceCategoryItems, findServiceCategoryItem } from './dummy_data.js';

function updateNewRequestForm() {
  if ($('.nesty-input')[0].text === "-") { return; }
  let searchParams         = extractQueryParams(window.location);

  const serviceCategory      = searchParams.get('service_category');
  const serviceCategoryItems = getServiceCategoryItems(serviceCategory);

  if (serviceCategoryItems) {
    const serviceCategoryItem = findServiceCategoryItem(searchParams, serviceCategoryItems.serviceItems);
    if (serviceCategoryItem) {
      const ticketFormData    = serviceCategoryItem.ticketFormData;
      const customFieldId     = ticketFormData.custom_field_id;
      const customFieldValue  = ticketFormData.custom_field_value;
      const ticketFormSubject = ticketFormData.ticket_form_subject;

      $('#request_subject').val(updateSubject(ticketFormSubject, searchParams, serviceCategory));
      $('#request_custom_fields_' + customFieldId).val(customFieldValue);
    }
  }
  getTokenAndFetchAssignedAssets();
}

function extractQueryParams(url) {
  return new URL(url).searchParams;
}

function getTokenAndFetchAssignedAssets() {
  return withToken().then(token => {
    if (token) {
      const options = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'ngrok-skip-browser-warning': true
        }
      };

      const url = 'https://' + ezoSubdomain + '/webhooks/zendesk/get_assigned_assets.json';
      return populateAssignedAssets(url, options);
    }
  });
}

function withToken() {
  return $.getJSON('/hc/api/v2/integration/token').then(data => data.token);
}

function populateAssignedAssets(url, options) {
  fetch(url, options).then(response => response.json())
                     .then(data => {

    const assetsData = { data: [] };
    const ezoCustomFieldEle = $('#request_custom_fields_' + ezoFieldId);

    if (data.assets) {
      $.each(data.assets, function (index, asset) {
        assetsData.data[index] = { id: asset.sequence_num, text: `Asset # ${asset.sequence_num} - ${asset.name}` }
      });
    }
    ezoCustomFieldEle.hide();
    ezoCustomFieldEle.after("<select multiple='multiple' id='ezo-asset-select' style='width: 100%;'></select>");

    renderSelect2PaginationForUsers($('#ezo-asset-select'), url, options);
    preselectAssetsCustomField(extractQueryParams(window.location));

    $('form.request-form').on('submit', function () {
      var selectedIds = $('#ezo-asset-select').val();
      if (selectedIds.length > 0) {
        let data = assetsData.data.filter(asset => selectedIds.includes(asset.id.toString()));
        data = data.map((asset) => {
          let assetObj = { [asset.id]: asset.text };
            return assetObj;
          } 
        );
        ezoCustomFieldEle.val(JSON.stringify({ assets: data }));
      }
    });
  });
}

function renderSelect2PaginationForUsers(element, url, options) {
  const parentElementSelector = 'body';
  element.select2({
    dropdownParent: element.parents(parentElementSelector),
    ajax: {
      url:      url,
      delay:    250,
      dataType: 'json',
      headers: options.headers,
      data: function (params) {
        var query = {
          page:          params.page || 1,
          search:        params.term,
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
          results:      results,
          pagination: { more: data.page < data.total_pages }
        };
      }
    },
  });
}

function updateSubject(subject, searchParams, serviceCategory) {
  switch (serviceCategory) {
    case 'my_it_assets':
      return subject + searchParams.get('asset_name');
    case 'request_new_software':
      return subject + searchParams.get('software_name');
    default:
      return subject; 
  }
}

function preselectAssetsCustomField(searchParams) {
  let ezoCustomFieldEle = $('#request_custom_fields_' + ezoFieldId);
  if (!assetsCustomFieldPresent(ezoCustomFieldEle)) { return; }

  let assetId    = searchParams.get('asset_id');
  let assetName  = searchParams.get('asset_name');

  if (!assetName || !assetId) { return; }

  let ezoSelectEle = $('#ezo-asset-select');
  if (ezoSelectEle.length === 0) { renderEzoSelect2Field(ezoCustomFieldEle); }

  // Set the value, creating a new option if necessary
  if (ezoSelectEle.find("option[value='" + assetId + "']").length) {
      ezoSelectEle.val(assetId).trigger('change');
  } else { 
    var newOption = new Option(assetName, assetId, true, true);
    ezoSelectEle.append(newOption).trigger('change');
  }
}

function assetsCustomFieldPresent(ezoCustomFieldEle) {
  return ezoCustomFieldEle.length > 0;
}

function renderEzoSelect2Field(ezoCustomFieldEle) {
  ezoCustomFieldEle.hide();
  ezoCustomFieldEle.after("<select multiple='multiple' id='ezo-asset-select' style='width: 100%;'></select>");
}


export { updateNewRequestForm };