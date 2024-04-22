// The locale our app first shows
const defaultLocale = "en";

// The active locale
let locale;

// Gets filled with active locale translations
let translations = {};

// Load translations for the given locale and translate
// the page to this locale
function setLocale(newLocale) {
  debugger;
  if (newLocale === locale) return;
  debugger;
  fetchTranslationsFor(newLocale)
    .done(function(newTranslations) {
      locale = newLocale;
      translations = newTranslations;
      debugger;
      translatePage(translations);
    })
    .fail(function() {
      console.error("Failed to load translations.");
    });
}

// Retrieve translations JSON object for the given
// locale over the network
function fetchTranslationsFor(newLocale) {
  return $.getJSON(`https://mehboobali98.github.io/service-catalog/i18n/${newLocale}.json`);
}

// Replace the inner text of each element that has a
// data-i18n-key attribute with the translation corresponding
// to its data-i18n-key
function translatePage(translations) {
  debugger;
  $("[data-i18n]").each(function() {
    translateElement($(this));
  });
}

// Replace the inner text of the given HTML element
// with the translation in the active locale,
// corresponding to the element's data-i18n-key
function translateElement(element) {
  const key = element.attr("data-i18n-key");
  const translation = translations[key];
  debugger;
  if (translation !== undefined) {
    element.text(translation);
  } else {
    console.warn(`Translation for key '${key}' not found.`);
  }
}

export { setLocale };