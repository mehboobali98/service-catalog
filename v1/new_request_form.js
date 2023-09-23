function updateNewRequestForm() {
  debugger;
  if ($('.nesty-input')[0].text != "-") {
    alert('hello word');
    // detect request form
    // update subject, service item field if needed
    // prepopulate it asset as well.
  }
}

function extractQueryParams(url) {
  return new URL(url).searchParams;
}

export { updateNewRequestForm };