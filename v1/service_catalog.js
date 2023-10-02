import { RequestForm }            from './request_form.js';
import { NewRequestForm }         from './new_request_form.js';
import { ServiceCatalogBuilder }  from './service_catalog_builder.js';
import { getServiceCategoriesItems, getZendeskTicketFormData }   from './dummy_data.js'
import { isServiceCatalogPage, isNewRequestPage, isRequestPage, loadExternalFiles } from './utility.js';

class ServiceCatalogManager {
  constructor(demoData, zendeskFormData, ezoFieldId, ezoSubdomain) {
    // to-do: use actual demoData being passed
    this.demoData         = getServiceCategoriesItems();
    this.ezoFieldId       = ezoFieldId;
    this.ezoSubdomain     = ezoSubdomain;
    // to-do: use actual zendeskFormData being passed
    this.zendeskFormData  = getZendeskTicketFormData();

    loadExternalFiles(function() {
      this.initialize();
    })
  }

  initialize() {
    this.serviceCatalogBuilder = new ServiceCatalogBuilder(this.demoData, this.zendeskFormData, this.ezoSubdomain);
    debugger;
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
      new NewRequestForm(this.ezoFieldId, this.ezoSubdomain, this.zendeskFormData).updateNewRequestForm();
    } else if (isRequestPage()) {
      new RequestForm(this.ezoFieldId, this.ezoSubdomain).updateRequestForm();
    } else {
      // Handle other cases if needed
    }
  }
}

export { ServiceCatalogManager };