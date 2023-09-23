import { updateNewRequestForm } from './new_request_form.js';
import { addMenuItem, buildServiceCatalog } from './service_catalog_builder.js';
import { isServiceCatalogPage, isNewRequestPage } from './utility.js'

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