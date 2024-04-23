import {
  DEFAULT_FIELD_VALUE,
  DEFAULT_TRUNCATE_LENGTH,
  CARD_TITLE_TRUNCATE_LENGTH
} from './constant.js';

import {
  loadingIcon,
  isMyAssignedAssets,
  placeholderImagePath,
  getMyAssignedAssetsServiceItems
} from './utility.js';

import {
  noServiceItems
} from './view_helper.js';

import {
  ServiceCatalogItemDetailBuilder
} from './service_catalog_item_detail_builder.js';

class ServiceCatalogItemBuilder {
  constructor(locale) {
    this.locale                 = locale;
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

    if (serviceCategoryItems.service_items) {
      let serviceItems = [];
      if (isMyAssignedAssets(serviceCategory)) {
        serviceItems         = getMyAssignedAssetsServiceItems(serviceCategoryItems);
        this.zendeskFormData = serviceCategoryItems.zendesk_form_data;
      } else {
        serviceItems = serviceCategoryItems.service_items ? JSON.parse(serviceCategoryItems.service_items) : [];
      }

      if (serviceItems.length) {
        serviceItems.forEach((serviceCategoryItem, index) => {
          if(serviceCategoryItem) { serviceCategoryItemsFlex.append(this.buildServiceCategoryItem(serviceCategory, serviceCategoryItem)) };
        });
      }
    } else {
      if (isMyAssignedAssets(serviceCategory)) {
        // render empty screen
        serviceCategoryItemsFlexContainer.append(noServiceItems('There are no assigned items for you in the system.'));
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
    const card        = $('<div>').addClass('row service-item-card');
    const queryParams = {};

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

    const fields = serviceCategoryItem.asset_columns || serviceCategoryItem.software_license_columns;
    debugger;

    this.populateCardContent(cardContent, serviceCategoryItem);
    debugger;

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
                                     .attr('data-i18n', 'report-issue')
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
    const cardImageFlex      = $('<div>').addClass('d-flex flex-column h-100 service-item-card-image-container');
    const placeholderPath    = placeholderImagePath(serviceCategoryItem);
    const cardImage          = $('<img>').attr('src', serviceCategoryItem.display_picture_url || placeholderPath)
                                         .attr('alt', 'Software')
                                         .addClass('w-100')
                                         .on('error', function() {
                                              // If the image fails to load, replace the source with a placeholder image
                                              $(this).attr('src', placeholderPath)
                                          });
    cardImageFlex.append(cardImage);
    cardImageContainer.append(cardImageFlex);

    // Create the card body
    const cardBody = $('<div>').addClass('col-8 card-body');

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

    if (displayFields.cost_price) {
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
    const fields      = serviceCategoryItem.asset_columns || serviceCategoryItem.software_license_columns;
    const columnNames = serviceCategoryItem.column_names;

    if (Object.keys(fields).length === 0 || columnNames.length === 0) {
      const noAttributesText = 'No attributes configured';
      cardContentElement.append($('<tr>').append(
        this.fieldValueElement(noAttributesText, 'th', noAttributesText.length).attr('data-i18n', 'no-attributes-configured')
      ))
      return;
    }

    if (this.locale == 'fr') {
      $.each(columnNames, (columnName) => {
        let columnValue = serviceCategoryItem[columnName];
        let newRow = $('<tr>');
        newRow.append(
          this.fieldValueElement(columnName || DEFAULT_FIELD_VALUE, 'th', DEFAULT_TRUNCATE_LENGTH).attr('data-i18n', columnName)
        );
        newRow.append(this.fieldValueElement(columnValue || DEFAULT_FIELD_VALUE, 'td', DEFAULT_TRUNCATE_LENGTH));
        cardContentElement.append(newRow);
      });
    } else { // 'en' is already translated from rails side.
      $.each(fields, (label, value) => {
        let newRow = $('<tr>');
        newRow.append(this.fieldValueElement(label || DEFAULT_FIELD_VALUE, 'th', DEFAULT_TRUNCATE_LENGTH));
        newRow.append(this.fieldValueElement(value || DEFAULT_FIELD_VALUE, 'td', DEFAULT_TRUNCATE_LENGTH));
        cardContentElement.append(newRow);
      });
    }
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
        if(serviceCategoryItem) { serviceCategoryItemsFlex.append(this.buildServiceCategoryItem(categoryName, serviceCategoryItem)) };
      });
    }
    if (!isMyAssignedAssets(categoryName)) { new ServiceCatalogItemDetailBuilder().build(data) };
  }
}

export {
  ServiceCatalogItemBuilder
};