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

function loadExternalFiles(callback) {
  const filesToLoad = [
    { type: 'link',   url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css' },
    { type: 'link',   url: 'https://mehboobali98.github.io/service-catalog/v1/service_catalog.css' },
    { type: 'script', url: 'https://code.jquery.com/jquery-3.6.0.min.js' },
    { type: 'script', url: 'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2' },
    { type: 'script', url: 'https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/js/select2.min.js' }
  ];

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

export { isCorrectPage, isRequestPage, isNewRequestPage, isServiceCatalogPage, loadExternalFiles };