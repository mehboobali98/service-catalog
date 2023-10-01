import { updateRequestFrom }      from './request_form.js';
import { updateNewRequestForm }   from './new_request_form.js';
import { ServiceCatalogBuilder }  from './service_catalog_builder.js';
import { isServiceCatalogPage, isNewRequestPage, isRequestPage } from './utility.js';

class ServiceCatalogManager {
  constructor(demoData, zendeskFormData, ezoFieldId, ezoSubdomain) {
    this.demoData         = demoData;
    this.ezoFieldId       = ezoFieldId;
    this.ezoSubdomain     = ezoSubdomain;
    this.zendeskFormData  = zendeskFormData;

    this.serviceCatalogBuilder = new ServiceCatalogBuilder(this.demoData, this.zendeskFormData, this.ezoSubdomain);
    this.initialize();
  }

  initialize() {
    this.addServiceCatalogMenuItem();
    this.initServiceCatalog();
  }

  addServiceCatalogMenuItem() {
    this.serviceCatalogBuilder.addMenuItem('Service Catalog', '/hc/p/service_catalog', 'user-nav');
  }

  initServiceCatalog() {
    if (isServiceCatalogPage()) {
      this.serviceCatalogBuilder.buildServiceCatalog();
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