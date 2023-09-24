import { getServiceCategoryItems } from './dummy_data.js';

function updateNewRequestForm() {
  if ($('.nesty-input')[0].text === "-") { return; }

  let searchParams         = extractQueryParams(window.location);
  let serviceCategory      = searchParams.get('service_category');
  let serviceCategoryItems = getServiceCategoryItems(serviceCategory);

  if (serviceCategoryItems) {
    let ticketFormData    = serviceCategoryItems.ticketFormData;

    let customFieldId     = ticketFormData.custom_field_id;
    let customFieldValue  = ticketFormData.custom_field_value;
    let ticketFormSubject = ticketFormData.ticket_form_subject;

    $('#request_subject').val(updateSubject(ticketFormSubject, searchParams, serviceCategory));
    $('#request_custom_fields_' + customFieldId).val(customFieldValue);
  }
  preselectAssetsCustomField(searchParams);
}

function extractQueryParams(url) {
  return new URL(url).searchParams;
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
  debugger;
  if (!assetsCustomFieldPresent(ezoFieldId)) { return; }

  let assetId    = searchParams.get('asset_id');
  let assetName  = searchParams.get('asset_name');

  debugger;
  if (!assetName || !assetId) { return; }

  // Set the value, creating a new option if necessary
  if ($('#ezo-asset-select').find("option[value='" + assetId + "']").length) {
      $('#ezo-asset-select').val(assetId).trigger('change');
  } else { 
    var newOption = new Option(assetName, assetId, true, true);
    $('#ezo-asset-select').append(newOption).trigger('change');
  } 
}

function assetsCustomFieldPresent(ezoFieldId) {
  return $('#request_custom_fields_' + ezoFieldId).length > 0;
}


export { updateNewRequestForm };