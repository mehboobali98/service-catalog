function generateId(str) {
  return str.toLowerCase().replace(/\s+/g, "_");
}

function isNewRequestPage() {
  const regex = /\/hc(\/en-us)?\/p\/requests\/new/;
  return isCorrectPage(regex);
}

function isServiceCatalogPage() {
  const regex = /\/hc(\/en-us)?\/p\/service_catalog/;
  return isCorrectPage(regex);
}

function isCorrectPage(regex) {
  return regex.test(window.location.pathname);
}

function setDataAttributes(element, dataAttributes) {
  if (dataAttributes && typeof dataAttributes === 'object') {
    Object.keys(dataAttributes).forEach(function(dataAttributeName) {
      const value = dataAttributes[dataAttributeName];
      if (value !== null && value !== undefined && value !== '') {
        element.data(dataAttributeName, value);
      }
    });
  }
}

export { generateId, isCorrectPage, isNewRequestPage, isServiceCatalogPage, setDataAttributes };