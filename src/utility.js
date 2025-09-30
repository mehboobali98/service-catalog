import {
  STAGING_CDN_URL,
  PRODUCTION_CDN_URL,
  SERVICE_CATALOG_ANCHOR,
  AGENT_REQUEST_SUBMISSION_SETTING_BLOG,
  SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING,
  SERVICE_CATALOG_BACKGROUND_MAPPING,
  DEFAULT_SERVICE_CATALOG_BACKGROUND
} from './constant.js';

function isRequestPage() {
  const regex = /\/requests\/(\d+)$/;
  return isCorrectPage(regex);
}

function isNewRequestPage() {
  const regex = /\/requests\/new$/;
  return isCorrectPage(regex);
}

function isServiceCatalogPage() {
  const regex = /\/service_catalog$/i;
  return isCorrectPage(regex);
}

function isLandingPage() {
  const regex = new RegExp(`/hc/${window.HelpCenter.user.locale}/?$`, "i");

  return isCorrectPage(regex);
}

function shouldScrollToCatalog() {
  return window.location.hash == `#${SERVICE_CATALOG_ANCHOR}`;
}

function isCorrectPage(regex) {
  return regex.test(currentPage());
}

function currentPage() {
  return window.location.pathname;
}

function loadExternalFiles(filesToLoad, callback) {
  let loadedFiles = 0;

  function onFileLoaded() {
    loadedFiles++;

    if (loadedFiles === filesToLoad.filter(file => file.type === 'script').length) {
      // All files are loaded; execute the callback
      callback();
    }
  }

  filesToLoad.forEach((file) => {
    loadFile(file, onFileLoaded);
  });
}

function loadFile(file, callback) {
  const url        = file.url;
  const fileType   = file.type;
  const element    = document.createElement(fileType);
  const placement  = file.placement || 'append';

  if (fileType === 'link') {
    element.rel   = 'stylesheet';
    element.type  = 'text/css';
    element.href  = url;
  } else if (fileType === 'script') {
    element.type    = 'text/javascript';
    element.src     = url;
    element.onload  = callback; // Execute the callback when the script is loaded
  }

  if (placement == 'append') {
    document.head.appendChild(element);
  } else if (placement == 'prepend') {
    document.head.insertBefore(element, document.head.firstChild);
  }
}

function serviceCatalogDataPresent(data) {
  return data && data.service_catalog_data && Object.keys(data.service_catalog_data).length > 0;
}

function isMyAssignedAssets(serviceItem) {
  if (!serviceItem) return false;
  
  const resourceAssetTypes = ['FixedAsset', 'StockAsset', 'VolatileAsset', 'SoftwareLicense'];
  const assignedAssetTypes = ['assigned_asset', 'assigned_software_license'];
  const allAssetTypes = [...resourceAssetTypes, ...assignedAssetTypes];
  
  // Check both resource_type and type keys
  const resourceType = serviceItem.resource_type;
  const type = serviceItem.type;
  
  return allAssetTypes.includes(resourceType) || allAssetTypes.includes(type);
}

function isSignedIn() {
  return !notSignedIn();
}

function notSignedIn() {
  return userRole() === 'anonymous';
}

function userRole() {
  return window.HelpCenter.user.role;
}

function returnToPath() {
  return window.location.href;
}

function signInPath() {
  const queryParams = {};
  queryParams.return_to = returnToPath();

  const url = `${origin()}/hc/signin?${$.param(queryParams)}`;
  return url;
}

function origin() {
  return window.location.origin;
}

function placeholderImagePath(serviceItem) {
  let type      = serviceItem.type;
  let imageName = null;
  if (type) {
    imageName = SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING[type];
  } else {
    imageName = SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING['service_item'];
  }
  return `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/${imageName}.svg`;
}

function getCssVariableValue(variable) {
  getComputedStyle(document.documentElement).getPropertyValue(`--${variable}`);
}

