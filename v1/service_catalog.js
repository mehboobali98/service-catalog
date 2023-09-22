import { updateNewRequestForm } from './new_request_form.js';
import { addMenuItem, buildServiceCatalog } from './service_catalog_builder.js';

$(document).ready(function(){
  addMenuItem('Service Catalog', '/hc/p/service_catalog', 'user-nav');
  initServiceCatalog();
});

function initServiceCatalog() {
  if (isServiceCatalogPage()) {
    buildServiceCatalog();
  } else if(isNewRequestPage()) {
    updateNewRequestForm();
  } else {

  }
}

function isServiceCatalogPage() {
  return isCorrectPage(/\/hc(\/en-us)?\/p\/service_catalog/)
}

function isNewRequestPage() {
  return isCorrectPage(/\/hc(\/en-us)?\/p\/requests\/new/);
}

function isCorrectPage(regex) {
  const pathname = window.location.pathname;
  return regex.test(pathname)
}