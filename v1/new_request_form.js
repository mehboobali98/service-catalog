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

    $('#request_subject').val(updateSubject);
    $('#request_custom_fields_' + customFieldId).val(customFieldValue);
  }
}

function extractQueryParams(url) {
  return new URL(url).searchParams;
}

function updateSubject(subject, searchParams, serviceCategory) {
  switch (serviceCategory) {
    case 'My IT Assets':
      return subject + searchParams.get('asset_name');
    case 'Request New Software':
      return subject + searchParams.get('software_name');
    default:
      return subject; 
  }
}

export { updateNewRequestForm };