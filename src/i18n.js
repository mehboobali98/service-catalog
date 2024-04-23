import {
  TRANSLATIONS
} from './constant.js';

// The active locale
let locale;

// Load translations for the given locale and translate the page to this locale
function setLocale(newLocale) {
  if (newLocale === locale) return;

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
  debugger
  if (translation !== undefined) {
    element.text(translation);
  } else {
    console.warn(`Translation for key '${key}' not found.`);
  }
}

export { setLocale };