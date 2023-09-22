function generateId(str) {
  return str.toLowerCase().replace(/\s+/g, "_");
}

function isNewRequestPage() {
  const regex = /\/hc(\/en-us)?\/p\/requests\/new/;
  return isCorrectPage();
}

function isServiceCatalogPage() {
  const regex = /\/hc(\/en-us)?\/p\/service_catalog/;
  return isCorrectPage(regex);
}

function isCorrectPage(regex) {
  return regex.test(window.location.pathname);
}

function setDataAttributes(element, dataAttributes) {
  Object.keys(dataAttributes).forEach(function(dataAttributeName) {
    element.data(dataAttributeName, dataAttributes[dataAttributeName]);
  });
}


export { generateId, isCorrectPage, isNewRequestPage, isServiceCatalogPage, setDataAttributes };