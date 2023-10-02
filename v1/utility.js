function isRequestPage() {
  const regex = /\/hc(\/en-us)?\/requests\/(\d+)/;
  return isCorrectPage(regex);
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

export { isCorrectPage, isRequestPage, isNewRequestPage, isServiceCatalogPage };