function loadingIcon(containerClass) {
  const loadingIconContainer    = $('<div>').attr('id', 'loading_icon_container')
                                            .addClass(containerClass);
  const loadingIconFlex         = $('<div>').addClass('d-flex flex-column align-items-center');
  // to-do: store this on cdn and use.
  const loadingIcon             = $('<img>').attr({ 'src': 'https://s2.svgbox.net/loaders.svg?ic=puff',
                                                      'alt': 'Loading...'
                                                 });
  loadingIconFlex.append(loadingIcon);
  loadingIconContainer.append(loadingIconFlex);

  return loadingIconContainer;
}

function getMyAssignedAssetsServiceItems(serviceCategoryItems) {
  let assetServiceItems           = serviceCategoryItems.service_items['assets'] || [];
  let softwareLicenseServiceItems = serviceCategoryItems.service_items['software_entitlements'] || [];
  return assetServiceItems.concat(softwareLicenseServiceItems);
}

function getLocale() {
  return window.HelpCenter.user.locale.split('-')[0];
}

function requestSubmissionSettingMessageForAgent() {
  return `Please enable access to request forms via Guide Admin > Guide Settings. Read the guide <a href='${AGENT_REQUEST_SUBMISSION_SETTING_BLOG}' target='_blank'>here</a>.`;
}

function setCookieForXHours(noOfHours, elementId) {
  let date = new Date();
  date.setTime(date.getTime() + (noOfHours * 60 * 60 * 1000));
  let expires = "; expires=" + date.toUTCString();
  document.cookie = elementId + '=true' + expires + "; path=/";
}

function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function getServiceItems(serviceCategoryData) {
  const serviceItems = serviceCategoryData.service_items;
  
  if (!serviceItems) return [];
  if (Array.isArray(serviceItems)) return serviceItems;
  
  // Check if it's assets structure by looking at first item
  const firstItem = getFirstItemFromStructure(serviceItems);
  if (firstItem && isMyAssignedAssets(firstItem)) {
    return getMyAssignedAssetsServiceItems(serviceCategoryData);
  }
  
  // Try parsing as JSON string
  if (typeof serviceItems === 'string') {
    try {
      return JSON.parse(serviceItems);
    } catch {
      return [];
    }
  }
  
  return [];
}

function getFirstItemFromStructure(serviceItems) {
  if (Array.isArray(serviceItems)) return serviceItems[0];
  if (typeof serviceItems === 'object') {
    const assets = serviceItems['assets'] || [];
    const software = serviceItems['software_entitlements'] || [];
    return assets[0] || software[0];
  }
  return null;
}

function getServiceCatalogBackground(hostname) {
  // Extract subdomain from hostname (e.g., "mehboobastesting" from "mehboobastesting.assetsonar.com")
  const subdomain = hostname.split('.assetsonar.com')[0];
  
  // Get background URL from mapping or use default
  const backgroundImage = SERVICE_CATALOG_BACKGROUND_MAPPING[subdomain];
  if (backgroundImage) {
    // return `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/${backgroundImage}`;
    return `https://mehboobali98.github.io/service-catalog/dist/public/service-catalog-bg-volarisgroup.png`;
  }
  
  return DEFAULT_SERVICE_CATALOG_BACKGROUND;
}

export {
  userRole,
  getCookie,
  getLocale,
  isSignedIn,
  signInPath,
  loadingIcon,
  isLandingPage,
  isCorrectPage,
  isRequestPage,
  getServiceItems,
  isNewRequestPage,
  loadExternalFiles,
  setCookieForXHours,
  isMyAssignedAssets,
  getCssVariableValue,
  placeholderImagePath,
  isServiceCatalogPage,
  shouldScrollToCatalog,
  serviceCatalogDataPresent,
  getMyAssignedAssetsServiceItems,
  requestSubmissionSettingMessageForAgent,
  getServiceCatalogBackground
};
