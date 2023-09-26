function generateId(str) {
  return str.toLowerCase().replace(/\s+/g, "_");
}

function isNewRequestPage() {
  const regex = /\/hc(\/en-us)?\/requests\/new/;
  return isCorrectPage(regex);
}

function isServiceCatalogPage() {
  const regex = /\/hc(\/en-us)?\/p\/service_catalog/;
  return isCorrectPage(regex);
}

function isCorrectPage(regex) {
  return regex.test(window.location.pathname);
}

function getTokenAndFetchAssignedAssets(endPoint) {
  return withToken().then(token => {
    debugger;
    if (token) {
      const options = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'ngrok-skip-browser-warning': true
        }
      };

    debugger;
    const url = 'https://' + ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json';
    debugger;
    fetch(url, options)
      .then(response => response.json())
      .then(data => {
        debugger;
      });
    }
  });
}

function withToken() {
  return $.getJSON('/hc/api/v2/integration/token').then(data => data.token);
}

export { generateId, isCorrectPage, isNewRequestPage, isServiceCatalogPage, getTokenAndFetchAssignedAssets };