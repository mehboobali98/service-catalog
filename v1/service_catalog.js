import { RequestForm }            from './request_form.js';
import { NewRequestForm }         from './new_request_form.js';
import { mapHelpCenterStyling }   from './utility.js';
import { ServiceCatalogBuilder }  from './service_catalog_builder.js';
import { isSignedIn, signInPath, isServiceCatalogPage, isNewRequestPage, isRequestPage, loadExternalFiles } from './utility.js';

class ServiceCatalogManager {
  constructor(initializationData) {
    this.ezoFieldId             = initializationData.ezoFieldId;
    this.ezoSubdomain           = initializationData.ezoSubdomain;
    this.ezoServiceItemFieldId  = initializationData.ezoServiceItemFieldId;

    const files = this.filesToLoad();
    loadExternalFiles(files, () => {
      this.initialize();
    });
  }

  initialize() {
    this.serviceCatalogBuilder = new ServiceCatalogBuilder(this.ezoSubdomain);
    this.addServiceCatalogMenuItem();
    this.initServiceCatalog();
  }

  addServiceCatalogMenuItem() {
    this.serviceCatalogBuilder.addMenuItem('Service Catalog', '/hc/p/service_catalog', 'user-nav');
  }

  initServiceCatalog() {
    if (isServiceCatalogPage()) {
      this.handleServiceCatalogRequest();
    } else if (isNewRequestPage()) {
      new NewRequestForm(this.ezoFieldId, this.ezoSubdomain, this.ezoServiceItemFieldId).updateRequestForm();
    } else if (isRequestPage()) {
      new RequestForm(this.ezoFieldId, this.ezoSubdomain).updateRequestForm();
    } else {
      // Handle other cases if needed
    }
  }

  handleServiceCatalogRequest() {
    if (isSignedIn()) {

      this.serviceCatalogBuilder.buildServiceCatalog();
    } else {
      // to-do: Verify this
      window.location.href = signInPath(); 
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