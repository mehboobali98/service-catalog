import { isSignedIn,
         signInPath,
         isRequestPage,
         isNewRequestPage,
         loadExternalFiles,
         isServiceCatalogPage   } from './utility.js';
import { RequestForm            } from './request_form.js';
import { NewRequestForm         } from './new_request_form.js';
import { STAGING_CDN_URL        } from './constant.js';       
import { ServiceCatalogBuilder  } from './service_catalog_builder.js';

class ServiceCatalogManager {
  constructor(initializationData) {
    this.timeStamp              = initializationData.timeStamp;
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
<<<<<<< HEAD:v1/service_catalog.js
              { type: 'link',   url: `${STAGING_CDN_URL}/shared/service_catalog/v1/service_catalog.css?${this.timeStamp}` },
=======
              { type: 'link',   url: 'https://mehboobali98.github.io/service-catalog/assets/stylesheets/service_catalog.css' },
>>>>>>> e06f96a4121310062ad6099c3e65efb197aba33f:src/service_catalog.js
              { type: 'script', url: 'https://code.jquery.com/jquery-3.6.0.min.js' }
           ];
  }
}

export { ServiceCatalogManager };