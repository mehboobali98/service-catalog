(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global["ServiceCatalog bundle"] = global["ServiceCatalog bundle"] || {}, global["ServiceCatalog bundle"].js = {})));
})(this, (function (exports) { 'use strict';

  const DEFAULT_FIELD_VALUE        = '--';
  const DEFAULT_TRUNCATE_LENGTH    = 15;
  const CARD_TITLE_TRUNCATE_LENGTH = 20;

  const SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING = {
    'service_item':                'service_item_placeholder',
    'assigned_asset':              'asset_placeholder',
    'assigned_software_license':   'software_license_placeholder'
  };

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

  function serviceCatalogDataPresent(data) {
    const serviceCategories = Object.keys(data);
    return serviceCategories.length > 0;
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

    const url = `${origin()}/hc/signin${$.param(queryParams)}`;
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
    return `https://raw.githubusercontent.com/mehboobali98/service-catalog/code_restructure/assets/images/svg/${imageName}.svg`;
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

  class RequestForm {
    constructor(ezoFieldId, ezoSubdomain) {
      this.ezoFieldId   = ezoFieldId;
      this.ezoSubdomain = ezoSubdomain;
    }

    updateRequestForm() {
      const self        = this;
      const requestId   = this.extractRequestId();
      const requestUrl  = '/api/v2/requests/' + requestId;

      this.hideAssetsCustomField();
      $.getJSON(requestUrl).done((data) => {
        const ezoFieldData = data.request.custom_fields.find(function (customField) { return customField.id == self.ezoFieldId });

        if (!ezoFieldData || !ezoFieldData.value) { return true; }

        return self.withToken(token => {
          if (token) {

            const parsedEzoFieldValue = JSON.parse(ezoFieldData.value);
            const assetSequenceNums   = parsedEzoFieldValue.assets.map(asset => Object.keys(asset)[0]);
            const assetNames          = parsedEzoFieldValue.assets.map(asset => Object.values(asset)[0]);

            if (!assetSequenceNums || assetSequenceNums.length == 0) { return true; }

            if (parsedEzoFieldValue.linked != 'true') {
              self.linkAssets(requestId, assetSequenceNums);
            }

            if (assetNames) {
              self.addEZOContainer();
              assetNames.map(name => {
                self.showLinkedAsset(name);
              });
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

    linkAssets(requestId, assetSequenceNums) {
      $.ajax({
        url: 'https://' + this.ezoSubdomain + '/webhooks/zendesk/sync_tickets_to_assets_relation.json',
        type: 'POST',
        data: { "ticket": { "ticket_id": requestId, "assets_field_id": this.ezoFieldId } }
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
  }

  class NewRequestForm {
    constructor(ezoFieldId, ezoSubdomain, ezoServiceItemFieldId) {
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
      if ($('.nesty-input')[0].text === "-") { return; }

      const searchParams      = this.extractQueryParams(window.location);
      const customFieldValue  = searchParams.get('item_name');

      const formSubject = this.prepareSubject(searchParams);
      if (formSubject) { $('#request_subject').val(formSubject); }
      $('#request_custom_fields_' + this.ezoServiceItemFieldId).val(customFieldValue);
      this.getTokenAndFetchAssignedAssets();
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
              'Authorization': 'Bearer ' + token,
              'ngrok-skip-browser-warning': true
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
          const ezoCustomFieldEle = $('#request_custom_fields_' + this.ezoFieldId);

          this.processData(data.assets, assetsData, 'Asset');
          this.processData(data.software_entitlements, assetsData, 'Software License');

          ezoCustomFieldEle.hide();
          ezoCustomFieldEle.after("<select multiple='multiple' id='ezo-asset-select' style='width: 100%;'></select>");

          this.renderSelect2PaginationForUsers($('#ezo-asset-select'), url, options);
          this.preselectAssetsCustomField(this.extractQueryParams(window.location));

          $('form.request-form').on('submit', function() {
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
      const itemName        = searchParams.get('item_name');
      const serviceCategory = searchParams.get('service_category');

      if (itemName == null || serviceCategory == null) { return null; }

      return `${serviceCategory} - ${itemName}`;
    }

    preselectAssetsCustomField(searchParams) {
      let ezoCustomFieldEle = $('#request_custom_fields_' + this.ezoFieldId);
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
                { type: 'link',   url: 'https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/css/select2.min.css'},
                { type: 'script', url: 'https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/js/select2.min.js'  }
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
  }

  function noResultsFound() {
    const noResultsContainer = $('<div>').attr('id', 'no_results_container')
                                       .addClass('d-flex flex-column align-items-center no-results-container');
    const noResultsImage  = $('<img>').attr('src', 'https://raw.githubusercontent.com/mehboobali98/service-catalog/code_restructure/assets/images/svg/no_results_found.svg')
                                      .addClass('no-results-image');
    const noResultsLabel  = $('<p>').text('No Result Found')
                                    .addClass('no-results-message');
    noResultsContainer.append(noResultsImage, noResultsLabel);
    return noResultsContainer;
  }

  class ServiceCatalogItemDetailBuilder {
    constructor() {
      this.currency               = null;
      this.serviceCategoriesItems = null;
    }

    build(data) {
      this.currency               = data.currency;
      this.serviceCategoriesItems = data.service_catalog_data;

      $.each(this.serviceCategoriesItems, (serviceCategory, data) => {
        let containerId = `${serviceCategory}_container`;
        let container   = $(`#${containerId}`);
        if (!isMyAssignedAssets(serviceCategory) && data.service_items) {
          let serviceItems = JSON.parse(data.service_items);
          $.each(serviceItems, (index, serviceCategoryItem) => {
            container.after(this.buildDetailPage(serviceCategory, serviceCategoryItem));
            this.bindItemDetailEventListener(serviceCategory, serviceCategoryItem);
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
      if (displayFields.cost_price) {
        headerContent.append($('<p>').text(`${this.currency} ${parseFloat(displayFields.cost_price['value'])}`)
                                     .css({ 'color': textColor, 'line-height': '17px', 'font-family': headingFont, 'font-size': '14px' }));
      }

      queryParams['item_name']        = displayFields.title.value;
      queryParams['ticket_form_id']   = serviceCategoryItem.zendesk_form_id;
      queryParams['service_category'] = this.serviceCategoriesItems[serviceCategory].title;
      const url = `/hc/requests/new?${$.param(queryParams)}`;

      const requestServiceBtnContainer = $('<div>').addClass('request-service-btn-container');
      const requestServiceBtn = $('<a>').attr('href', url)
                                        .text('Request Service')
                                        .addClass('btn btn-outline-primary request-service-btn');
      requestServiceBtnContainer.append(requestServiceBtn);

      detailPageHeader.append(headerContent, requestServiceBtnContainer);

      const detailPageBody = $('<div>').addClass('mt-3');
      if (Object.keys(displayFields).length) {
        $.each(displayFields, (fieldName, fieldData) => {
          // Only showing description field for now.
          if (fieldName == 'description') {
            let section         = $('<section>');
            let sectionHeader   = $('<p>').text(fieldData.label).css({ 'color': textColor, 'line-height': '17px', 'font-style': headingFont, 'font-weight': '600', 'font-size': '16px' });
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

    bindItemDetailEventListener(serviceCategory, serviceCategoryItem) {
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
    }
  }

  class ServiceCatalogItemBuilder {
    constructor() {
      this.currency               = null;
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

      const serviceCategoryLabel       = $('<p>').text(serviceCategoryItems.title)
                                                 .addClass('service-category-label');
      const serviceCategoryDescription = $('<p>').text(serviceCategoryItems.description)
                                                 .addClass('service-category-description');

      serviceCategoryItemsContainer.append(serviceCategoryLabel, serviceCategoryDescription);

      const serviceCategoryItemsFlexContainer = $('<div>').attr('id', `${serviceCategory}_service_items_container`);
      if (!isVisible) { serviceCategoryItemsFlexContainer.append(loadingIcon('col-10')); }

      const serviceCategoryItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

      let serviceItems = [];
      if (isMyAssignedAssets(serviceCategory)) {
        serviceItems         = getMyAssignedAssetsServiceItems(serviceCategoryItems);
        this.zendeskFormData = serviceCategoryItems.zendesk_form_data;
      } else {
        serviceItems = serviceCategoryItems.service_items ? JSON.parse(serviceCategoryItems.service_items) : [];
      }

      if (serviceItems.length) {
        serviceItems.forEach((serviceCategoryItem, index) => {
          if(serviceCategoryItem) { serviceCategoryItemsFlex.append(this.buildServiceCategoryItem(serviceCategory, serviceCategoryItem)); }      });
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
      const card        = $('<div>').addClass('row service-item-card');
      const queryParams = {};

      // Card image
      const cardImageContainer    = $('<div>').addClass('col-4');
      const cardImageFlex         = $('<div>').addClass('d-flex flex-column h-100');
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
      const cardTitle = this.fieldValueElement(assetName, 'p', CARD_TITLE_TRUNCATE_LENGTH)
                            .addClass('card-title');
      cardBody.append(cardTitle);

      // Card content
      const cardContentContainer = $('<div>').addClass('card-content-container');
      const cardContent          = $('<table>').addClass('card-content-table');

      const fields = serviceCategoryItem.asset_columns || serviceCategoryItem.software_license_columns;
      $.each(fields, (label, value) => {
        let newRow = $('<tr>');
        newRow.append(this.fieldValueElement(label || DEFAULT_FIELD_VALUE, 'th', label.length));
        newRow.append(this.fieldValueElement(value || DEFAULT_FIELD_VALUE, 'td', DEFAULT_TRUNCATE_LENGTH));
        cardContent.append(newRow);
      });
      cardContentContainer.append(cardContent);
      cardBody.append(cardContentContainer);

      queryParams['item_id']          = serviceCategoryItem.sequence_num;
      queryParams['item_name']        = assetName;
      queryParams['ticket_form_id']   = this.zendeskFormId(serviceCategoryItem);
      queryParams['service_category'] = this.serviceCategoriesItems[serviceCategory].title;

      // Card footer
      const url              = `/hc/requests/new?${$.param(queryParams)}`;
      const cardFooter       = $('<div>').addClass('it-asset-card-footer w-100');
      const submitRequestBtn = $('<a>').attr('href', url)
                                       .text('Report Issue')
                                       .addClass('float-end footer-text');
      submitRequestBtn.append($('<span>').html('&#8594;').addClass('footer-arrow'));
      cardFooter.append(submitRequestBtn);

      cardBody.append(cardFooter);
      card.append(cardImageContainer, cardBody);

      card.click(function(e) {
        e.preventDefault();

        window.location.href = url;
      });

      return card;
    }

    buildDefaultServiceItem(serviceCategory, serviceCategoryItem) {
      const displayFields = serviceCategoryItem.display_fields;
      const card          = $('<div>').addClass('row service-item-card border border-light js-default-service-item')
                                      .data('id', `${serviceCategoryItem.id}${serviceCategory}`)
                                      .data('name', displayFields.title.value)
                                      .data('container-id', `${serviceCategory}_service_items_container`);

      // Create the card image element
      const cardImageContainer = $('<div>').addClass('col-4');
      const cardImageFlex      = $('<div>').addClass('d-flex flex-column h-100');
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
      const cardBody = $('<div>').addClass('col-8 card-body');

      // card title
      const itemName   = displayFields.title.value;
      const cardTitle  = $('<p>').text(itemName).addClass('card-title');
      cardBody.append(cardTitle);

      // card description
      const cardDescription = $('<p>').text(displayFields.short_description.value)
                                      .addClass('description');
      cardBody.append(cardDescription);

      //card footer (price and arrow)
      const cardFooter = $('<div>').addClass('card-footer w-100');
      const arrow      = $('<span>').html('&#8594;')
                                    .addClass('footer-arrow float-end js-service-item-detail-page-btn')
                                    .data('id', `${serviceCategoryItem.id}${serviceCategory}`)
                                    .data('name', displayFields.title.value)
                                    .data('container-id', `${serviceCategory}_service_items_container`);
      const arrowContainer = $('<a>').attr('href', '#_');
      arrowContainer.append(arrow);

      if (displayFields.cost_price) {
        const price = $('<span>').text(`${this.currency} ${parseFloat(displayFields.cost_price['value'])}`);
        cardFooter.append(price);
      }
      cardFooter.append(arrowContainer);
      cardBody.append(cardFooter);

      card.append(cardImageContainer, cardBody);

      return card;
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
          this.itemBuilder        = null;
          this.itemDetailBuilder  = null;
      }

      // Function to update search results
      updateResults = (data, options) => {
          const searchResultsContainer = options.searchResultsContainer;
          searchResultsContainer.empty();
          if (!data.search_results.length) {
              searchResultsContainer.append(noResultsFound());
              return;
          }

          self                    = this;
          self.itemBuilder        = options.itemBuilder;
          const searchItemsFlex   = $('<div>').addClass('d-flex flex-wrap gap-3');
          self.itemDetailBuilder  = options.itemDetailBuilder;       
          const searchResults     = Array.isArray(data.search_results) ? data.search_results : JSON.parse(data.search_results);

          $.each(searchResults, function(index, serviceItem) {
              if (serviceItem) {
                  let serviceCategory     = serviceItem.service_category_title_with_id;
                  let serviceCategoryItem = self.itemBuilder.buildServiceCategoryItem(serviceCategory, serviceItem);
                  self.itemDetailBuilder.bindItemDetailEventListener(serviceCategoryItem);
                  searchItemsFlex.append(serviceCategoryItem);
              }
          });
          searchResultsContainer.append(searchItemsFlex);
      }
  }

  class ApiService {
    constructor(ezoSubdomain) {
      this.ezoSubdomain = ezoSubdomain;
    }

    fetchServiceCategoriesAndItems(callback, noAccessPageCallback, options) {
      $.getJSON('/hc/api/v2/integration/token').then(data => data.token).then(token => {
          if (token) {
            const endPoint        = 'visible_service_categories_and_items';
            const queryParams     = {};
            const requestOptions  = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': true } };

            if(options.searchQuery) {
              queryParams.search_query = options.searchQuery; 
            }

            const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json' + '?' + $.param(queryParams);
            fetch(url, requestOptions)
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
                $('#loading_icon_container').empty();
                callback(data, options);
              })
              .catch(error => {
                console.error('An error occurred while fetching service categories and items: ' + error.message);
              });
          }
      });
    }

    fetchServiceCategoryItems(categoryId, callback, callBackOptions) {
      $.getJSON('/hc/api/v2/integration/token').then(data => data.token).then(token => {
        if (token) {
          const options       = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': true } };
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
    constructor(ezoSubdomain) {
      this.apiService                      = new ApiService(ezoSubdomain);
      this.ezoSubdomain                    = ezoSubdomain;
      this.serviceCatalogItemBuilder       = new ServiceCatalogItemBuilder();
      this.serviceCatalogItemDetailBuilder = new ServiceCatalogItemDetailBuilder();
      this.search                          = new Search();
    }

    addMenuItem(name, url, parentEle) {
      const parentElement = $(`#${parentEle}`);
      const serviceCatalogNavItem = $('<a>', {
                                      href: url,
                                      text: name
                                    }).addClass('service-catalog-nav-item nav-link');
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
      this.apiService.fetchServiceCategoriesAndItems(this.buildUI, this.noAccessPage, {});
    }

    buildServiceCatalogHeaderSection() {
      const headerSection     = $('<section>');
      const headerContainer   = $('<div>').addClass('jumbotron jumbotron-fluid service-catalog-header-container');
      const headerEle         = $('<h2>').addClass('service-catalog-header-label')
                                         .text('Service Catalog');
      const headerDescription = $('<p>').addClass('service-catalog-description')
                                        .text('Explore the Service Catalog to find a curated range of solutions to your needs');
      headerContainer.append(headerEle, headerDescription);
      headerSection.append(headerContainer);
      $('main').append(headerSection);
    }

    buildUI = (data, options) => {
      this.data = data;

      if (!serviceCatalogDataPresent(data)) { return; }

      const newSection = $('<section>').attr('id', 'service_catalog_section')
                                       .addClass('service-catalog-section');

      const serviceCatalogContainer   = $('<div>').addClass('row');
      const searchAndNavContainer     = $('<div>').addClass('col-2');
      const searchAndNavContainerText = $('<p>').text('Categories').addClass('service-categories-heading');

      const searchField = $('<input>').attr('id', 'search_input')
                                      .attr('type', 'text')
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
    }

    // Create a function to generate the vertical navbar
    generateNavbar() {
      const navbar                 = $('<ul>');
      let activeClassAdded         = false;
      const serviceCategoriesItems = this.data.service_catalog_data;

      $.each(serviceCategoriesItems, function(serviceCategory, serviceCategoryData) {
        let link     = '#_';
        let listItem = $('<li>').append($('<a>')
                                .attr({ 'id': serviceCategory + '_link' ,'href': link, 'target': '_blank' })
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
        self.apiService.fetchServiceCategoryItems(
          categoryId,
          self.serviceCatalogItemBuilder.buildAndRenderServiceItems,
          callbackOptions
        );
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
            },
            500
          );
        }
      });
    }

    noAccessPage() {
      const noAccessPageSection = $('<section>').attr('id', 'no_access_page_section')
                                                .addClass('no-access-page-section');

      const noAccessPageContainer = $('<div>').addClass('d-flex flex-column align-items-center');
      const noAccessImage         = $('<img>').attr('src', 'https://raw.githubusercontent.com/mehboobali98/service-catalog/code_restructure/assets/images/svg/no_access_image.svg')
                                              .addClass('no-access-image');

      const warningMessage        = $('<h4>').text('You do not have permission to access this page!');
      const nextStepsMessage      = $('<p>').text('Please contact your administrator to get access')
                                            .addClass('next-steps-message');

      // buttons
      const buttonsContainer      = $('<div>').addClass('d-flex mt-3 gap-3 justify-content-end');
      const goBackButton          = $('<a>').attr('href', '#_')
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
      this.ezoFieldId             = initializationData.ezoFieldId;
      this.ezoSubdomain           = initializationData.ezoSubdomain;
      this.ezoServiceItemFieldId  = initializationData.ezoServiceItemFieldId;

      const files = this.filesToLoad();
      loadExternalFiles(files, () => {
        this.initialize();
      });
    }

    initialize() {
      this.serviceCatalogBuilder = new ServiceCatalogBuilder(this.ezoSubdomain);
      this.addServiceCatalogMenuItem();
      this.initServiceCatalog();
    }

    addServiceCatalogMenuItem() {
      this.serviceCatalogBuilder.addMenuItem('Service Catalog', '/hc/p/service_catalog', 'user-nav');
    }

    initServiceCatalog() {
      if (isServiceCatalogPage()) {
        this.handleServiceCatalogRequest();
      } else if (isNewRequestPage()) {
        new NewRequestForm(this.ezoFieldId, this.ezoSubdomain, this.ezoServiceItemFieldId).updateRequestForm();
      } else if (isRequestPage()) {
        new RequestForm(this.ezoFieldId, this.ezoSubdomain).updateRequestForm();
      } else ;
    }

    handleServiceCatalogRequest() {
      if (isSignedIn()) {
        this.serviceCatalogBuilder.buildServiceCatalog();
      } else {
        // to-do: Verify this
        window.location.href = signInPath(); 
      }
    }

    filesToLoad() {
      return [
                { type: 'link',   url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css' },
                { type: 'link',   url: 'https://mehboobali98.github.io/service-catalog/code_restructure/assets/stylesheets/service_catalog.css' },
                { type: 'script', url: 'https://code.jquery.com/jquery-3.6.0.min.js' }
             ];
    }
  }

  exports.ServiceCatalogManager = ServiceCatalogManager;

}));
