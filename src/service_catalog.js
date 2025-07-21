import { setLocale } from './i18n.js';

import {
  getLocale,
  isSignedIn,
  signInPath,
  isRequestPage,
  isLandingPage,
  isNewRequestPage,
  loadExternalFiles,
  isServiceCatalogPage
} from './utility.js';

import {
  STAGING_CDN_URL,
  PRODUCTION_CDN_URL,
  SERVICE_CATALOG_ANCHOR
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
    this.locale                     = getLocale();
    this.timeStamp                  = initializationData.timeStamp;
    this.ezoFieldId                 = initializationData.ezoFieldId;
    this.ezoSubdomain               = initializationData.ezoSubdomain;
    this.integrationMode            = initializationData.integrationMode || 'JWT';
    this.ezoServiceItemFieldId      = initializationData.ezoServiceItemFieldId;
    this.renderCatalogOnLandingPage = initializationData.renderCatalogOnLandingPage || false;

    const files = this.filesToLoad();
    loadExternalFiles(files, () => {
      this.initialize();
    });
  }

  initialize() {
    this.serviceCatalogBuilder = new ServiceCatalogBuilder(this.locale, this.ezoSubdomain, this.integrationMode);
    this.addServiceCatalogMenuItem();
    this.initServiceCatalog();
  }

  addServiceCatalogMenuItem() {
    this.serviceCatalogBuilder.addMenuItem(
      'Service Catalog',
      this.serviceCatalogUrl(),
      'user-nav'
    );
  }

  serviceCatalogUrl() {
    return this.renderCatalogOnLandingPage ? `/hc/${window.HelpCenter.user.locale}#${SERVICE_CATALOG_ANCHOR}` : '/hc/p/service_catalog';
  }

  initServiceCatalog() {
    setLocale(this.locale, true);
    if (this.shouldRenderServiceCatalog()) {
      this.handleServiceCatalogRequest();
    } else if (isNewRequestPage()) {
      new NewRequestForm(this.locale, this.ezoFieldId, this.ezoSubdomain, this.ezoServiceItemFieldId, this.integrationMode).updateRequestForm();
    } else if (isRequestPage()) {
      new RequestForm(this.locale, this.ezoFieldId, this.ezoSubdomain, this.ezoServiceItemFieldId, this.integrationMode).updateRequestForm();
    } else {
      // Handle other cases if needed
    }
  }

  shouldRenderServiceCatalog() {
    return this.shouldRenderCatalogOnLandingPage() || isServiceCatalogPage();
  }

  shouldRenderCatalogOnLandingPage() {
    return this.renderCatalogOnLandingPage && isLandingPage();
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
              { type: 'link',   url: `${STAGING_CDN_URL}/shared/service_catalog/dist/public/bootstrap.css`, placement: 'prepend' },
              { type: 'link',   url: `${STAGING_CDN_URL}/shared/service_catalog/dist/public/service_catalog.css?${this.timeStamp}`},
              { type: 'script', url: 'https://code.jquery.com/jquery-3.6.0.min.js' }
           ];
  }
}

export { ServiceCatalogManager };