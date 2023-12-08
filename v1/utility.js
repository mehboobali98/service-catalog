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
  return regex.test(window.location.pathname);
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

function notSignedIn() {
  return !isSignedIn();
}

function isSignedIn() {
  return window.HelpCenter.user.role === 'anonymous';
}

function extractServiceItemsWithCategory(data) {
  const extractedServiceItems = [];

  debugger;
  for (const categoryName in data) {
    if (data.hasOwnProperty(categoryName)) {
      let serviceItems            = null;
      const serviceCategory       = data[categoryName];
      const serviceCategoryLabel  = serviceCategory.title;

      debugger;

      if (isMyAssignedAssets(categoryName)) {
        serviceItems = serviceCategory.service_items['assets'].concat(serviceCategory.service_items['software_entitlements']);
      } else {
        serviceItems = JSON.parse(serviceCategory.service_items);
      }

      debugger;
      if (serviceItems) {
        for (const serviceItem of serviceItems) {
          // Add the service category name to the service item
          debugger;
          serviceItem.serviceCategoryName = categoryName;
          extractedServiceItems.push(serviceItem);
        }
      }
    }
  }

  debugger;

  return extractedServiceItems;
}

export { isCorrectPage, isRequestPage, isNewRequestPage, isServiceCatalogPage, isMyAssignedAssets, loadExternalFiles, extractServiceItemsWithCategory };