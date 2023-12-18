import { SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING } from './constant.js';

function isRequestPage() {
  const regex = /\/hc(\/en-us)?\/requests\/(\d+)/;
  return isCorrectPage(regex);
}

function isNewRequestPage() {
  const regex = /\/hc(\/en-us)?\/requests\/new/;
  return isCorrectPage(regex);
}

function isServiceCatalogPage() {
  const regex = /\/hc(\/en-us)?\/p\/service_catalog/;
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

function extractServiceItemsWithCategory(data) {
  const extractedServiceItems = [];
  for (const categoryName in data) {
    if (data.hasOwnProperty(categoryName)) {
      let serviceItems            = null;
      const serviceCategory       = data[categoryName];
      const serviceCategoryLabel  = serviceCategory.title;

      if (isMyAssignedAssets(categoryName)) {
        serviceItems = serviceCategory.service_items['assets'].concat(serviceCategory.service_items['software_entitlements']);
      } else {
        serviceItems = JSON.parse(serviceCategory.service_items);
      }

      if (serviceItems) {
        for (const serviceItem of serviceItems) {
          // Add the service category name to the service item
          serviceItem.serviceCategoryName = categoryName;
          extractedServiceItems.push(serviceItem);
        }
      }
    }
  }

  return extractedServiceItems;
}

function returnToPath() {
  return window.location.href;
}

function signInPath() {
  const queryParams = {};
  queryParams.return_to = returnToPath();

  const url = origin() + '/hc/signin' + '?' + $.param(queryParams);
  return url;
}

function origin() {
  return window.location.origin;
}

function placeholderImagePath(serviceItem) {
  debugger;
  let type      = serviceItem.type;
  let imageName = null;
  if (type) {
    imageName = SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING[type];
  } else {
    imageName = SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING['service_item'];
  }
  return `https://raw.githubusercontent.com/mehboobali98/service-catalog/enable_search_in_sc/v1/assets/svgs/${imageName}.svg`;
}

function getCssVariableValue(variable) {
  getComputedStyle(document.documentElement).getPropertyValue(`--${variable}`);
}

export {  isSignedIn,
          signInPath,
          isCorrectPage,
          isRequestPage,
          isNewRequestPage,
          loadExternalFiles,
          isMyAssignedAssets,
          getCssVariableValue,
          placeholderImagePath,
          isServiceCatalogPage,
          extractServiceItemsWithCategory };