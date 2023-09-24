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
  let ezoCustomFieldEle = $('#request_custom_fields_' + ezoFieldId);
  if (!assetsCustomFieldPresent(ezoCustomFieldEle)) { return; }

  let assetId    = searchParams.get('asset_id');
  let assetName  = searchParams.get('asset_name');

  if (!assetName || !assetId) { return; }

  renderEzoSelect2Field(ezoCustomFieldEle);

  // Set the value, creating a new option if necessary
  if ($('#ezo-asset-select').find("option[value='" + assetId + "']").length) {
      $('#ezo-asset-select').val(assetId).trigger('change');
  } else { 
    var newOption = new Option(assetName, assetId, true, true);
    $('#ezo-asset-select').append(newOption).trigger('change');
  }
  debugger;
}

function assetsCustomFieldPresent(ezoCustomFieldEle) {
  return ezoCustomFieldEle.length > 0;
}

function renderEzoSelect2Field(ezoCustomFieldEle) {
  let ezoSelectEle = $('#ezo-asset-select');
  debugger;
  if (ezoSelectEle.length > 0) { return };

  ezoCustomFieldEle.hide();
  // let ezoSelect2Field = $('select').attr('id', 'ezo-asset-select')
  //                                  .attr('multiple', 'multiple')
  //                                  .addClass('w-100');

  //ezoCustomFieldEle.after(ezoSelect2Field);
  ezoCustomFieldEle.after("<select multiple='multiple' id='ezo-asset-select' style='width: 100%;'></select>");
}


export { updateNewRequestForm };