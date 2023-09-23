function updateNewRequestForm() {
  if ($('.nesty-input')[0].text != "-") {
    // detect request form
    // update subject, service item field if needed
    // prepopulate it asset as well.
    searchParams = extractQueryParams(window.location);
    const customFieldId = searchParams.get('custom_field_id');
    $('#request_subject').val(searchParams.get('ticket_form_subject');
    $('#request_custom_fields_' + customFieldId).val(searchParams.get('custom_field_value'));
  }
}

function extractQueryParams(url) {
  return new URL(url).searchParams;
}

export { updateNewRequestForm };