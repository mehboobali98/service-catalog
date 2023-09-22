import { updateNewRequestForm } from './new_request_form.js';
import { addMenuItem, buildServiceCatalog } from './service_catalog_builder.js';

$(document).ready(function(){
  addMenuItem('Service Catalog', '/hc/p/service_catalog', 'user-nav');
  initServiceCatalog();
});

function initServiceCatalog() {
  debugger;
  if (isServiceCatalogPage()) {
    buildServiceCatalog();
  } else if(isNewRequestPage()) {
    updateNewRequestForm();
  } else {
  }
}

function isServiceCatalogPage() {
  const regex = /\/hc(\/en-us)?\/p\/service_catalog/;
  return isCorrectPage(regex);
}

function isNewRequestPage() {
  const regex = /\/hc(\/en-us)?\/p\/requests\/new/;
  return isCorrectPage();
}

function isCorrectPage(regex) {
  const pathname = window.location.pathname;
  return regex.test(pathname);
}