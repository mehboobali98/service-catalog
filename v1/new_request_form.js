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

    $('#request_subject').val(ticketFormSubject);
    $('#request_custom_fields_' + customFieldId).val(customFieldValue);
  }
}

function extractQueryParams(url) {
  return new URL(url).searchParams;
}

export { updateNewRequestForm };