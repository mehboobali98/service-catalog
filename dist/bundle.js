(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ServiceCatalog = global.ServiceCatalog || {}, global.ServiceCatalog.js = {})));
})(this, (function (exports) { 'use strict';

  const TRANSLATIONS                            = {};
  const PRODUCTION_CDN_URL                      = 'https://cdn.ezassets.com';
  const DEFAULT_FIELD_VALUE                     = '--';
  const DEFAULT_TRUNCATE_LENGTH                 = 30;
  const CARD_FIELD_VALUE_TRUNCATE_LENGTH        = 15;
  const CUSTOMER_EFFORT_SURVEY_COMMENT_LENGTH   = 1000;
  const AGENT_REQUEST_SUBMISSION_SETTING_BLOG   = 'https://support.zendesk.com/hc/en-us/articles/4408828251930-Enabling-agents-to-access-request-forms';
  const SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING  = {
    'service_item':                'service_item_placeholder',
    'assigned_asset':              'asset_placeholder',
    'assigned_software_license':   'software_license_placeholder'
  };

  // Load translations for the given locale and translate the page to this locale
  function setLocale(newLocale, shouldTranslatePage) {
    if (Object.keys(TRANSLATIONS).length !== 0 && shouldTranslatePage) { return translatePage(); }

    fetchTranslationsFor(newLocale)
      .done(function(newTranslations) {
        $.extend(TRANSLATIONS, newTranslations);
        { return translatePage(); }
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

  function isMyAssignedAssets(serviceCategory) {
    const regex = /^\d*_my_assigned_assets$/i;
    return regex.test(serviceCategory);
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

  class SvgBuilder {
    constructor() {
      this.containerClass = 'kb-svg-icon';
    }

    build(svgType, container, containerClass) {
      let svgCode = this.getSvgCode(svgType);
      return $('<span>').addClass(this.containerClass)
                        .append(svgCode);
    }

    getSvgCode(svgType) {
      switch(svgType) {
        case 'anger':
          return this.angerSvg();
        case 'happy':
          return this.happySvg();
        case 'loving':
          return this.lovingSvg();
        case 'satisfied':
          return this.satisfiedSvg();
        case 'disappointed':
          return this.disappointedSvg();
        case 'flashErrorSvg':
          return this.flashErrorSvg();
        default:
          // Handle invalid svgType
          return '';
      }
    }

    angerSvg() {
      return `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#EDEDED" fill-opacity="0.4" />
              <path d="M24 38C31.732 38 38 31.732 38 24C38 16.268 31.732 10 24 10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38Z" fill="url(#paint0_linear_4523_4191)" />
              <path d="M24 38C31.732 38 38 31.732 38 24C38 16.268 31.732 10 24 10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38Z" fill="url(#paint1_linear_4523_4191)" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M30.8671 23.2996C31.1312 23.1177 31.1978 22.7561 31.0159 22.492C30.834 22.2279 30.4724 22.1613 30.2083 22.3433L26.8114 24.6834C26.5473 24.8653 26.4807 25.2269 26.6626 25.491C26.8445 25.7551 27.2061 25.8217 27.4702 25.6397L27.9855 25.2847C27.9465 25.4914 27.9255 25.7114 27.9255 25.9398C27.9255 27.1417 28.5062 28.1173 29.2524 28.1173C29.9985 28.1173 30.5792 27.1417 30.5792 25.9398C30.5792 25.0917 30.2888 24.3555 29.8547 23.9971L30.8671 23.2996ZM17.4199 22.3434C17.1558 22.1614 16.7942 22.2281 16.6123 22.4922C16.4304 22.7562 16.497 23.1178 16.7611 23.2998L17.9962 24.1506C17.6504 24.5431 17.4238 25.1981 17.4238 25.9398C17.4238 27.1408 18.0179 28.1144 18.7507 28.1144C19.4835 28.1144 20.0775 27.1408 20.0775 25.9398C20.0775 25.8142 20.071 25.6911 20.0585 25.5713L20.158 25.6399C20.4221 25.8218 20.7837 25.7552 20.9656 25.4911C21.1475 25.227 21.0809 24.8654 20.8168 24.6835L17.4199 22.3434ZM20.5041 33.1124C20.2981 32.8667 20.3303 32.5004 20.5761 32.2944L20.944 32.7333C20.5761 32.2944 20.5763 32.2942 20.5766 32.294L20.5772 32.2935L20.5786 32.2923L20.5821 32.2894L20.5919 32.2814C20.5998 32.275 20.6102 32.2668 20.6231 32.2568C20.649 32.2367 20.6849 32.2097 20.7305 32.1774C20.8216 32.1128 20.952 32.0266 21.1184 31.932C21.4506 31.7433 21.931 31.5188 22.5337 31.3691C23.7539 31.0661 25.4394 31.0803 27.3483 32.2436C27.6222 32.4104 27.7089 32.7677 27.542 33.0416C27.3751 33.3154 27.0178 33.4022 26.744 33.2353C25.1224 32.2471 23.7593 32.2614 22.8136 32.4962C22.3334 32.6155 21.9516 32.7943 21.6922 32.9417C21.5628 33.0152 21.465 33.0803 21.402 33.1249C21.3706 33.1472 21.3479 33.1644 21.3344 33.1748L21.3212 33.1852L21.3201 33.1861C21.0743 33.3903 20.7095 33.3575 20.5041 33.1124Z" fill="black" />
              <defs>
                <linearGradient id="paint0_linear_4523_4191" x1="11.8727" y1="31.0029" x2="36.1273" y2="17" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#EBB34D" />
                  <stop offset="0.03" stop-color="#ECB64D" />
                  <stop offset="0.18" stop-color="#EEC04F" />
                  <stop offset="0.55" stop-color="#F1CC51" />
                  <stop offset="1" stop-color="#F3D652" />
                </linearGradient>
                <linearGradient id="paint1_linear_4523_4191" x1="24" y1="10" x2="24" y2="38.0029" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#DD5F70" />
                  <stop offset="0.16" stop-color="#DD636F" stop-opacity="0.97" />
                  <stop offset="0.45" stop-color="#E48965" stop-opacity="0.64" />
                  <stop offset="1" stop-color="#F3D652" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>`;
    }

    happySvg() {
      return `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#EDEDED" fill-opacity="0.4" />
              <path d="M37.7739 26.2261C39.0033 18.619 33.8332 11.4555 26.2261 10.2261C18.619 8.99668 11.4555 14.1668 10.2261 21.7739C8.99665 29.3811 14.1668 36.5445 21.7739 37.7739C29.381 39.0034 36.5445 33.8332 37.7739 26.2261Z" fill="url(#paint0_linear_4523_4216)" />
              <path d="M18.9167 25.5733C22.2154 24.8636 25.6273 24.8636 28.9259 25.5733C28.9259 25.5733 29.099 32.0105 23.9199 32.0105C18.7407 32.0105 18.9167 25.5733 18.9167 25.5733Z" fill="#5B0600" />
              <mask id="mask0_4523_4216" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="18" y="25" width="11" height="8">
                <path d="M18.9109 25.5723C22.2095 24.8626 25.6214 24.8626 28.9201 25.5723C28.9201 25.5723 29.0932 32.0095 23.914 32.0095C18.7349 32.0095 18.9109 25.5723 18.9109 25.5723Z" fill="white" />
              </mask>
              <g mask="url(#mask0_4523_4216)">
                <path d="M25.2235 35.7819C26.9879 35.0571 27.8307 33.0393 27.106 31.2749C26.3813 29.5105 24.3634 28.6677 22.599 29.3924C20.8346 30.1171 19.9918 32.1349 20.7165 33.8993C21.4412 35.6637 23.4591 36.5066 25.2235 35.7819Z" fill="#8E1112" />
              </g>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3637 18.0719C19.4288 18.0734 20.1308 18.5111 20.557 18.9914C20.7628 19.2234 20.8958 19.4549 20.9782 19.6304C21.0197 19.7187 21.0493 19.7947 21.0695 19.8523C21.0796 19.8812 21.0875 19.9057 21.0933 19.925C21.0962 19.9347 21.0987 19.9431 21.1006 19.9501L21.1033 19.9596L21.1043 19.9636L21.1048 19.9654L21.105 19.9663C21.1052 19.9667 21.1053 19.9671 20.4073 20.1493L21.1053 19.9671C21.2059 20.3525 20.975 20.7466 20.5896 20.8473C20.2076 20.947 19.8171 20.7212 19.7122 20.3419C19.7116 20.3399 19.7102 20.3357 19.708 20.3296C19.7022 20.3129 19.6908 20.2828 19.6724 20.2437C19.6352 20.1645 19.5732 20.0564 19.4779 19.949C19.3034 19.7523 18.9819 19.5135 18.3542 19.5146C18.346 19.5146 18.3379 19.5145 18.3297 19.5142C18.0377 19.5048 17.7499 19.5861 17.506 19.7469C17.2621 19.9077 17.0739 20.1401 16.9675 20.4122C16.8223 20.7832 16.4039 20.9662 16.0329 20.8211C15.6619 20.6759 15.4788 20.2575 15.624 19.8865C15.8391 19.3368 16.2192 18.8672 16.712 18.5423C17.2014 18.2198 17.778 18.0556 18.3637 18.0719ZM28.6151 18.072C29.6804 18.0733 30.3826 18.5111 30.8089 18.9915C31.0147 19.2235 31.1476 19.4549 31.2301 19.6304C31.2716 19.7187 31.3011 19.7948 31.3213 19.8524C31.3315 19.8813 31.3393 19.9057 31.3452 19.9251C31.3481 19.9347 31.3505 19.9431 31.3525 19.9502L31.3551 19.9597L31.3562 19.9637L31.3567 19.9655L31.3569 19.9663C31.357 19.9667 31.3571 19.9671 30.6592 20.1494L31.3571 19.9671C31.4578 20.3526 31.2269 20.7467 30.8415 20.8473C30.4594 20.9471 30.069 20.7212 29.964 20.3419C29.9634 20.3399 29.962 20.3358 29.9599 20.3296C29.954 20.3129 29.9426 20.2828 29.9243 20.2438C29.8871 20.1646 29.8251 20.0564 29.7298 19.949C29.5553 19.7524 29.2337 19.5136 28.6061 19.5146C28.5982 19.5146 28.5904 19.5145 28.5825 19.5143C28.2908 19.5053 28.0035 19.5867 27.76 19.7475C27.5164 19.9083 27.3286 20.1405 27.2222 20.4122C27.0771 20.7832 26.6586 20.9663 26.2876 20.8211C25.9167 20.676 25.7336 20.2575 25.8787 19.8866C26.0936 19.3375 26.4731 18.8683 26.9652 18.5435C27.4539 18.2209 28.0299 18.0563 28.6151 18.072Z" fill="black" />
              <defs>
                <linearGradient id="paint0_linear_4523_4216" x1="11.9006" y1="30.9566" x2="36.0976" y2="17.0436" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#EBB34D" />
                  <stop offset="0.03" stop-color="#ECB64D" />
                  <stop offset="0.18" stop-color="#EEC04F" />
                  <stop offset="0.55" stop-color="#F1CC51" />
                  <stop offset="1" stop-color="#F3D652" />
                </linearGradient>
              </defs>
            </svg>`;
    }

    lovingSvg() {
      return `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#EDEDED" fill-opacity="0.4" />
              <path d="M34 34C39.5228 28.4772 39.5228 19.5228 34 14C28.4772 8.47715 19.5228 8.47715 14 14C8.47715 19.5228 8.47715 28.4772 14 34C19.5228 39.5228 28.4772 39.5228 34 34Z" fill="url(#paint0_linear_4523_4227)" />
              <path d="M15.9876 24.9903C21.3039 24.2682 26.6934 24.2682 32.0097 24.9903C32.0097 24.9903 32.3029 32.12 24.0001 32.12C15.6972 32.12 15.9876 24.9903 15.9876 24.9903Z" fill="#5B0600" />
              <mask id="mask0_4523_4227" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="15" y="24" width="18" height="9">
                <path d="M15.9876 24.9903C21.3039 24.2682 26.6934 24.2682 32.0097 24.9903C32.0097 24.9903 32.3029 32.12 24.0001 32.12C15.6972 32.12 15.9876 24.9903 15.9876 24.9903Z" fill="white" />
              </mask>
              <g mask="url(#mask0_4523_4227)">
                <path d="M23.9975 35.6306C27.7521 35.6306 30.7958 34.0588 30.7958 32.12C30.7958 30.1811 27.7521 28.6094 23.9975 28.6094C20.2429 28.6094 17.1992 30.1811 17.1992 32.12C17.1992 34.0588 20.2429 35.6306 23.9975 35.6306Z" fill="#8E1112" />
              </g>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M19.0636 15.3406C18.6874 15.4428 18.3487 15.6517 18.0885 15.9421C17.8283 16.2325 17.6577 16.592 17.5972 16.9771C17.3585 16.668 17.0354 16.4346 16.6669 16.305C16.2985 16.1754 15.9004 16.1552 15.5207 16.2469C15.2856 16.3027 15.0642 16.4055 14.8697 16.5489C14.6752 16.6923 14.5115 16.8734 14.3886 17.0815C14.2657 17.2895 14.186 17.5203 14.1542 17.7598C14.1225 17.9994 14.1394 18.2429 14.2039 18.4758C14.5558 19.8542 16.3361 20.5728 18.8964 22.0979C20.4215 19.5258 21.6357 18.0388 21.2838 16.6575C21.2279 16.4223 21.1252 16.2009 20.9818 16.0064C20.8384 15.8119 20.6572 15.6483 20.4491 15.5253C20.2411 15.4024 20.0104 15.3227 19.7708 15.291C19.5312 15.2592 19.2877 15.2761 19.0548 15.3406H19.0636Z" fill="url(#paint1_linear_4523_4227)" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M28.7521 15.3406C28.5194 15.2761 28.2761 15.2592 28.0367 15.291C27.7973 15.3228 27.5668 15.4025 27.359 15.5255C27.1511 15.6484 26.9702 15.812 26.8271 16.0065C26.684 16.201 26.5816 16.4224 26.5261 16.6574C26.1741 18.0388 27.3883 19.5257 28.9105 22.0978C31.4855 20.5727 33.2657 19.8542 33.6177 18.4758C33.6817 18.2427 33.6982 17.9991 33.666 17.7595C33.6339 17.5199 33.5539 17.2892 33.4308 17.0812C33.3076 16.8732 33.1438 16.6922 32.9492 16.5488C32.7546 16.4054 32.5331 16.3027 32.2979 16.2468C31.9187 16.155 31.521 16.1752 31.153 16.3048C30.7849 16.4344 30.4624 16.6679 30.2244 16.9771C30.1639 16.5919 29.9933 16.2324 29.7331 15.9421C29.4729 15.6517 29.1342 15.4428 28.758 15.3406H28.7521Z" fill="url(#paint2_linear_4523_4227)" />
              <defs>
                <linearGradient id="paint0_linear_4523_4227" x1="11.7505" y1="31.0726" x2="36.2514" y2="16.9276" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#EBB34D" />
                  <stop offset="0.03" stop-color="#ECB64D" />
                  <stop offset="0.18" stop-color="#EEC04F" />
                  <stop offset="0.55" stop-color="#F1CC51" />
                  <stop offset="1" stop-color="#F3D652" />
                </linearGradient>
                <linearGradient id="paint1_linear_4523_4227" x1="14.5667" y1="19.8443" x2="21.658" y2="18.0275" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#D2254D" />
                  <stop offset="1" stop-color="#D65C4E" />
                </linearGradient>
                <linearGradient id="paint2_linear_4523_4227" x1="34.6808" y1="21.4478" x2="27.5801" y2="19.6177" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#D2254D" />
                  <stop offset="1" stop-color="#D65C4E" />
                </linearGradient>
              </defs>
            </svg>`;
    }

    satisfiedSvg() {
      return `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#EDEDED" fill-opacity="0.4" />
              <path d="M24 38C31.732 38 38 31.732 38 24C38 16.268 31.732 10 24 10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38Z" fill="url(#paint0_linear_4523_4209)" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4071 18.0044C19.479 18.0058 20.1859 18.4463 20.6154 18.9291C20.8229 19.1623 20.957 19.395 21.0403 19.5715C21.0822 19.6603 21.1121 19.7368 21.1326 19.7947C21.1428 19.8238 21.1507 19.8484 21.1566 19.8678C21.1596 19.8775 21.1621 19.8859 21.1641 19.893L21.1668 19.9026L21.1678 19.9066L21.1683 19.9084L21.1685 19.9093C21.1687 19.9097 21.1688 19.9101 20.4668 20.0949L21.1688 19.9101C21.2708 20.2977 21.0393 20.6947 20.6516 20.7968C20.2674 20.8979 19.874 20.6714 19.7677 20.29C19.7671 20.288 19.7657 20.2837 19.7635 20.2775C19.7576 20.2607 19.746 20.2303 19.7274 20.191C19.6898 20.1111 19.627 20.0022 19.5307 19.8939C19.3542 19.6954 19.0297 19.4551 18.398 19.4561C18.3901 19.4561 18.3822 19.456 18.3743 19.4558C18.0808 19.4467 17.7917 19.5287 17.5466 19.6905C17.3015 19.8522 17.1125 20.0859 17.0055 20.3594C16.8594 20.7327 16.4384 20.9169 16.0651 20.7708C15.6918 20.6247 15.5075 20.2037 15.6536 19.8304C15.8698 19.2779 16.2517 18.8058 16.7468 18.4789C17.2386 18.1543 17.8182 17.9887 18.4071 18.0044Z" fill="black" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M28.7269 18.004C29.7986 18.0055 30.505 18.446 30.9338 18.9293C31.141 19.1628 31.2747 19.3956 31.3577 19.5722C31.3994 19.6611 31.4292 19.7376 31.4495 19.7956C31.4597 19.8247 31.4676 19.8493 31.4735 19.8687C31.4764 19.8784 31.4789 19.8869 31.4809 19.894L31.4835 19.9036L31.4846 19.9076L31.4851 19.9094L31.4853 19.9102C31.4854 19.9107 31.4855 19.9111 30.7832 20.0945L31.4855 19.9111C31.5868 20.2989 31.3545 20.6955 30.9666 20.7968C30.5823 20.8971 30.1893 20.6699 30.0837 20.2882C30.0831 20.2862 30.0818 20.282 30.0796 20.2758C30.0737 20.259 30.0622 20.2287 30.0438 20.1894C30.0063 20.1097 29.9439 20.0009 29.848 19.8928C29.6724 19.6949 29.3489 19.4547 28.7173 19.4557C28.7091 19.4557 28.7008 19.4556 28.6926 19.4554C28.3988 19.4459 28.1092 19.5277 27.8638 19.6895C27.6183 19.8513 27.429 20.0851 27.3219 20.3589C27.1758 20.7322 26.7548 20.9165 26.3815 20.7704C26.0082 20.6244 25.824 20.2033 25.97 19.83C26.1864 19.2769 26.5689 18.8043 27.0648 18.4774C27.5572 18.1528 28.1375 17.9876 28.7269 18.004Z" fill="black" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M19.8711 26.9844C19.8711 26.4232 20.3217 25.9683 20.8776 25.9683H26.4133C26.9692 25.9683 27.4198 26.4232 27.4198 26.9844C27.4198 27.5457 26.9692 28.0006 26.4133 28.0006H20.8776C20.3217 28.0006 19.8711 27.5457 19.8711 26.9844Z" fill="#35220B" />
              <defs>
                <linearGradient id="paint0_linear_4523_4209" x1="11.8727" y1="31.0029" x2="36.1273" y2="17" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#EBB34D" />
                  <stop offset="0.03" stop-color="#ECB64D" />
                  <stop offset="0.18" stop-color="#EEC04F" />
                  <stop offset="0.55" stop-color="#F1CC51" />
                  <stop offset="1" stop-color="#F3D652" />
                </linearGradient>
              </defs>
            </svg>`;
    }

    disappointedSvg() {
      return `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#EDEDED" fill-opacity="0.4" />
              <path d="M24 38C31.732 38 38 31.732 38 24C38 16.268 31.732 10 24 10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38Z" fill="url(#paint0_linear_4523_4202)" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M31.4907 23.6144C31.8641 23.7603 32.0485 24.1812 31.9027 24.5546C31.6865 25.108 31.3043 25.5809 30.8086 25.9083C30.3162 26.2336 29.7359 26.3995 29.1462 26.3838C28.0736 26.3825 27.3669 25.9407 26.9382 25.4565C26.7311 25.2227 26.5975 24.9894 26.5146 24.8126C26.4729 24.7237 26.4431 24.647 26.4228 24.589C26.4127 24.5599 26.4048 24.5353 26.3989 24.5159C26.396 24.5061 26.3935 24.4977 26.3915 24.4906L26.3889 24.481L26.3878 24.477L26.3874 24.4752L26.3871 24.4743C26.387 24.4739 26.3869 24.4735 27.0893 24.2905L26.3869 24.4735C26.2858 24.0856 26.5183 23.6892 26.9063 23.5881C27.2907 23.4879 27.6836 23.7154 27.7889 24.0972C27.7896 24.0992 27.7909 24.1034 27.7931 24.1097C27.799 24.1266 27.8105 24.1571 27.829 24.1965C27.8666 24.2766 27.929 24.3857 28.025 24.4941C28.2008 24.6927 28.5242 24.9332 29.1553 24.9321C29.1631 24.9321 29.171 24.9322 29.1788 24.9325C29.473 24.9415 29.7628 24.8593 30.0084 24.6971C30.254 24.5348 30.4434 24.3005 30.5505 24.0264C30.6964 23.653 31.1173 23.4685 31.4907 23.6144Z" fill="black" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M21.1727 23.6142C21.5463 23.7597 21.7311 24.1805 21.5855 24.554C21.37 25.1072 20.9884 25.5802 20.4932 25.9077C20.0013 26.2331 19.4213 26.3993 18.8319 26.3838C17.7592 26.3825 17.0525 25.9407 16.6237 25.4565C16.4167 25.2227 16.283 24.9894 16.2001 24.8126C16.1584 24.7237 16.1287 24.647 16.1084 24.589C16.0982 24.5599 16.0903 24.5353 16.0845 24.5159C16.0815 24.5061 16.0791 24.4977 16.0771 24.4906L16.0745 24.481L16.0734 24.477L16.0729 24.4752L16.0727 24.4743C16.0726 24.4739 16.0725 24.4735 16.7748 24.2905L16.0725 24.4735C15.9714 24.0856 16.2039 23.6892 16.5918 23.5881C16.9763 23.4879 17.3691 23.7154 17.4745 24.0972C17.4751 24.0992 17.4765 24.1034 17.4787 24.1097C17.4846 24.1266 17.4961 24.1571 17.5146 24.1965C17.5521 24.2766 17.6146 24.3857 17.7106 24.4941C17.8864 24.6927 18.2098 24.9332 18.8408 24.9321C18.8486 24.9321 18.8563 24.9322 18.8641 24.9325C19.1578 24.9414 19.4471 24.8591 19.6922 24.697C19.9373 24.5349 20.1262 24.3008 20.2329 24.027C20.3784 23.6535 20.7992 23.4686 21.1727 23.6142Z" fill="black" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M21.3169 32.3116C21.0712 32.5157 20.7064 32.483 20.5009 32.2379C20.2949 31.9922 20.3271 31.6259 20.5729 31.4199L20.9408 31.8588C20.5729 31.4199 20.5732 31.4197 20.5734 31.4194L20.574 31.4189L20.5754 31.4178L20.5789 31.4149L20.5888 31.4069C20.5966 31.4005 20.607 31.3923 20.62 31.3822C20.6458 31.3622 20.6817 31.3352 20.7273 31.3029C20.8185 31.2383 20.9488 31.1521 21.1152 31.0575C21.4474 30.8688 21.9279 30.6442 22.5306 30.4946C23.7508 30.1916 25.4363 30.2058 27.3451 31.369C27.619 31.5359 27.7057 31.8932 27.5388 32.1671C27.372 32.4409 27.0147 32.5276 26.7408 32.3608C25.1192 31.3726 23.7562 31.3868 22.8105 31.6217C22.3302 31.7409 21.9484 31.9198 21.689 32.0672C21.5596 32.1407 21.4619 32.2058 21.3989 32.2504C21.3674 32.2727 21.3447 32.2898 21.3312 32.3003C21.3245 32.3055 21.3201 32.309 21.318 32.3107C21.3175 32.3111 21.3171 32.3114 21.3169 32.3116Z" fill="#5B0600" />
              <defs>
                <linearGradient id="paint0_linear_4523_4202" x1="11.8727" y1="31" x2="36.1273" y2="16.9971" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#EBB34D" />
                  <stop offset="0.03" stop-color="#ECB64D" />
                  <stop offset="0.18" stop-color="#EEC04F" />
                  <stop offset="0.55" stop-color="#F1CC51" />
                  <stop offset="1" stop-color="#F3D652" />
                </linearGradient>
              </defs>
            </svg>`;
    }

    flashErrorSvg() {
      return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
              <defs><style>.a{fill:#fff;}.st0{fill:#d73b3b;}</style></defs>
              <g transform='translate(-619 -294.5)'>
                <path class='a' d='M16.971,0,24,7.029v9.941L16.971,24H7.029L0,16.971V7.029L7.029,0Z' transform='translate(619 294.5)'/>
                <circle class='st0' cx='1.543' cy='1.543' r='1.543' transform='translate(629.416 309.672)'/>
                <path class='st0' d='M9.786,4.8l-.363,7.714H7.063L6.7,4.8Z' transform='translate(622.715 295.872)'/>
              </g>
            </svg>`;
    }
  }

  class CustomerEffortSurvery {
    constructor(locale, requestId, subdomain) {
      this.locale         = locale;
      this.subdomain      = subdomain;
      this.requestId      = requestId;
      this.svgBuilder     = new SvgBuilder();

      // order is important
      this.emojisMapping  = {
        'anger': 1,
        'disappointed': 2,
        'satisfied': 3,
        'happy': 4,
        'loving': 5
      };
    }

    render() {
      const cesModal = this.build();
      $('body').append(cesModal);

      $('body').on('click', '.js-customer-effort-survery-emoji-reaction', function(e) {
        e.preventDefault();

        $('.js-customer-effort-survery-emoji-reaction svg rect.selected-emoji-background').removeClass('selected-emoji-background');
        $(this).find('svg rect').addClass('selected-emoji-background');
        $('#submit_ces_survery_btn').prop('disabled', false);
        $('#selected_emoji').val($(this).data('emoji'));
      });

      $('body').on('click', 'ces_survery_modal_close_btn', function(e) {
        e.preventDefault();

        $('#customer_effort_survey_modal').modal('hide').remove();
      });

      // Show the modal
      $('#customer_effort_survey_modal').modal('show');
    }

    build() {
      const modal         = $('<div>').addClass('modal fade hide')
                                      .attr('id', 'customer_effort_survey_modal')
                                      .attr('role', 'modal');
      const modalDialog   = $('<div>').addClass('modal-dialog customer-effort-survery-dialog-position customer-effort-survery-dialog-shadow');

      // modal-content
      const modalContent  = $('<div>').addClass('modal-content');

      //modal-header
      const modalHeader = $('<div>').addClass('modal-header').append(
        $('<h5>').addClass('modal-title customer-effort-survery-dialog-title-font-style')
                .text(t('customer-effort-survey-title', 'Feedback')),
        $('<button>').addClass('btn-close')
                     .attr('id', 'modal_close_btn')
                     .attr('type', 'button')
                     .attr('data-bs-dismiss', 'modal')
                     .attr('aria-label', 'Close')
                     .click(this.closeModal)
      );

      //modal-body
      const modalBody       = $('<div>').addClass('modal-body');
      const hiddenField     = $('<input>').attr('id',   'selected_emoji')
                                          .attr('type', 'hidden')
                                          .attr('name', 'selectedEmoji');
      modalBody.append(hiddenField);

      // modal-body description
      const descriptionContainer = $('<div>').addClass('mb-2 mt-0');
      const modalDescription     = $('<span>').addClass('fw-bold customer-effort-survery-dialog-font-style')
                                              .text(t('customer-effort-survey-feedback-question', 'How easy was it to submit the request?'));
      descriptionContainer.append(modalDescription);
      modalBody.append(descriptionContainer);

      // emojis section
      const emojisContainer = $('<div>').addClass('d-flex justify-content-between mt-4 px-4');
      Object.keys(this.emojisMapping).forEach(key => {
        let emoji = key;
        let svg   = this.svgBuilder.build(emoji);
        svg.addClass('js-customer-effort-survery-emoji-reaction')
           .data('emoji', emoji);
        emojisContainer.append(svg);
      });

      // emoji description
      const emojiDescription = $('<div>').addClass('d-flex justify-content-between mt-2 px-2 emoji-description-font-style');
      emojiDescription.append(
        $('<span>').text(t('emoji-description-terrible', 'Terrible')),
        $('<span>').addClass('emoji-description-okay').text(t('emoji-description-okay', 'Ok')),
        $('<span>').text(t('emoji-description-great', 'Great'))
      );

      // comment section
      const commentContainer  = $('<div>').addClass('comment-container mt-3 customer-effort-survery-dialog-font-style');
      const commentLabel      = $('<label>').addClass('col-form-label my-2 fw-bold')
                                            .attr('for', 'comment')
                                            .text(t('optional-comment', 'Write your comment (Optional)'));
      const commentTextarea   = $('<textarea>').addClass('form-control comment-section')
                                               .attr('id', 'comment')
                                               .attr('rows', '4')
                                               .attr('maxlength', CUSTOMER_EFFORT_SURVEY_COMMENT_LENGTH)
                                               .attr('placeholder', t('experience-description', 'Describe your experience here'));
      commentContainer.append(commentLabel, commentTextarea);

      // modal-footer
      const modalFooter = $('<div>').addClass('modal-footer border-top-0');
      const submitBtn   = $('<button>').addClass('btn btn-primary mt-0 mb-3 ces-survery-submit-btn ces-survery-submit-btn-font-style')
                                       .attr('id', 'submit_ces_survery_btn')
                                       .attr('disabled', 'disabled')
                                       .text(t('send-feedback', 'Send Feedback'));

      // Assign submit logic to submit button
      submitBtn.click(this.submitFeedback);
      modalFooter.append(submitBtn);

      // Assemble modal content
      modalBody.append(emojisContainer, emojiDescription, commentContainer);
      modalContent.append(modalHeader, modalBody, modalFooter);
      modalDialog.append(modalContent);
      modal.append(modalDialog);

      return modal;
    }

    // Function to handle form submission
    submitFeedback = () => {
      const self        = this;
      const score       = this.emojisMapping[$('#selected_emoji').val()];
      const comment     = $('#comment').val();
      const headers     = {};
      const queryParams = {
        score:      score || 0,
        comment:    comment,
        ticket_id:  this.requestId,
      };

      $('#submit_ces_survery_btn').prop('disabled', true).text(t('please-wait', 'Please Wait...'));

      this.withToken(token => {
        headers['Authorization'] = 'Bearer ' + token;
        headers['ngrok-skip-browser-warning'] = true;

        $.ajax({
          url:      `https://${this.subdomain}/customer_effort_scores.json`,
          data:     queryParams,
          method:   'POST',
          headers:  headers,
          success:  function(response) {
            self.closeModal();
          },
          error: function(xhr, status, error) {
            console.error('Request error:', error);
          }
        });
      });
    }

    closeModal = () => {
      $('#customer_effort_survey_modal').modal('hide').remove();
    }

    withToken(callback) {
      return $.getJSON('/hc/api/v2/integration/token').then(data => {
        return callback(data.token);
      })
    }
  }

  class RequestForm {
    constructor(locale, ezoFieldId, ezoSubdomain, ezoServiceItemFieldId) {
      this.locale                 = locale;
      this.ezoFieldId             = ezoFieldId;
      this.ezoSubdomain           = ezoSubdomain;
      this.ezoServiceItemFieldId  = ezoServiceItemFieldId;
    }

    updateRequestForm() {
      const files = this.filesToLoad();
      loadExternalFiles(files, () => {
        this.updateForm();
      });
    }

    updateForm() {
      const self        = this;
      const requestId   = this.extractRequestId();
      const requestUrl  = '/api/v2/requests/' + requestId;

      this.hideAssetsCustomField();

      $.getJSON(requestUrl).done((data) => {
        const ezoFieldData                    = data.request.custom_fields.find(function (customField) { return customField.id == self.ezoFieldId });
        const ezoServiceItemFieldData         = data.request.custom_fields.find(function (customField) { return customField.id == self.ezoServiceItemFieldId });
        const ezoFieldDataPresent             = self.fieldDataPresent(ezoFieldData);
        const ezoServiceItemFieldDataPresent  = self.fieldDataPresent(ezoServiceItemFieldData);

        if (!ezoFieldDataPresent && !ezoServiceItemFieldDataPresent) { return true; }

        const options = { headers: { } };

        return self.withToken(token => {
          if (token) {
            options.headers['Authorization']              = 'Bearer ' + token;

            if (ezoServiceItemFieldDataPresent && !ezoFieldDataPresent) { self.linkResources(requestId, { headers: options.headers, serviceItemFieldId: self.ezoServiceItemFieldId }); }

            if (ezoFieldDataPresent) {
              const parsedEzoFieldValue = JSON.parse(ezoFieldData.value);
              const assetNames          = parsedEzoFieldValue.assets.map(asset => Object.values(asset)[0]);
              const assetSequenceNums   = parsedEzoFieldValue.assets.map(asset => Object.keys(asset)[0]);

              if (!assetSequenceNums || assetSequenceNums.length == 0) { return true; }

              if (parsedEzoFieldValue.linked != 'true') {
                self.linkResources(requestId, { headers: options.headers, ezoFieldId: self.ezoFieldId });
              }

              if (assetNames) {
                self.addEZOContainer();
                assetNames.map(name => {
                  self.showLinkedAsset(name);
                });
              }
            }
          }
        });
      });
    }

    extractRequestId() {
      return window.location.pathname.split('/').pop();
    }

    hideAssetsCustomField() {
      const valueToFind = '{'+'"assets":' + '[{'; // value to find dd element
      const ddElement   = $("dd:contains('" + valueToFind + "')"); // find dd element by

      if (ddElement['0']) {
        ddElement['0'].style.display = 'none';
        ddElement['0'].previousElementSibling.style.display = 'none';
      }
    }

    withToken(callback) {
      return $.getJSON('/hc/api/v2/integration/token').then(data => {
        return callback(data.token);
      })
    }

    linkResources(requestId, options) {
      const self               = this;
      const assetsFieldId      = options.ezoFieldId;
      const serviceItemFieldId = options.serviceItemFieldId;

      const queryParams = {
        ticket_id: requestId,
      };

      if (assetsFieldId)      { queryParams.assets_field_id       = assetsFieldId;      }
      if (serviceItemFieldId) { queryParams.service_item_field_id = serviceItemFieldId; }

      const headers = options.headers || {};

      $.ajax({
        url:      'https://' + this.ezoSubdomain + '/webhooks/zendesk/link_ticket_to_resource.json',
        type:     'POST',
        data:     { 'ticket': queryParams },
        headers:  headers,
        success: function(response) {
          if (response['show_ces_survey']) {
            new CustomerEffortSurvery(self.locale, requestId, self.ezoSubdomain).render();
          }
        },
        error: function(xhr, status, error) {
          console.error('Request error:', error);
        }
      });
    }

    addEZOContainer() {
      $('dl.request-details')
        .last()
        .after('<dl class="request-details" id="ezo-assets-container"><dt>AssetSonar Assets</dt><dd><ul></ul></dd></dl>');
    }

    showLinkedAsset(assetName) {
      const assetUrl         = this.getAssetUrl(assetName);
      const ezoContainerBody = $('#ezo-assets-container dd ul');
      if (assetUrl) {
        ezoContainerBody.append("<li><a target='_blank' href='" + assetUrl + "'>" + assetName + "</a></li>");
      } else {
        ezoContainerBody.append("<li>" + assetName + "</li>");
      }
    }

    getAssetUrl(assetName) {
      if (!assetName) { return null; }

      assetName       = assetName.trim();
      const matchData = assetName.match(/^(Asset|Asset Stock|Software License) # (\d+) /);
      if (!matchData) { return null; }

      const id   = matchData[2];
      const type = matchData[1];
      return 'https://' + this.ezoSubdomain + this.getAssetPath(id, type);
    }

    getAssetPath(id, type) {
      const pathMappings = {
        'Asset':                '/assets/',
        'Stock Asset':          '/stock_assets/',
        'Software License':     '/software_licenses/'
      };

      const defaultPath = '/dashboard';

      const path = pathMappings[type] || defaultPath;
      return path + id;
    }

    fieldDataPresent(fieldData) {
     return fieldData && fieldData.value
    }

    filesToLoad() {
      return  [
                { type: 'link'  , url: `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/customer_effort_survey.css` },
                { type: 'script', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js' },
              ];
    }
  }

  class NewRequestForm {
    constructor(locale, ezoFieldId, ezoSubdomain, ezoServiceItemFieldId, integrationMode) {
      this.locale                 = locale;
      this.ezoFieldId             = ezoFieldId;
      this.ezoSubdomain           = ezoSubdomain;
      this.integrationMode        = integrationMode;
      this.ezoServiceItemFieldId  = ezoServiceItemFieldId;
    }

    updateRequestForm() {
      const files = this.filesToLoad();
      loadExternalFiles(files, () => {
        this.updateForm();
      });
    }

    updateForm() {
      if (!this.isRequestFormSelected()) { return; }

      const searchParams          = this.extractQueryParams(window.location);
      const formSubject           = this.prepareSubject(searchParams);
      const serviceItemFieldValue = this.prepareServiceItemFieldValue(searchParams);

      if (formSubject) { this.subjectFieldElement().val(formSubject); }
      if (serviceItemFieldValue) { this.customFieldElement(this.ezoServiceItemFieldId).val(serviceItemFieldValue); }

      if (this.integrationMode === 'custom_objects') {
        this.fetchCustomObjects();
      } else {
        this.getTokenAndFetchAssignedAssets();
      }
    }

    fetchCustomObjects() {
      this.fetchUserData()
        .done((userData) => this.handleUserData(userData))
        .fail(function(error) {
          console.error("Failed to fetch user data:", error);
        });
    }

    handleUserData(userData) {
      var userId    = userData.user.id;
      var userEmail = userData.user.email;
      if (userId) {
        this.populateAssetFieldUsingCustomObjects(userId, userEmail);
      } else {
        console.error("User ID not found in response.");
      }
    }

    populateAssetFieldUsingCustomObjects(userId, userEmail) {
      $.getJSON(`/api/v2/custom_objects/assetsonar_assets/records/search?query=${userEmail}`).done((data) => {
        if (!data || !data.custom_object_records) {
          console.error("No custom object records found");
          return;
        }

        const assetsData = { data: [] };
        const ezoCustomFieldEle = this.customFieldElement(this.ezoFieldId);

        data.custom_object_records.forEach((asset, index) => {
          assetsData.data[index] = {
            id: asset.custom_object_fields.asset_id,
            text: asset.custom_object_fields.name,
          };
        });

        ezoCustomFieldEle.hide();
        ezoCustomFieldEle.after("<select multiple='multiple' id='ezo-asset-select' style='width: 100%;'></select>");
        $("#ezo-asset-select").select2({
          data: assetsData.data
        });
        $("#ezo-asset-select").next().css("font-size", "15px");

        $("#ezo-asset-select").on("change", function () {
          const selectedIds = $(this).val();

          if (selectedIds && selectedIds.length > 0) {
            const selectedAssets = assetsData.data.filter((asset) =>
              selectedIds.includes(asset.id.toString())
            );

            const mappedAssets = selectedAssets.map((asset) => ({
              [asset.id]: asset.text,
            }));

            ezoCustomFieldEle.val(JSON.stringify({ assets: mappedAssets }));
          } else {
            ezoCustomFieldEle.val("");
          }
        });

        this.preselectAssetsCustomField(this.extractQueryParams(window.location));
      }).fail((error) => {
        console.error("Error fetching custom object records:", error);
      });
    }

    extractQueryParams(url) {
      return new URL(url).searchParams;
    }

    getTokenAndFetchAssignedAssets() {
      return this.withToken().then(token => {
        if (token) {
          const options = {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + token
            }
          };

          const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/user_assigned_assets_and_software_entitlements.json';
          return this.populateAssignedAssets(url, options);
        }
      });
    }

    withToken() {
      return $.getJSON('/hc/api/v2/integration/token').then(data => data.token);
    }

    populateAssignedAssets(url, options) {
      fetch(url, options).then(response => response.json())
        .then(data => {

          const assetsData = { data: [] };
          const ezoCustomFieldEle = this.customFieldElement(this.ezoFieldId);

          this.processData(data.assets, assetsData, 'Asset');
          this.processData(data.software_entitlements, assetsData, 'Software License');

          ezoCustomFieldEle.hide();
          ezoCustomFieldEle.after("<select multiple='multiple' id='ezo-asset-select' style='width: 100%;'></select>");

          this.renderSelect2PaginationForUsers($('#ezo-asset-select'), url, options);
          // handle it using css classes
          $('#ezo-asset-select').next().css('font-size', '15px');

          $('#ezo-asset-select').on('change', function() {
            var selectedIds = $('#ezo-asset-select').val();
            if (selectedIds.length > 0) {
              let data = assetsData.data.filter(asset => selectedIds.includes(asset.id.toString()));
              data = data.map((asset) => {
                let assetObj = {
                  [asset.id]: asset.text };
                return assetObj;
              });
              ezoCustomFieldEle.val(JSON.stringify({ assets: data }));
            }
          });

          this.preselectAssetsCustomField(this.extractQueryParams(window.location));
        });
    }

    renderSelect2PaginationForUsers(element, url, options) {
      const parentElementSelector = 'body';
      element.select2({
        dropdownParent: element.parents(parentElementSelector),
        ajax: {
          url:      url,
          delay:    250,
          headers:  options.headers,
          dataType: 'json',
          data: function(params) {
            var query = {
              page:          params.page || 1,
              search:        params.term,
              include_blank: $(element).data('include-blank')
            };
            return query;
          },

          processResults: function(data, params) {
            var assignedAssets = $.map(data.assets, function(asset) {
              var sequenceNum = asset.sequence_num;
              return { id: sequenceNum, text: `Asset # ${sequenceNum} - ${asset.name}` };
            });

            var assignedSoftwareLicenses = $.map(data.software_entitlements, function(softwareEntitlement) {
              var sequenceNum = softwareEntitlement.sequence_num;
              return { id: sequenceNum, text: `Software License # ${sequenceNum} - ${softwareEntitlement.name}` };
            });

            var records = assignedAssets.concat(assignedSoftwareLicenses);
            return {
              results:    records,
              pagination: { more: data.page < data.total_pages }
            };
          }
        },
      });
    }

    prepareSubject(searchParams) {
      const itemName            = searchParams.get('item_name');
      const serviceCategory     = searchParams.get('service_category');
      const subjectPlaceholder  = searchParams.get('subject-placeholder');

      if (itemName == null || serviceCategory == null) { return null; }

      let serviceCategoryLabel    = serviceCategory;
      let subjectPlaceholderLabel = subjectPlaceholder;

      if (this.locale == 'en') {
        if (serviceCategory === 'Mes actifs') {
          serviceCategoryLabel = 'My Assigned Assets';
        }
        if (subjectPlaceholder === 'Signaler un problème') {
          subjectPlaceholderLabel = 'Report Issue';
        } else if (subjectPlaceholder === 'Demander un service') {
          subjectPlaceholderLabel = 'Request Service';
        }
      } else if(this.locale == 'fr') {
        if (serviceCategory === 'My Assigned Assets') {
          serviceCategoryLabel = 'Mes actifs';
        }
        if (subjectPlaceholder === 'Report Issue') {
          subjectPlaceholderLabel = 'Signaler un problème';
        } else if (subjectPlaceholder === 'Request Service') {
          subjectPlaceholderLabel = 'Demander un service';
        }
      }

      return `${subjectPlaceholderLabel} on ${serviceCategoryLabel} - ${itemName}`;
    }

    prepareServiceItemFieldValue(searchParams) {
      const itemName      = searchParams.get('item_name');
      const serviceItemId = searchParams.get('service_item_id');

      if (itemName == null && serviceItemId == null) { return null; }

      if(serviceItemId) {
        return `${serviceItemId} - ${itemName}`;
      } else {
        return itemName;
      }
    }

    preselectAssetsCustomField(searchParams) {
      let ezoCustomFieldEle = this.customFieldElement(this.ezoFieldId);
      if (!this.assetsCustomFieldPresent(ezoCustomFieldEle)) { return; }

      let assetId   = searchParams.get('item_id');
      let assetName = searchParams.get('item_name');

      if (!assetName || !assetId) { return; }

      let ezoSelectEle = $('#ezo-asset-select');
      if (ezoSelectEle.length === 0) { this.renderEzoSelect2Field(ezoCustomFieldEle); }

      // Set the value, creating a new option if necessary
      if (ezoSelectEle.find("option[value='" + assetId + "']").length) {
        ezoSelectEle.val(assetId).trigger('change');
      } else {
        var newOption = new Option(assetName, assetId, true, true);
        ezoSelectEle.append(newOption).trigger('change');
      }
    }

    assetsCustomFieldPresent(ezoCustomFieldEle) {
      return ezoCustomFieldEle.length > 0;
    }

    renderEzoSelect2Field(ezoCustomFieldEle) {
      ezoCustomFieldEle.hide();
      ezoCustomFieldEle.after("<select multiple='multiple' id='ezo-asset-select' style='width: 100%;'></select>");
    }

    filesToLoad() {
      return  [
                { type: 'link',   url: 'https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/css/select2.min.css' },
                { type: 'script', url: 'https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/js/select2.min.js'  }
              ];
    }

    processData(records, dataContainer, textPrefix) {
      if (records) {
        $.each(records, function(index, record) {
          var sequenceNum = record.sequence_num;
          dataContainer.data[sequenceNum] = { id: sequenceNum, text: `${textPrefix} # ${sequenceNum} - ${record.name}` };
        });
      }
    }

    isRequestFormSelected() {
      const oldTemplateSelector = $('.nesty-input');
      const newTemplateSelector = $('#downshift-0-input');

      if (oldTemplateSelector.length) {
        return oldTemplateSelector.text() !== '-';
      } else if (newTemplateSelector.length) {
        return newTemplateSelector.val().trim().length > 0;
      }
      return false;
    }

    subjectFieldElement() {
      return $('#request_subject').length 
        ? $('#request_subject') 
        : $("[name='request[subject]']");
    }

    customFieldElement(customFieldId) {
      const idSelector    = `#request_custom_fields_${customFieldId}`;
      const nameSelector  = `[name='request[custom_fields][${customFieldId}]']`;

      return $(idSelector).length 
        ? $(idSelector) 
        : $(nameSelector);
    }
  }

  function serviceCatalogDisabled(ezoSubdomain) {
    const serviceCatalogDisabledContainer = $('<div>').addClass('d-flex flex-column align-items-center service-catalog-disabled-container');
    const noAccessImage                   = $('<img>').attr('src', `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/no_access_image.svg`)
                                                      .addClass('no-access-image');

    const nextStepsMessage                = $('<p>').attr('data-i18n', 'enable-service-catalog')
                                                    .text('Please enable Service Catalog Builder in Asset Sonar to start using Service Catalog.')
                                                    .addClass('next-steps-message');

    // button
    const buttonsContainer                = $('<div>').addClass('d-flex mt-3 gap-3 justify-content-end');
    const companySettingsUrl              = `https://${ezoSubdomain}/companies/settings`;
    const companySettingsBtn              = $('<a>').attr('href', companySettingsUrl)
                                                    .attr('data-i18n', 'go-to-assetsonar')
                                                    .text('Go to AssetSonar')
                                                    .addClass('btn btn-outline-primary go-back-btn');
    buttonsContainer.append(companySettingsBtn);

    serviceCatalogDisabledContainer.append(noAccessImage, nextStepsMessage, buttonsContainer);
    return serviceCatalogDisabledContainer;
  }

  function serviceCatalogEmpty(ezoSubdomain) {
    const serviceCatalogEmptyContainer    = $('<div>').addClass('d-flex flex-column align-items-center service-catalog-empty-container');
    const serviceCategoryImage            = $('<img>').attr('src', `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/service_category.svg`)
                                                      .addClass('no-access-image');

    const nextStepsMessage                = $('<p>').attr('data-i18n', 'create-and-enable-service-categories')
                                                    .text('Please create and enable service categories in the builder to start using Service Catalog.')
                                                    .addClass('next-steps-message');

    // button
    const buttonsContainer                = $('<div>').addClass('d-flex mt-3 gap-3 justify-content-end');
    const serviceCatalogBuilderUrl        = `https://${ezoSubdomain}/service_catalog/builder`;
    const serviceCatalogBtn               = $('<a>').attr('href', serviceCatalogBuilderUrl)
                                                    .attr('data-i18n', 'go-to-service-catalog-builder')
                                                    .text('Go to Service Catalog Builder')
                                                    .addClass('btn btn-outline-primary go-back-btn');
    buttonsContainer.append(serviceCatalogBtn);

    serviceCatalogEmptyContainer.append(serviceCategoryImage, nextStepsMessage, buttonsContainer);
    return serviceCatalogEmptyContainer;
  }

  function noResultsFound() {
    const noResultsContainer  = $('<div>').attr('id', 'no_results_container')
                                          .addClass('d-flex flex-column align-items-center no-results-container');
    const noResultsImage      = $('<img>').attr('src', `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/no_results_found.svg`)
                                          .addClass('no-results-image');

    const noResultsLabel      = $('<p>').attr('data-i18n', 'no-results-found')
                                        .text('No Result Found')
                                        .addClass('no-results-message');

    noResultsContainer.append(noResultsImage, noResultsLabel);
    return noResultsContainer;
  }

  function noServiceItems(notFoundMessage) {
    const noResultsContainer  = $('<div>').attr('id', 'no_service_items_found_container')
                                          .addClass('d-flex flex-column align-items-center no-results-container');
    const noResultsImage      = $('<img>').attr('src', `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/service_asset.svg`)
                                          .addClass('no-results-image');

    const noResultsLabel      = $('<p>').text(notFoundMessage)
                                        .addClass('no-results-message');

    noResultsContainer.append(noResultsImage, noResultsLabel);
    return noResultsContainer;
  }

  function renderFlashMessages(type, message) {
    const flashMessagesOuterContainer = $('<div>').attr('id', 'flash_messages_outer_container')
                                                  .addClass('flash-messages-outer-container');
    const flashMessagesContainer      = $('<div>').addClass('flash-messages-container');
    const flashType                   = $('<div>').addClass('flash-type');

    // svg
    const flashSvgContainer           = $('<div>').addClass('d-flex flash-error-svg-container justify-content-center align-items-center');
    const flashSvg                    = new SvgBuilder().build('flashErrorSvg');
    flashSvgContainer.append(flashSvg);

    // flash message container
    const flashMessageContentContainer  = $('<div>').addClass('d-flex justify-content-center w-100');
    const flashMessageContainer         = $('<div>').addClass('row no-gutters w-100');
    const flashMessage                  = $('<div>').addClass('col-11 flash-message-content')
                                                    .append($('<p>').html(message));
    const flashMessageCloseBtnContainer = $('<div>').addClass('col-1');
    const flashMessageCloseBtnFlex      = $('<div>').addClass('d-flex justify-content-end flash-message-close-btn-flex');
    const flashMessageCloseBtn          = $('<div>').addClass('flash-message-close-btn')
                                                    .append(
                                                        $('<a>').attr('href', '#_')
                                                                .text('x')
                                                                .click(function(e) {
                                                                  $('#flash_messages_outer_container').fadeOut("slow", function(){
                                                                    $('#flash_messages_outer_container').remove();
                                                                  });
                                                                })
                                                    );
    flashMessageCloseBtnFlex.append(flashMessageCloseBtn);
    flashMessageCloseBtnContainer.append(flashMessageCloseBtnFlex);

    flashMessageContainer.append(flashMessage, flashMessageCloseBtnContainer);
    flashMessageContentContainer.append(flashMessageContainer);

    flashType.append(flashSvgContainer, flashMessageContentContainer);

    flashMessagesContainer.append(flashType);
    flashMessagesOuterContainer.append(flashMessagesContainer);

    return flashMessagesOuterContainer;
  }

  class ServiceCatalogItemDetailBuilder {
    constructor(locale) {
      this.locale                 = locale;
      this.userRole               = null;
      this.currency               = null;
      this.serviceCategoriesItems = null;
    }

    build(data) {
      this.userRole               = userRole();
      this.currency               = data.currency;
      this.serviceCategoriesItems = data.service_catalog_data;

      $.each(this.serviceCategoriesItems, (serviceCategory, data) => {
        let containerId = `${serviceCategory}_container`;
        let container   = $(`#${containerId}`);
        if (!isMyAssignedAssets(serviceCategory) && data.service_items) {
          let serviceItems = Array.isArray(data.service_items) ? data.service_items : JSON.parse(data.service_items);
          $.each(serviceItems, (index, serviceCategoryItem) => {
            container.after(this.buildDetailPage(serviceCategory, serviceCategoryItem));
            this.bindItemDetailEventListener(this.userRole, serviceCategory, serviceCategoryItem);
          });
        }
      });
    }

    buildDetailPage(serviceCategory, serviceCategoryItem) {
      const displayFields       = serviceCategoryItem.display_fields;
      const containerId         = `detail_page_container${serviceCategoryItem.id}${serviceCategory}${displayFields.title.value}`;       
      const queryParams         = {};
      const detailPageContainer = $('<div>').attr('id', containerId)
                                            .addClass('row')
                                            .css({ 'display': 'none', 'margin-top': '38px', 'margin-right': '184px' });

      const imageContainer  = $('<div>').addClass('col-3');
      const placeholderPath = placeholderImagePath(serviceCategoryItem);
      const image = $('<img>').attr('src', serviceCategoryItem.display_picture_url || placeholderPath)
                              .attr('alt', 'placeholder image')
                              .addClass('w-100')
                              .on('error', function() {
                                // If the image fails to load, replace the source with a placeholder image
                                $(this).attr('src', placeholderPath);
                              });
      imageContainer.append(image);

      getComputedStyle(document.documentElement).getPropertyValue('--ez_text_font');
      const textColor   = getComputedStyle(document.documentElement).getPropertyValue('--ez_text_color');
      const headingFont = getComputedStyle(document.documentElement).getPropertyValue('--ez_heading_font');

      const detailPageContent = $('<div>').addClass('col-9');
      const detailPageHeader  = $('<div>').addClass('d-flex justify-content-between');
      const headerContent = $('<div>').append($('<p>').text(displayFields.title.value)
                                                      .css({ 'color': textColor, 'line-height': '17px', 'font-family': headingFont, 'font-weight': '600', 'font-size': '16px' }));
      if (displayFields.cost_price.value > 0) {
        headerContent.append($('<p>').text(`${this.currency} ${parseFloat(displayFields.cost_price['value'])}`)
                                     .css({ 'color': textColor, 'line-height': '17px', 'font-family': headingFont, 'font-size': '14px' }));
      }

      queryParams['item_name']            = displayFields.title.value;
      queryParams['ticket_form_id']       = serviceCategoryItem.zendesk_form_id;
      queryParams['service_item_id']      = serviceCategoryItem.id;
      queryParams['service_category']     = this.serviceCategoriesItems[serviceCategory].title;
      queryParams['subject-placeholder']  = t('request-service', 'Request Service');
      const url = `/hc/requests/new?${$.param(queryParams)}`;

      const requestServiceBtnContainer = $('<div>').addClass('request-service-btn-container');
      const requestServiceBtn = $('<a>').attr('href', url)
                                        .attr('data-i18n', 'request-service')
                                        .text('Request Service')
                                        .addClass('btn btn-outline-primary request-service-btn js-request-service-btn');
      requestServiceBtnContainer.append(requestServiceBtn);

      detailPageHeader.append(headerContent, requestServiceBtnContainer);

      const detailPageBody = $('<div>').addClass('mt-3');
      if (Object.keys(displayFields).length) {
        $.each(displayFields, (fieldName, fieldData) => {
          // Only showing description field for now.
          if (fieldName == 'description') {
            let section         = $('<section>');
            let sectionHeader   = $('<p>').attr('data-i18n', 'service-item-details')
                                          .text(fieldData.label)
                                          .css({ 'color': textColor, 'line-height': '17px', 'font-style': headingFont, 'font-weight': '600', 'font-size': '16px' });
            let sectionContent  = this.prepareSectionContent(fieldData);
            section.append(sectionHeader, sectionContent);
            detailPageBody.append(section);
          }
        });
      }

      detailPageContent.append(detailPageHeader, detailPageBody);
      detailPageContainer.append(imageContainer, detailPageContent);

      return detailPageContainer;
    }

    prepareSectionContent(fieldData) {
      const textFont    = getComputedStyle(document.documentElement).getPropertyValue('--ez_text_font');
      const textColor   = getComputedStyle(document.documentElement).getPropertyValue('--ez_text_color');
      const fieldValue  = fieldData['value'];
      const fieldFormat = fieldData['format'];

      if (!fieldFormat) { return $('<p>').text(fieldValue).css({ 'color': textColor, 'font-size': '14px', 'font-weight': '400', 'line-height': '17px', 'font-family': textFont, 'font-size': '12px' }); }

      if (fieldFormat === 'list') {
        const listEle     = $('<ul>').addClass('service-item-detail-description-list');
        const listValues  = fieldValue.split(',');

        $.each(listValues, function(index, value) {
          let listItem = $("<li>").text(value);
          listEle.append(listItem);
        });

        return listEle;
      }
    }

    bindItemDetailEventListener(userRole, serviceCategory, serviceCategoryItem) {
      $('body').on('click', '.js-service-item-detail-page-btn, .js-default-service-item', function(e) {
        e.preventDefault();

        const id           = $(this).data('id');
        const name         = $(this).data('name');
        const containerId  = $(this).data('container-id');
        const containerEle = $(`#${containerId}`);
        const detailPageContainerId = `detail_page_container${id}${name}`;
        // to-do: unable to find elemeny by id using jquery but its found using javascript??
        const detailPageEle = $(document.getElementById(detailPageContainerId));
        $('#service_catalog_item_search_results_container').hide();
        containerEle.hide();
        $("[id*='_service_items_container']").hide();
        $('#service_items_container').show();
        detailPageEle.show();
      });

      $('body').on('click', '.js-request-service-btn', function(e) {
        if (userRole == 'agent') {
          if ($('#flash_messages_outer_container').length == 0 && !getCookie('agent_ticket_submission_flash_message_shown_from_detail_page')) {
            let flashModal = renderFlashMessages(
              null,
              requestSubmissionSettingMessageForAgent()
            );
            setCookieForXHours(0.10, 'agent_ticket_submission_flash_message_shown_from_detail_page');
            $(flashModal).hide().appendTo('body').fadeIn('slow');
          }
          return false;
        } else {
          return true;
        }
      });
    }
  }

  class ServiceCatalogItemBuilder {
    constructor(locale, integrationMode) {
      this.locale                 = locale;
      this.currency               = null;
      this.integrationMode        = integrationMode;
      this.zendeskFormData        = null;
      this.serviceCategoriesItems = null;
    }

    build(data) {
      this.currency               = data.currency;
      this.serviceCategoriesItems = data.service_catalog_data;

      const serviceCategories     = Object.keys(this.serviceCategoriesItems);
      const serviceItemsContainer = $('<div>').attr('id', 'service_items_container')
                                              .addClass('col-10 service-items-container');

      serviceCategories.forEach((serviceCategory, index) => {
        const serviceCategoryItems = this.serviceCategoriesItems[serviceCategory];
        serviceItemsContainer.append(this.buildServiceCategoryItems(serviceCategory, serviceCategoryItems, 0 === index));
      });

      return serviceItemsContainer;
    }

    buildServiceCategoryItems(serviceCategory, serviceCategoryItems, isVisible) {
      const serviceCategoryItemsContainer = $('<div>');
      serviceCategoryItemsContainer.attr('id', `${serviceCategory}_container`);
      if (!isVisible) { serviceCategoryItemsContainer.addClass('collapse'); }

      const serviceCategoryTitle       = serviceCategoryItems.title;
      const serviceCategoryLabel       = $('<p>').attr('data-i18n', generateI18nKey(serviceCategoryTitle))
                                                 .text(serviceCategoryTitle)
                                                 .addClass('service-category-label');
      const serviceCategoryDescription = $('<p>').attr('data-i18n', generateI18nKey(`${serviceCategoryTitle} Description`))
                                                 .text(serviceCategoryItems.description)
                                                 .addClass('service-category-description');

      serviceCategoryItemsContainer.append(serviceCategoryLabel, serviceCategoryDescription);

      const serviceCategoryItemsFlexContainer = $('<div>').attr('id', `${serviceCategory}_service_items_container`);
      if (!isVisible) { serviceCategoryItemsFlexContainer.append(loadingIcon('col-10')); }

      const serviceCategoryItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');
      if (serviceCategoryItems.service_items) {
        let serviceItems = [];
        if (isMyAssignedAssets(serviceCategory)) {
          if (this.integrationMode === 'custom_objects') {
            serviceItems = serviceCategoryItems.service_items;
          } else {
            serviceItems         = getMyAssignedAssetsServiceItems(serviceCategoryItems);
            this.zendeskFormData = serviceCategoryItems.zendesk_form_data;
          }
        } else {
          serviceItems = Array.isArray(serviceCategoryItems.service_items) ? serviceCategoryItems.service_items : JSON.parse(serviceCategoryItems.service_items);
        }

        if (serviceItems.length) {
          serviceItems.forEach((serviceCategoryItem, index) => {
            if(serviceCategoryItem) { serviceCategoryItemsFlex.append(this.buildServiceCategoryItem(serviceCategory, serviceCategoryItem)); }        });
        }
      } else {
        if (isMyAssignedAssets(serviceCategory)) {
          // render empty screen
          serviceCategoryItemsFlexContainer.append(noServiceItems(t('no-assigned-items')));
        }
      }

      serviceCategoryItemsFlexContainer.append(serviceCategoryItemsFlex);
      serviceCategoryItemsContainer.append(serviceCategoryItemsFlexContainer);

      return serviceCategoryItemsContainer;
    }

    buildServiceCategoryItem(serviceCategory, serviceItem) {
      if (isMyAssignedAssets(serviceCategory)) {
        return this.buildItAssetServiceItem(serviceCategory, serviceItem);
      } else {
        return this.buildDefaultServiceItem(serviceCategory, serviceItem);
      }
    }

    buildItAssetServiceItem = (serviceCategory, serviceCategoryItem) => {
      const card                 = $('<div>').addClass('row service-item-card js-service-item-card h-100');
      const queryParams          = {};
      const serviceCategoryTitle = this.serviceCategoriesItems[serviceCategory].title;

      // Card image
      const cardImageContainer    = $('<div>').addClass('col-4');
      const cardImageFlex         = $('<div>').addClass('d-flex flex-column h-100 service-item-card-image-container');
      const placeholderPath       = placeholderImagePath(serviceCategoryItem);
      const cardImage             = $('<img>').attr('src', serviceCategoryItem.display_picture_url)
                                              .attr('alt', 'IT Asset')
                                              .addClass('w-100')
                                              .on('error', function() {
                                                // If the image fails to load, replace the source with a placeholder image
                                                $(this).attr('src', placeholderPath);
                                              });
      cardImageFlex.append(cardImage);
      cardImageContainer.append(cardImageFlex);

      // Card body
      const cardBody = $('<div>').addClass('col-8 card-body');

      // Card title
      const assetName = serviceCategoryItem.name;
      const cardTitle = $('<p>').text(assetName)
                                .addClass('card-title truncate-text')
                                .attr('data-text', assetName);
      cardBody.append(cardTitle);

      // Card content
      const cardContentContainer = $('<div>').addClass('card-content-container');
      const cardContent          = $('<table>').addClass('card-content-table');

      this.populateCardContent(cardContent, serviceCategoryItem);

      cardContentContainer.append(cardContent);
      cardBody.append(cardContentContainer);

      debugger;
      queryParams['item_id']              = serviceCategoryItem.sequence_num;
      queryParams['item_name']            = assetName;
      queryParams['ticket_form_id']       = this.zendeskFormId(serviceCategoryItem) || serviceCategoryItem.zendesk_form_id;
      queryParams['service_category']     = t(generateI18nKey(serviceCategoryTitle), serviceCategoryTitle);
      queryParams['subject-placeholder']  = t('report-issue', 'Report Issue');

      // Card footer
      const url              = `/hc/requests/new?${$.param(queryParams)}`;
      const cardFooter       = $('<div>').addClass('it-asset-card-footer w-100');
      const submitRequestBtn = $('<a>').attr('href', url)
                                       .attr('data-i18n', 'report-issue')
                                       .text('Report Issue ')
                                       .addClass('float-end footer-text js-service-item-request-btn');
      submitRequestBtn.append($('<span>').html('&#8594;').addClass('footer-arrow'));
      cardFooter.append(submitRequestBtn);

      cardBody.append(cardFooter);
      card.append(cardImageContainer, cardBody);
      debugger;

      card.click(function(e) {
        e.preventDefault();

        if (userRole() == 'agent') {
          if ($('#flash_messages_outer_container').length == 0 && !getCookie('agent_ticket_submission_flash_message_shown')) {
            let flashModal = renderFlashMessages(
              null,
              requestSubmissionSettingMessageForAgent()
            );
            setCookieForXHours(0.10, 'agent_ticket_submission_flash_message_shown');
            $(flashModal).hide().appendTo('body').fadeIn('slow');
          }
        } else {
          window.location.href = url;
        }
      });

      return card;
    }

    buildDefaultServiceItem(serviceCategory, serviceCategoryItem) {
      const displayFields = serviceCategoryItem.display_fields;
      const card          = $('<div>').addClass('row service-item-card border border-light js-default-service-item')
                                      .data('id', `${serviceCategoryItem.id}${serviceCategory}`)
                                      .data('name', displayFields.title.value)
                                      .data('container-id', `${serviceCategory}_service_items_container`);

                                      debugger;
      // Create the card image element
      const cardImageContainer = $('<div>').addClass('col-4');
      const cardImageFlex      = $('<div>').addClass('d-flex flex-column h-100 service-item-card-image-container');
      const placeholderPath    = placeholderImagePath(serviceCategoryItem);
      const cardImage          = $('<img>').attr('src', serviceCategoryItem.display_picture_url || placeholderPath)
                                           .attr('alt', 'Software')
                                           .addClass('w-100')
                                           .on('error', function() {
                                                // If the image fails to load, replace the source with a placeholder image
                                                $(this).attr('src', placeholderPath);
                                            });
      cardImageFlex.append(cardImage);
      cardImageContainer.append(cardImageFlex);

      // Create the card body
      const cardBody = $('<div>').addClass('col-8 card-body service-item-card-body');

      // card title
      const itemName   = displayFields.title.value;
      const cardTitle  = $('<p>').text(itemName)
                                 .addClass('card-title truncate-text')
                                 .attr('data-text', itemName);
      cardBody.append(cardTitle);

      // card description
      const cardDescription = $('<p>').text(displayFields.short_description.value)
                                      .addClass('description');
      cardBody.append(cardDescription);

      //card footer (price and arrow)
      const cardFooter = $('<div>').addClass('card-footer w-100');

      if (displayFields.cost_price.value > 0) {
        const price = $('<span>').text(`${this.currency} ${parseFloat(displayFields.cost_price['value'])}`);
        cardFooter.append(price);
      }

      const arrowContainer = $('<a>').attr('href', '#_')
                                     .attr('data-i18n', 'request')
                                     .text('Request')
                                     .addClass('float-end footer-text');
      const arrow          = $('<span>').html('&#8594;')
                                        .addClass('footer-arrow float-end js-service-item-detail-page-btn')
                                        .data('id', `${serviceCategoryItem.id}${serviceCategory}`)
                                        .data('name', displayFields.title.value)
                                        .data('container-id', `${serviceCategory}_service_items_container`);
      
      arrowContainer.append(arrow);
      cardFooter.append(arrowContainer);

      cardBody.append(cardFooter);
      card.append(cardImageContainer, cardBody);

      return card;
    }

    populateCardContent(cardContentElement, serviceCategoryItem) {
      const fields  = serviceCategoryItem.asset_columns || serviceCategoryItem.software_license_columns || serviceCategoryItem.display_fields;

      debugger;
      if (Object.keys(fields).length === 0) {
        const noAttributesText = 'No attributes configured';
        cardContentElement.append($('<tr>').append(
          this.fieldValueElement(noAttributesText, 'th', noAttributesText.length).attr('data-i18n', 'no-attributes-configured')
        ));
        return;
      }

      debugger;
      // 'en' is already translated from rails side.
      $.each(fields, (label, value) => {
        let newRow        = $('<tr>');
        let columnLabelEle = this.fieldValueElement(label || DEFAULT_FIELD_VALUE, 'th', DEFAULT_TRUNCATE_LENGTH);
        if (this.locale == 'fr') {
          columnLabelEle.attr('data-i18n', generateI18nKey(label));
        }
        newRow.append(columnLabelEle);

        newRow.append(this.fieldValueElement(value || DEFAULT_FIELD_VALUE, 'td', CARD_FIELD_VALUE_TRUNCATE_LENGTH));
        cardContentElement.append(newRow);
      });
    }

    fieldValueElement(value, eleType, maxLength) {
      const ele = $(`<${eleType}>`);
      const truncationRequired = value.length > maxLength;
      if (!truncationRequired) { return ele.text(value); }

      const truncatedValue = truncationRequired ? `${value.substring(0, maxLength)}...` : value;
      return ele.text(truncatedValue)
                .attr('title', value)
                .attr('data-toggle', 'tooltip');
    }

    zendeskFormId(serviceItem) {
      const type = serviceItem.type;
      if (type === 'assigned_asset') {
        return this.zendeskFormData.assets;
      } else if (type === 'assigned_software_license') {
        return this.zendeskFormData.software_entitlements;
      }
    }

    buildAndRenderServiceItems = (data, serviceItemsContainer) => {
      // first child is the flexbox which contains service items
      const serviceCategoryItemsData = data.service_catalog_data;
      this.currency      = data.currency;
      const categoryName = Object.keys(serviceCategoryItemsData)[0];
      const serviceCategoryData = serviceCategoryItemsData[categoryName];
      $(serviceItemsContainer).children().first().hide(); // loading icon
      const serviceCategoryItemsFlex = $(serviceItemsContainer).children().last();
      serviceCategoryItemsFlex.empty();

      let serviceCategoryItems = [];
      if (isMyAssignedAssets(categoryName)) {
        serviceCategoryItems = getMyAssignedAssetsServiceItems(serviceCategoryData);
      } else {
        serviceCategoryItems = serviceCategoryData.service_items ? JSON.parse(serviceCategoryData.service_items) : [];
      }

      if (serviceCategoryItems.length) {
        serviceCategoryItems.forEach((serviceCategoryItem, index) => {
          if(serviceCategoryItem) { serviceCategoryItemsFlex.append(this.buildServiceCategoryItem(categoryName, serviceCategoryItem)); }      });
      }
      if (!isMyAssignedAssets(categoryName)) { new ServiceCatalogItemDetailBuilder().build(data); }  }
  }

  class Search {
      constructor() {
          this.itemBuilder = null;
          this.itemDetailBuilder = null;
      }

      /**
       * Safely parses search results from JSON string or returns array directly.
       * @param {Array|string} searchResults
       * @returns {Array}
       */
      parseSearchResults = (searchResults) => {
          if (Array.isArray(searchResults)) return searchResults;

          if (typeof searchResults === 'string') {
              try {
                  return JSON.parse(searchResults);
              } catch (e) {
                  console.error('Invalid JSON string:', e);
              }
          }
          return [];
      };

      /**
       * Clears previous results and displays a no-results message if needed.
       * @param {Object} container
       * @param {Array} results
       * @returns {boolean} - Returns true if no results found.
       */
      handleNoResults = (container, results) => {
          container.empty();
          if (results.length === 0) {
              container.append(noResultsFound());
              return true;
          }
          return false;
      };

      /**
       * Renders the search results.
       * @param {Array} results
       * @param {Object} container
       */
      renderResults = (results, container) => {
          const searchItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

          results.forEach((serviceItem) => {
              if (serviceItem && serviceItem.service_category_title_with_id) {
                  const serviceCategory = serviceItem.service_category_title_with_id;
                  const serviceCategoryItem = this.itemBuilder.buildServiceCategoryItem(serviceCategory, serviceItem);

                  this.itemDetailBuilder.bindItemDetailEventListener(serviceCategoryItem);
                  searchItemsFlex.append(serviceCategoryItem);
              }
          });

          container.append(searchItemsFlex);
      };

      /**
       * Updates the search results and renders them in the provided container.
       * @param {Object} data - The data containing search results.
       * @param {Object} options - Options including the container and builders.
       */
      updateResults = (data, options) => {
          if (!options || !options.searchResultsContainer) {
              console.error('Invalid options provided.');
              return;
          }

          // Parse and validate search results
          const searchResults = this.parseSearchResults(data.search_results);

          // Initialize builders
          this.itemBuilder = options.itemBuilder;
          this.itemDetailBuilder = options.itemDetailBuilder;

          // Handle no results case
          if (this.handleNoResults(options.searchResultsContainer, searchResults)) return;

          // Render search results
          this.renderResults(searchResults, options.searchResultsContainer);
      };
  }

  class ApiService {
    constructor(locale, ezoSubdomain, integrationMode) {
      this.locale           = locale;
      this.ezoSubdomain     = ezoSubdomain;
      this.integrationMode  = integrationMode;
    }

    fetchServiceCategoriesAndItems(callback, noAccessPageCallback, options) {
      $.getJSON('/hc/api/v2/integration/token').then(data => data.token).then(token => {
        if (token) {
          const endPoint        = 'visible_service_categories_and_items';
          const queryParams     = {};
          const requestOptions  = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token }};

          if(options.searchQuery) {
            queryParams.search_query = options.searchQuery; 
          }

          const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json' + '?' + $.param(queryParams);
          fetch(url, requestOptions)
            .then(response => {
              if (response.status == 400) {
                throw new Error('Bad Request: There was an issue with the request.');
              } else if (response.status == 403) {
                return response.json().catch(() => {
                  return noAccessPageCallback();
                });
              } else if (response.status == 404) {
                return noAccessPageCallback();
              }

              if (!response.ok) {
                throw new Error('Network response was not ok');
              }

              return response.json();
            })
            .then(data => {
              $('#loading_icon_container').empty();
              if (data.service_catalog_enabled !== undefined && !data.service_catalog_enabled) {
                $('main').append(serviceCatalogDisabled(this.ezoSubdomain));
              } else if (!serviceCatalogDataPresent(data) && !data.search_results) {
                $('main').append(serviceCatalogEmpty(this.ezoSubdomain));
              } else {
                callback(data, options);
              }
              setLocale(this.locale, true);
            })
            .catch(error => {
              console.error('An error occurred while fetching service categories and items: ' + error.message);
            });
        }
      });
    }

    fetchServiceCategoriesAndItemsUsingCustomObjects(callback, noAccessPageCallback, options) {
      $.getJSON("/api/v2/users/me")
          .then(userData => userData.user.email)
          .then(userEmail => {
              if (userEmail) {
                const assetsRequest       = fetch(`/api/v2/custom_objects/assetsonar_assets/records/search?query=${userEmail}`);
                const serviceItemsRequest = fetch("/api/v2/custom_objects/assetsonar_service_items/records/search");

                Promise.all([assetsRequest, serviceItemsRequest])
                    .then(responses => {
                        // Check response statuses
                        responses.forEach(response => {
                          if (response.status === 400) {
                            throw new Error('Bad Request: There was an issue with the request.');
                          } else if (response.status === 403 || response.status === 404) {
                            throw new Error('Access or resource not found.');
                          } else if (!response.ok) {
                            throw new Error('Network response was not ok');
                          }
                        });

                        // Parse JSON responses
                        return Promise.all(responses.map(response => response.json()));
                    })
                    .then(([assetsData, serviceItemsData]) => {
                        $('#loading_icon_container').empty();

                        const restructuredData = {};
                        const combinedCustomObjectRecords = [
                          ...(assetsData.custom_object_records || []),
                          ...(serviceItemsData.custom_object_records || [])
                        ];

                        const filteredCustomObjectRecords = combinedCustomObjectRecords.filter(record => {
                          const isVisible = record.custom_object_fields.visible === 'true';
                          const matchesSearchQuery = options.searchQuery
                              ? record.name && record.name.toLowerCase().includes(options.searchQuery.toLowerCase())
                              : true; // If no search query, include all visible records
                          return isVisible && matchesSearchQuery;
                        });
                        filteredCustomObjectRecords.forEach((record, index) => {
                          const categoryKey = `${record.custom_object_fields.service_category_id || index}_${(record.custom_object_fields.service_category_title || 'Unknown').replace(/\s+/g, '_')}`;
                          const resourceType = record.custom_object_fields.resource_type;

                          if (!restructuredData[categoryKey]) {
                            restructuredData[categoryKey] = {
                              title:          record.custom_object_fields.service_category_title || 'Unknown',
                              description:    record.custom_object_fields.service_category_description || '',
                              service_items:  []
                            };
                          }

                          if (resourceType === 'FixedAsset') {
                            restructuredData[categoryKey].service_items.push({
                              id: record.custom_object_fields.asset_id,
                              name: record.custom_object_fields.asset_name || record.name, 
                              display_fields: {
                                'AIN':       record.custom_object_fields.identifier,
                                'Asset #':   record.custom_object_fields.sequence_num,
                                'Location':  record.custom_object_fields.location
                              },
                              sequence_num:                     record.custom_object_fields.sequence_num,
                              zendesk_form_id:                  record.custom_object_fields.zd_form_id || null,
                              display_picture_url:              record.custom_object_fields.display_picture_url || '',
                              service_category_title_with_id:   categoryKey
                            });
                          } else if (resourceType === 'EzPortal::Card') {
                            var serviceItemHash = {
                              id: record.custom_object_fields.service_item_id,
                              display_fields: {
                                title:              { value: record.custom_object_fields.title || '' },
                                cost_price:         { value: record.custom_object_fields.cost_price || null },
                                description:        { value: record.custom_object_fields.description || '' },
                                short_description:  { value: record.custom_object_fields.short_description || '' },
                              },
                              zendesk_form_id:                  record.custom_object_fields.zd_form_id || null,
                              display_picture_url:              record.custom_object_fields.display_picture_url || '',
                              service_category_title_with_id:   categoryKey
                            };
                            restructuredData[categoryKey].service_items.push(serviceItemHash);
                          }
                        });

                        // Create the final data structure
                        const combinedData = {
                          service_catalog_data:    restructuredData,
                          service_catalog_enabled: true,
                        };

                        if (options.searchQuery && options.searchQuery.length) {
                          combinedData.search_results = Object.values(restructuredData).flatMap(category => category.service_items);
                        }

                        if (combinedData.service_catalog_enabled !== undefined && !combinedData.service_catalog_enabled) {
                          $('main').append(serviceCatalogDisabled(this.ezoSubdomain));
                        } else if (!serviceCatalogDataPresent(combinedData) && Object.keys(combinedData.service_catalog_data).length === 0 && !combinedData.search_results) {
                          $('main').append(serviceCatalogEmpty(this.ezoSubdomain));
                        } else {
                          callback(combinedData, options);
                        }

                        setLocale(this.locale, true);
                    })
                    .catch(error => {
                        console.error('An error occurred while fetching service categories and items: ' + error.message);
                        noAccessPageCallback();
                    });
              }
          });
    }

    fetchServiceCategoryItems(categoryId, callback, callBackOptions) {
      $.getJSON('/hc/api/v2/integration/token').then(data => data.token).then(token => {
        if (token) {
          const options       = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } };
          const endPoint      = 'visible_service_categories_and_items';
          const queryParams   = {
            service_category_id: categoryId
          }; 
          const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json' + '?' + $.param(queryParams);
          $('#loading_icon_container').show();

          fetch(url, options)
            .then(response => {
              if (response.status === 400) {
                throw new Error('Bad Request: There was an issue with the request.');
              } else if (response.status === 404) {
                return noAccessPageCallback();
              }
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(data => {
              callback(data, callBackOptions.serviceItemsContainerId);
              setLocale(this.locale, true);
            })
            .catch(error => {
              console.error('An error occurred while fetching service categories and items: ' + error.message);
            });
        }
      });
    }

    withToken() {
      return $.getJSON('/hc/api/v2/integration/token').then(data => data.token);
    }
  }

  class ServiceCatalogBuilder {
    constructor(locale, ezoSubdomain, integrationMode) {
      this.locale                          = locale;
      this.apiService                      = new ApiService(locale, ezoSubdomain, integrationMode);
      this.ezoSubdomain                    = ezoSubdomain;
      this.integrationMode                 = integrationMode;
      this.serviceCatalogItemBuilder       = new ServiceCatalogItemBuilder(locale, integrationMode);
      this.serviceCatalogItemDetailBuilder = new ServiceCatalogItemDetailBuilder(locale, integrationMode);
      this.search                          = new Search();
    }

    addMenuItem(name, url, parentEle) {
      const parentElement = $(`#${parentEle}`);
      const serviceCatalogNavItem = $('<a>', {
                                      href: url,
                                      text: name
                                    }).addClass('service-catalog-nav-item nav-link')
                                      .attr('data-i18n', 'service-catalog');
      const firstChildElement = parentElement.children(':first');
      if (firstChildElement.is('ul')) {
        firstChildElement.prepend($('<li>').append(serviceCatalogNavItem));
      } else {
        parentElement.prepend(serviceCatalogNavItem);
      }
    }

    buildServiceCatalog() {
      this.buildServiceCatalogHeaderSection();
      $('main').append(loadingIcon('mt-5'));
      if (this.integrationMode === 'custom_objects') {
        this.apiService.fetchServiceCategoriesAndItemsUsingCustomObjects(this.buildUI, this.noAccessPage, {});
      } else {
        this.apiService.fetchServiceCategoriesAndItems(this.buildUI, this.noAccessPage, {});
      }
    }

    buildServiceCatalogHeaderSection() {
      const headerSection     = $('<section>');
      const headerContainer   = $('<div>').addClass('jumbotron jumbotron-fluid service-catalog-header-container');
      const headerEle         = $('<h2>').addClass('service-catalog-header-label')
                                         .attr('data-i18n', 'service-catalog')
                                         .text('Service Catalog');
      const headerDescription = $('<p>').addClass('service-catalog-description')
                                        .attr('data-i18n', 'service-catalog-description')
                                        .text('Explore the Service Catalog to find a curated range of solutions to your needs');
      headerContainer.append(headerEle, headerDescription);
      headerSection.append(headerContainer);
      $('main').append(headerSection);
    }

    buildUI = (data, options) => {
      this.data = data;

      const newSection = $('<section>').attr('id', 'service_catalog_section')
                                       .addClass('service-catalog-section');

      const serviceCatalogContainer   = $('<div>').addClass('row');
      const searchAndNavContainer     = $('<div>').addClass('col-2');
      const searchAndNavContainerText = $('<p>').addClass('service-categories-heading')
                                                .attr('data-i18n', 'categories')
                                                .text('Categories');

      const searchField = $('<input>').attr('id', 'search_input')
                                      .attr('type', 'text')
                                      .attr('data-i18n', 'search')
                                      .attr('placeholder', 'search...');
      const searchBar = $('<div>').append(searchField).addClass('service-catalog-search');
      searchAndNavContainer.append(searchAndNavContainerText, searchBar);

      const containers = {
        newSection: newSection,
        searchAndNavContainer: searchAndNavContainer,
        serviceCatalogContainer: serviceCatalogContainer
      };
      this.createServiceCategoriesView(containers);
    }

    createServiceCategoriesView(containers) {
      const navbarContainer = $('<div>').attr('id', 'service_categories_list')
                                        .addClass('service-categories-list');
      const navbar = this.generateNavbar();
      navbarContainer.append(navbar);

      const newSection              = containers['newSection'];
      const searchAndNavContainer   = containers['searchAndNavContainer'];
      const serviceCatalogContainer = containers['serviceCatalogContainer'];

      searchAndNavContainer.append(navbarContainer);
      const serviceItemsContainer   = this.serviceCatalogItemBuilder.build(this.data);
      const searchResultsContainer  = $('<div>').attr('id', 'service_catalog_item_search_results_container')
                                                .addClass('col-10 collapse service-catalog-search-results-container');
      serviceCatalogContainer.append(searchAndNavContainer, serviceItemsContainer, searchResultsContainer);
      newSection.append(serviceCatalogContainer);

      $('main').append(newSection);
      this.serviceCatalogItemDetailBuilder.build(this.data);
      this.bindEventListeners();
      this.addTooltipsForTruncatedText();
    }

    // Create a function to generate the vertical navbar
    generateNavbar() {
      const navbar                 = $('<ul>');
      let activeClassAdded         = false;
      const serviceCategoriesItems = this.data.service_catalog_data;

      $.each(serviceCategoriesItems, function(serviceCategory, serviceCategoryData) {
        let link     = '#_';
        let listItem = $('<li>').append($('<a>')
                                .attr({ 'id': serviceCategory + '_link' ,'href': link, 'target': '_blank', 'data-i18n': generateI18nKey(serviceCategoryData.title) })
                                .text(serviceCategoryData.title));
        if (!activeClassAdded) {
          activeClassAdded = true;
          listItem.addClass('active');
        }
        navbar.append(listItem);
      });

      return navbar;
    }

    bindEventListeners() {
      let timer                  = null;
      const self                 = this;
      const serviceCategories    = Object.keys(this.data.service_catalog_data);
      const serviceCategoriesIds = serviceCategories.map(serviceCategory => '#' + serviceCategory + '_link');

      $(serviceCategoriesIds.join(', ')).click(function(e) {
        var categoryLinkId = $(this).attr('id');
        if ($('#' + e.target.id).parent().hasClass('active') ) { return false; }

        $('#service_categories_list ul li.active').removeClass('active');
        $('#' + e.target.id).parent().addClass('active');

        e.preventDefault();

        var containerId = categoryLinkId.replace('_link', '_container');

        // hide service items of remaining categories
        $.each(serviceCategoriesIds, function(index, serviceCategoryId) {
          if ('#' + categoryLinkId === serviceCategoryId) ; else {
            $(serviceCategoryId.replace('_link', '_container')).hide(); // Fix the replacement for hiding containers.
          }
        });

        $("[id*='detail_page_container']").hide();
        const callbackOptions = {
          serviceItemsContainerId: '#' + containerId.replace('_container', '_service_items_container')  
        };
        const categoryId = categoryLinkId.split('_')[0];
        if (self.integrationMode === 'custom_objects') {
          $('#loading_icon_container').empty();
        } else {
          self.apiService.fetchServiceCategoryItems(
            categoryId,
            self.serviceCatalogItemBuilder.buildAndRenderServiceItems,
            callbackOptions
          );
        }
        $('#service_catalog_item_search_results_container').hide();
        $('#' + containerId).show();
        $('#' + containerId.replace('_container', '_service_items_container')).show();
        $('#service_items_container').show();
      });

      $('#search_input').on('keyup', function(e) {
        e.preventDefault();

        const query                  = $(this).val().trim();
        const serviceItemsContainer  = $('#service_items_container');
        const searchResultsContainer = $('#service_catalog_item_search_results_container');

        $('#service_categories_list ul li.active');
        // to-do: Handle this.
        //activeCategory.removeClass('active');
        //searchResultsContainer.data('active-category', activeCategory);

        if (query.length === 0) {
          //searchResultsContainer.data('active-category').addClass('active');
          searchResultsContainer.hide();
          serviceItemsContainer.show();
        } else {
          serviceItemsContainer.hide();
          // Clear previous results
          searchResultsContainer.empty();
          searchResultsContainer.append(loadingIcon('col-10'));
          searchResultsContainer.show();

          if (timer) { clearTimeout(timer); }

          timer = setTimeout(
            function () {
              if (self.integrationMode === 'custom_objects') {
                self.apiService.fetchServiceCategoriesAndItemsUsingCustomObjects(
                  self.search.updateResults,
                  self.noAccessPage,
                  {
                    searchQuery: query,
                    searchResultsContainer: searchResultsContainer,
                    itemBuilder: self.serviceCatalogItemBuilder,
                    itemDetailBuilder: self.serviceCatalogItemDetailBuilder
                  }
                );
              } else {
                self.apiService.fetchServiceCategoriesAndItems(
                  self.search.updateResults,
                  self.noAccessPage,
                  {
                    searchQuery: query,
                    searchResultsContainer: searchResultsContainer,
                    itemBuilder: self.serviceCatalogItemBuilder,
                    itemDetailBuilder: self.serviceCatalogItemDetailBuilder
                  }
                );
              }
            },
            500
          );
        }
      });
    }

    addTooltipsForTruncatedText() {
      $('.truncate-text, .truncate-text-two-lines').each(function() {
        // Check if the element's scroll width is greater than its offset width
        if (this.scrollWidth > this.offsetWidth) {
          var fullText = $(this).attr('data-text');

          // Add tooltip attributes to the element
          $(this).attr('title', fullText).attr('data-toggle', 'tooltip');
        }
      });
    }

    noAccessPage() {
      const noAccessPageSection = $('<section>').attr('id', 'no_access_page_section')
                                                .addClass('no-access-page-section');

      const noAccessPageContainer = $('<div>').addClass('d-flex flex-column align-items-center');
      const noAccessImage         = $('<img>').attr('src', `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/no_access_image.svg`)
                                              .addClass('no-access-image');

      const warningMessage        = $('<h4>').attr('data-i18n', 'unauthorized-label')
                                             .text('You do not have permission to access this page!');
      const nextStepsMessage      = $('<p>').attr('data-i18n', 'contact-administrator-label')
                                            .text('Please contact your administrator to get access')
                                            .addClass('next-steps-message');

      // buttons
      const buttonsContainer      = $('<div>').addClass('d-flex mt-3 gap-3 justify-content-end');
      const goBackButton          = $('<a>').attr('href', '#_')
                                            .attr('data-i18n', 'go-back')
                                            .text('Go Back')
                                            .addClass('btn btn-outline-primary go-back-btn')
                                            .click(function() { window.history.back(); });
      buttonsContainer.append(goBackButton);

      noAccessPageContainer.append(noAccessImage, warningMessage, nextStepsMessage, buttonsContainer);
      noAccessPageSection.append(noAccessPageContainer);

      $('main').append(noAccessPageSection);
    }
  }

  class ServiceCatalogManager {
    constructor(initializationData) {
      this.locale                 = getLocale();
      this.timeStamp              = initializationData.timeStamp;
      this.ezoFieldId             = initializationData.ezoFieldId;
      this.ezoSubdomain           = initializationData.ezoSubdomain;
      this.integrationMode        = initializationData.integrationMode || 'JWT';
      this.ezoServiceItemFieldId  = initializationData.ezoServiceItemFieldId;

      const files = this.filesToLoad();
      loadExternalFiles(files, () => {
        this.initialize();
      });
    }

    initialize() {
      this.serviceCatalogBuilder = new ServiceCatalogBuilder(this.locale, this.ezoSubdomain, this.integrationMode);
      this.addServiceCatalogMenuItem();
      this.initServiceCatalog();
    }

    addServiceCatalogMenuItem() {
      this.serviceCatalogBuilder.addMenuItem('Service Catalog', '/hc/p/service_catalog', 'user-nav');
    }

    initServiceCatalog() {
      setLocale(this.locale, true);
      if (isServiceCatalogPage()) {
        this.handleServiceCatalogRequest();
      } else if (isNewRequestPage()) {
        new NewRequestForm(this.locale, this.ezoFieldId, this.ezoSubdomain, this.ezoServiceItemFieldId, this.integrationMode).updateRequestForm();
      } else if (isRequestPage()) {
        new RequestForm(this.locale, this.ezoFieldId, this.ezoSubdomain, this.ezoServiceItemFieldId, this.integrationMode).updateRequestForm();
      } else ;
    }

    handleServiceCatalogRequest() {
      if (isSignedIn()) {
        this.serviceCatalogBuilder.buildServiceCatalog();
      } else {
        window.location.href = signInPath(); 
      }
    }

    filesToLoad() {
      return [
                { type: 'link',   url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css', placement: 'prepend' },
                { type: 'link',   url: `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/service_catalog.css?${this.timeStamp}`},
                { type: 'script', url: 'https://code.jquery.com/jquery-3.6.0.min.js' }
             ];
    }
  }

  exports.ServiceCatalogManager = ServiceCatalogManager;

}));
