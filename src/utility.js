import {  STAGING_CDN_URL,
          PRODUCTION_CDN_URL,
          SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING } from './constant.js';

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
    loadFile(file.url, file.type, onFileLoaded);
  });
}

function loadFile(url, fileType, callback) {
  const element = document.createElement(fileType);

  if (fileType === 'link') {
    element.rel   = 'stylesheet';
    element.type  = 'text/css';
    element.href  = url;
  } else if (fileType === 'script') {
    element.type    = 'text/javascript';
    element.src     = url;
    element.onload  = callback; // Execute the callback when the script is loaded
  }

  document.head.appendChild(element);
}

function serviceCatalogDataPresent(data) {
  return data && data.service_catalog_data && Object.keys(data.service_catalog_data).length > 0;
}

function isMyAssignedAssets(serviceCategory) {
  const regex = /^\d*_my_assigned_assets$/;
  return regex.test(serviceCategory);
}

function isSignedIn() {
  return !notSignedIn();
}

function notSignedIn() {
  return window.HelpCenter.user.role === 'anonymous';
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
  return `${PRODUCTION_CDN_URL}/shared/service_catalog/assets/images/svg/${imageName}.svg`;
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

export {  isSignedIn,
          signInPath,
          loadingIcon,
          isCorrectPage,
          isRequestPage,
          isNewRequestPage,
          loadExternalFiles,
          isMyAssignedAssets,
          getCssVariableValue,
          placeholderImagePath,
          isServiceCatalogPage,
          serviceCatalogDataPresent,
          getMyAssignedAssetsServiceItems };