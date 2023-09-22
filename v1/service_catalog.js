import { addMenuItem, buildServiceCatalog } from './service_catalog_builder.js';

$(document).ready(function(){
  addMenuItem('Service Catalog', '/hc/p/service_catalog', 'user-nav');
  initServiceCatalog();
});

function initServiceCatalog() {
  if (!isServiceCatalogPage()) { return; }

  buildServiceCatalog();
}

function isServiceCatalogPage() {
  const pattern  = /\/hc(\/en-us)?\/p\/service_catalog/;
  const pathname = window.location.pathname;
  return pattern.test(pathname);
}