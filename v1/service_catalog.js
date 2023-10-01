import { updateRequestFrom } from './request_form.js';
import { updateNewRequestForm } from './new_request_form.js';
import { addMenuItem, buildServiceCatalog } from './service_catalog_builder.js';
import { isServiceCatalogPage, isNewRequestPage, isRequestPage } from './utility.js';

class ServiceCatalogManager {
  constructor() {
    this.initialize();
  }

  initialize() {
    this.addServiceCatalogMenuItem();
    this.initServiceCatalog();
  }

  addServiceCatalogMenuItem() {
    addMenuItem('Service Catalog', '/hc/p/service_catalog', 'user-nav');
  }

  initServiceCatalog() {
    if (isServiceCatalogPage()) {
      buildServiceCatalog();
    } else if (isNewRequestPage()) {
      this.updateNewRequestForm();
    } else if (isRequestPage()) {
      this.updateRequestForm();
    } else {
      // Handle other cases if needed
    }
  }

  updateNewRequestForm() {
    updateNewRequestForm();
  }

  updateRequestForm() {
    updateRequestFrom();
  }
}

export { ServiceCatalogManager };