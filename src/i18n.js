import { getLocale } from './utility.js';

// Load translations asynchronously
function loadTranslations() {
  debugger;
  return $.ajax({
    url: `i18n/${getLocale()}.json`,
    dataType: "json"
  });
}

// When the page content is ready...
$(document).ready(function() {
  loadTranslations().done(function(data) {
    debugger;
    translations[getLocale()] = data;
    // Find all elements that have the data-i18n-key attribute
    $("[data-i18n-key]").each(function() {
      translateElement($(this));
    });
  }).fail(function() {
    console.error("Failed to load translations.");
  });
});

// Replace the inner text of the given HTML element
// with the translation in the active locale,
// corresponding to the element's data-i18n-key
function translateElement(element) {
  const key = element.attr("data-i18n");
  const translation = translations[locale][key];
  if (translation !== undefined) {
    element.text(translation);
  } else {
    console.warn(`Translation for key '${key}' not found.`);
  }
}

export { loadTranslations };