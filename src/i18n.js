import {
  TRANSLATIONS,
  STAGING_CDN_URL,
  PRODUCTION_CDN_URL
} from './constant.js';

// Load translations for the given locale and translate the page to this locale
function setLocale(newLocale, shouldTranslatePage) {
  if (Object.keys(TRANSLATIONS).length !== 0 && shouldTranslatePage) { return translatePage(); }

  fetchTranslationsFor(newLocale)
    .done(function(newTranslations) {
      $.extend(TRANSLATIONS, newTranslations);
      if (shouldTranslatePage) { return translatePage(); }
    })
    .fail(function() {
      console.error("Failed to load translations.");
    });
}

// Retrieve translations JSON object for the given locale over the network
function fetchTranslationsFor(newLocale) {
  return $.getJSON(`${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/${newLocale}.json`);
}

// Replace the inner text of each element that has a
// data-i18n attribute with the translation corresponding to its data-i18n
function translatePage() {
  $("[data-i18n]").each(function() {
    translateElement($(this));
  });
}

// Replace the inner text of the given HTML element
// with the translation in the active locale, corresponding to the element's data-i18n
function translateElement(element) {
  const key = element.attr("data-i18n");

  const translation = TRANSLATIONS[key];
  if (translation !== undefined) {
    if (element.attr("placeholder") !== undefined) {
      element.attr("placeholder", translation);
    } else if (key == 'report-issue' || key == 'request') {
      var originalString = element.text();
      var stringToReplaceMapping = {
        'request':      'Request',
        'report-issue': 'Report Issue',
      };
      // Perform the string replacement for the key
      if (stringToReplaceMapping[key] !== undefined) {
        originalString = originalString.replace(stringToReplaceMapping[key], translation);
        element.text(originalString);
      }
    } else {
      element.text(translation);
    }
  } else {
    console.warn(`Translation for key '${key}' not found.`);
  }
}

function generateI18nKey(columnLabel) {
  if (columnLabel == 'Asset #') {
    return 'asset-sequence-num';
  } else if (columnLabel == 'AIN') {
    return 'identifier';
  } else if (columnLabel == 'Software License #') {
    return 'software-license-sequence-num';
  } else if (columnLabel == 'License Identification Number') {
    return 'software-license-identifier';
  } else {
    return columnLabel.replace(/\s+/g, '-').toLowerCase();
  }
}

function t(key, defaultString) {
  const translation = TRANSLATIONS[key];
  if (translation !== undefined) {
    return translation;
  } else {
    return defaultString || '';
  }
}

export {
  t,
  setLocale,
  generateI18nKey
};
