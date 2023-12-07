import { RequestForm }            from './request_form.js';
import { NewRequestForm }         from './new_request_form.js';
import { ServiceCatalogBuilder }  from './service_catalog_builder.js';
import { isServiceCatalogPage, isNewRequestPage, isRequestPage, loadExternalFiles } from './utility.js';

class ServiceCatalogManager {
  constructor(demoData, zendeskFormData, ezoFieldId, ezoSubdomain) {
    this.demoData         = demoData;
    this.ezoFieldId       = ezoFieldId;
    this.ezoSubdomain     = ezoSubdomain;
    this.zendeskFormData  = zendeskFormData;

    const files = this.filesToLoad();
    loadExternalFiles(files, () => {
      this.initialize();
    });
  }

  initialize() {
    this.serviceCatalogBuilder = new ServiceCatalogBuilder(this.demoData, this.zendeskFormData, this.ezoSubdomain);
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
      new NewRequestForm(this.ezoFieldId, this.ezoSubdomain, '13884803612562').updateRequestForm();
    } else if (isRequestPage()) {
      new RequestForm(this.ezoFieldId, this.ezoSubdomain).updateRequestForm();
    } else {
      // Handle other cases if needed
    }
  }

  filesToLoad() {
    return [
              { type: 'link',   url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css' },
              { type: 'link',   url: 'https://mehboobali98.github.io/service-catalog/v1/service_catalog.css' },
              { type: 'script', url: 'https://code.jquery.com/jquery-3.6.0.min.js' },
              { type: 'script', url: 'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2' }
           ];
  }
}

export { ServiceCatalogManager };