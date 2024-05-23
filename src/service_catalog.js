import { setLocale } from './i18n.js';

import {
  getLocale,
  isSignedIn,
  signInPath,
  isRequestPage,
  isNewRequestPage,
  loadExternalFiles,
  isServiceCatalogPage
} from './utility.js';

import {
  STAGING_CDN_URL,
  PRODUCTION_CDN_URL
} from './constant.js';

import {
  RequestForm
} from './request_form.js';

import {
  NewRequestForm
} from './new_request_form.js';

import {
  ServiceCatalogBuilder
} from './service_catalog_builder.js';

class ServiceCatalogManager {
  constructor(initializationData) {
    this.locale                 = getLocale();
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
    this.serviceCatalogBuilder = new ServiceCatalogBuilder(this.locale, this.ezoSubdomain);
    this.addServiceCatalogMenuItem();
    this.initServiceCatalog();
  }

  addServiceCatalogMenuItem() {
    this.serviceCatalogBuilder.addMenuItem('Service Catalog', '/hc/p/service_catalog', 'user-nav');
  }

  initServiceCatalog() {
    setLocale(this.locale, false);
    if (isServiceCatalogPage()) {
      this.handleServiceCatalogRequest();
    } else if (isNewRequestPage()) {
      new NewRequestForm(this.locale, this.ezoFieldId, this.ezoSubdomain, this.ezoServiceItemFieldId).updateRequestForm();
    } else if (isRequestPage()) {
      new RequestForm(this.locale, this.ezoFieldId, this.ezoSubdomain, this.ezoServiceItemFieldId).updateRequestForm();
    } else {
      // Handle other cases if needed
    }
  }

  handleServiceCatalogRequest() {
    if (isSignedIn()) {
      this.serviceCatalogBuilder.buildServiceCatalog();
    } else {
      window.location.href = signInPath(); 
    }
  }

  filesToLoad() {
    return [
              { type: 'link',   url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css', placement: 'prepend' },
              { type: 'link',   url: `${STAGING_CDN_URL}/shared/service_catalog/dist/public/service_catalog.css?${this.timeStamp}`},
              { type: 'script', url: 'https://code.jquery.com/jquery-3.6.0.min.js' }
           ];
  }
}

export { ServiceCatalogManager };