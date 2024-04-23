import {
  TRANSLATIONS
} from './constant.js';

// The active locale
let locale;

// Load translations for the given locale and translate the page to this locale
function setLocale(newLocale) {
  if (Object.keys(TRANSLATIONS).length !== 0) { return translatePage(); }

  fetchTranslationsFor(newLocale)
    .done(function(newTranslations) {
      locale        = newLocale;
      $.extend(TRANSLATIONS, newTranslations);
      translatePage();
    })
    .fail(function() {
      console.error("Failed to load translations.");
    });
}

// Retrieve translations JSON object for the given locale over the network
function fetchTranslationsFor(newLocale) {
  return $.getJSON(`https://mehboobali98.github.io/service-catalog/i18n/${newLocale}.json`);
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
    } else {
      element.text(translation);
    }
  } else {
    console.warn(`Translation for key '${key}' not found.`);
  }
}

function generateI18nKey(columnLabel) {
  if (columnLabel == 'Asset #') {
    return 'asset_sequence_num';
  } else if (columnLabel == 'AIN') {
    return 'identifier';
  } else {
    return columnLabel.replace(/\s+/g, '-').toLowerCase()
  }
}

export {
  locale,
  setLocale,
  generateI18nKey
};
