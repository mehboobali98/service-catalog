import { isMyAssignedAssets }                     from './utility.js';
import { SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING } from './constant.js';

class ServiceCatalogItemBuilder {
  constructor() {
    this.serviceCategoriesItems = null;
  }

  build(serviceCategoriesItems) {
    this.serviceCategoriesItems = serviceCategoriesItems
    const serviceCategories     = Object.keys(this.serviceCategoriesItems);
    const serviceItemsContainer = $('<div>').attr('id', 'service_items_container')
                                            .addClass('col-10 service-items-container');

    // to-do: handle if no service categories present.
    serviceCategories.forEach((serviceCategory, index) => {
      const serviceCategoryItems = this.serviceCategoriesItems[serviceCategory];
      serviceItemsContainer.append(this.buildServiceCategoryItems(serviceCategory, serviceCategoryItems, 0 === index));
    });

    return serviceItemsContainer;
  }

  buildServiceCategoryItems(serviceCategory, serviceCategoryItems, isVisible) {
    const serviceCategoryItemsContainer = $('<div>');
    serviceCategoryItemsContainer.attr('id', serviceCategory + '_container');

    if (!isVisible) { serviceCategoryItemsContainer.addClass('collapse'); }

    const serviceCategoryLabel = $('<p>').text(serviceCategoryItems.title).addClass('service-category-label');
    const serviceCategoryDescription = $('<p>').text(serviceCategoryItems.description).addClass('service-category-description');

    serviceCategoryItemsContainer.append(serviceCategoryLabel, serviceCategoryDescription);

    const serviceCategoryItemsFlexContainer = $('<div>').attr('id', serviceCategory + '_service_items_container');
    const serviceCategoryItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

    let serviceItems = null;
    if (isMyAssignedAssets(serviceCategory)) {
      serviceItems         = serviceCategoryItems.service_items['assets'].concat(serviceCategoryItems.service_items['software_entitlements']);
      this.zendeskFormData = serviceCategoryItems.zendesk_form_data;
    } else {
      serviceItems = serviceCategoryItems.service_items ? JSON.parse(serviceCategoryItems.service_items) : [];
    }

    if (serviceItems.length) {
      serviceItems.forEach((serviceCategoryItem, index) => {
        if(serviceCategoryItem) { serviceCategoryItemsFlex.append(this.buildServiceCategoryItem(serviceCategory, serviceCategoryItem)) };
      });
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

  buildItAssetServiceItem(serviceCategory, serviceCategoryItem) {
    const card        = $('<div>').addClass('row service-item-card');
    const queryParams = {};

    // Card image
    const cardImageContainer    = $('<div>').addClass('col-4');
    const cardImageFlex         = $('<div>').addClass('d-flex flex-column justify-content-center h-100');
    const placeholderPath       = this.placeholderImagePath(serviceCategoryItem);
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
    const cardTitle = $('<p>').text(assetName).addClass('card-title');
    cardBody.append(cardTitle);

    // Card content
    const cardContentContainer = $('<div>').addClass('card-content-container');
    const cardContent          = $('<table>').addClass('card-content-table');
    const displayFields        = this.prepareAssignedAssetDisplayFields(serviceCategoryItem);

    const fields = serviceCategoryItem.asset_columns || serviceCategoryItem.software_license_columns;
    $.each(fields, function(label, value) {
      let newRow = $("<tr>");
      newRow.append($('<th>').text(label));
      newRow.append($('<td>').text(value));
      cardContent.append(newRow);
    });
    cardContentContainer.append(cardContent);
    cardBody.append(cardContentContainer);

    queryParams['item_id']          = serviceCategoryItem.sequence_num;
    queryParams['item_name']        = assetName;
    queryParams['ticket_form_id']   = this.zendeskFormId(serviceCategoryItem);
    queryParams['service_category'] = this.serviceCategoriesItems[serviceCategory].title;

    // Card footer
    const url = '/hc/requests/new' + '?' + $.param(queryParams);
    const submitRequestBtn = $('<a>').attr('href', url)
                                     .text('Report Issue')
                                     .addClass('it-asset-card-footer');
    submitRequestBtn.append($('<span>').html('&#8594;').addClass('footer-arrow'));

    cardBody.append(submitRequestBtn);
    card.append(cardImageContainer, cardBody);

    return card;
  }

  buildDefaultServiceItem(serviceCategory, serviceCategoryItem) {
    const card          = $('<div>').addClass('row service-item-card border border-light');
    const displayFields = serviceCategoryItem.display_fields;

    // Create the card image element
    const cardImageContainer = $('<div>').addClass('col-4');
    const cardImageFlex      = $('<div>').addClass('d-flex flex-column justify-content-center h-100');
    const placeholderPath    = this.placeholderImagePath(serviceCategoryItem);
    const cardImage          = $('<img>').attr('src', serviceCategoryItem.display_picture_url)
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
    const itemName   = displayFields.title['value'];
    const cardTitle  = $('<p>').text(itemName).addClass('card-title');
    cardBody.append(cardTitle);

    // card description
    const cardDescription = $('<p>').text(displayFields.short_description['value'])
                                    .addClass('description');
    cardBody.append(cardDescription);

    //card footer (price and arrow)
    const cardFooter = $('<div>').addClass('card-footer w-100');
    const arrow      = $('<span>').html('&#8594;')
                                  .addClass('footer-arrow float-end js-service-item-detail-page-btn')
                                  .data('id', serviceCategoryItem.id)
                                  .data('name', displayFields.title['value'])
                                  .data('container-id', serviceCategory + '_service_items_container');
    const arrowContainer = $('<a>').attr('href', '#_');
    arrowContainer.append(arrow);

    if (displayFields.cost_price) {
      const price = $('<span>').text(displayFields.cost_price['value']);
      cardFooter.append(price);
    }
    cardFooter.append(arrowContainer);
    cardBody.append(cardFooter);

    card.append(cardImageContainer, cardBody);

    return card;
  }

  prepareAssignedAssetDisplayFields(serviceItem) {
    const type          = serviceItem.type;
    const displayFields = [];
    if (type === 'assigned_it_asset') {
      displayFields.push({
        label: 'Serial #', value: serviceItem.serial_num
      });
    } else if (type === 'assigned_software_entitlement') {
      displayFields.push({
        label: 'Seats Given', value: serviceItem.seats_given
      })
    }
    displayFields.push({ label: 'Assigned On', value: serviceItem.assigned_on });
    return displayFields;
  }

  zendeskFormId(serviceItem) {
    const type = serviceItem.type;
    if (type === 'assigned_asset') {
      return this.zendeskFormData.assets;
    } else if (type === 'assigned_software_license') {
      return this.zendeskFormData.software_entitlements;
    }
  }

  buildAndRenderServiceItems = (serviceCategory, serviceItems, serviceItemsContainer) => {
    // first child is the flexbox which contains service items
    const serviceCategoryItemsFlex = $(serviceItemsContainer).children().first();
    serviceCategoryItemsFlex.empty();
    let serviceCategoryItems = null;
    if (isMyAssignedAssets(serviceCategory)) {
      serviceCategoryItems = serviceItems['assets'].concat(serviceItems['software_entitlements']);
    } else {
      serviceCategoryItems = serviceItems ? JSON.parse(serviceItems) : [];
    }

    if (serviceCategoryItems.length) {
      serviceCategoryItems.forEach((serviceCategoryItem, index) => {
        if(serviceCategoryItem) { serviceCategoryItemsFlex.append(this.buildServiceCategoryItem(serviceCategory, serviceCategoryItem)) };
      });
    }
  }

  placeholderImagePath(serviceItem) {
    let type      = serviceItem.type;
    let imageName = null;
    if (type) {
      imageName = SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING[type];
    } else {
      imageName = SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING['service_item'];
    }
    debugger;
    return `https://raw.githubusercontent.com/mehboobali98/service-catalog/connect_service_catalog_with_api/v1/assets/svgs/${imageName}.svg`
  }
}

export { ServiceCatalogItemBuilder };