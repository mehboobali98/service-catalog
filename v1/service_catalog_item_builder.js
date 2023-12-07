import { isMyAssignedAssets } from './utility.js';

class ServiceCatalogItemBuilder {
  constructor() {
    this.serviceCategoriesItems = null;
  }

  build(serviceCategoriesItems) {
    debugger;
    this.serviceCategoriesItems = serviceCategoriesItems
    const serviceCategories     = Object.keys(this.serviceCategoriesItems);
    const serviceItemsContainer = $('<div>').attr('id', 'service_items_container')
                                            .addClass('col-10 service-items-container');

    debugger;
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

    debugger;
    const serviceItems = null;
    if (isMyAssignedAssets(serviceCategory)) {
      serviceItems = serviceCategoryItems.service_items['assets'].concat(serviceCategoryItems.service_items['software_entitlements']);
    } else {
      serviceItems = serviceCategoryItems.service_items;
    }

    if (serviceItems) {
      serviceItems.forEach((serviceCategoryItem, index) => {
        serviceCategoryItemsFlex.append(this.buildServiceCategoryItem(serviceCategory, serviceCategoryItem));
      });
    }

    serviceCategoryItemsFlexContainer.append(serviceCategoryItemsFlex);
    serviceCategoryItemsContainer.append(serviceCategoryItemsFlexContainer);

    return serviceCategoryItemsContainer;
  }

  renderMyItAssets(serviceCategoryData) {
    const myItAssetsContainer     = $('#my_it_assets_container');
    const myItAssetsFlexContainer = $('#my_it_assets_service_items_container');
    const myItAssetsFlex          = myItAssetsFlexContainer.children(':first');
    if (serviceCategoryData.serviceItems) {
      serviceCategoryData.serviceItems.forEach((serviceCategoryItem, index) => {
        myItAssetsFlex.append(this.buildServiceCategoryItem('my_it_assets', serviceCategoryItem));
      });
    }
  }

  buildServiceCategoryItem(serviceCategory, serviceCategoryItem) {
    debugger;
    const zendeskFormData = {};
    if (isMyAssignedAssets(serviceCategory)) {
      return this.buildItAssetServiceItem(serviceCategoryItem, zendeskFormData);
    } else {
      return this.buildSoftwareRequestServiceItem(serviceCategoryItem, zendeskFormData, serviceCategory);
    }
  }

  buildItAssetServiceItem(serviceCategoryItem, zendeskFormData) {
    //const queryParams = zendeskFormData[serviceCategoryItem.type]['queryParams'] || {};
    const card = $('<div>').addClass('row service-item-card');

    // Card image
    const cardImageContainer = $('<div>').addClass('col-4');
    const cardImageFlex      = $('<div>').addClass('d-flex flex-column justify-content-center h-100');
    const cardImage          = $('<img>').attr('src', serviceCategoryItem.img_src)
                                         .attr('alt', 'IT Asset')
                                         .addClass('w-100');
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
    const cardContent = $('<table>').addClass('card-content-table');
    $.each(serviceCategoryItem.display_fields, function(index, rowData) {
      let newRow = $("<tr>");
      newRow.append($('<th>').text(rowData.label));
      newRow.append($('<td>').text(rowData.value));
      cardContent.append(newRow);
    });
    cardContentContainer.append(cardContent);
    cardBody.append(cardContentContainer);

    //queryParams['asset_id']   = serviceCategoryItem.id;
    //queryParams['asset_name'] = assetName;

    // Card footer
    // const url = '/hc/requests/new' + '?' + $.param(queryParams);
    const url = '/hc/requests/new';
    const submitRequestBtn = $('<a>').attr('href', url)
                                     .text('Report Issue')
                                     .addClass('it-asset-card-footer');
    submitRequestBtn.append($('<span>').html('&#8594;').addClass('footer-arrow'));

    cardBody.append(submitRequestBtn);
    card.append(cardImageContainer, cardBody);

    return card;
  }

  buildSoftwareRequestServiceItem(serviceCategoryItem, zendeskFormData, serviceCategory) {
    //const queryParams = zendeskFormData['queryParams'];
    const card = $('<div>').addClass('row service-item-card border border-light');

    // Create the card image element
    const cardImageContainer = $('<div>').addClass('col-4');
    const cardImageFlex = $('<div>').addClass('d-flex flex-column justify-content-center h-100');
    const cardImage = $('<img>').attr('src', serviceCategoryItem.img_src)
                                .attr('alt', 'Software')
                                .addClass('w-100');
    cardImageFlex.append(cardImage);
    cardImageContainer.append(cardImageFlex);

    // Create the card body
    const cardBody = $('<div>').addClass('col-8 card-body');

    // card title
    const softwareName = serviceCategoryItem.name;
    const cardTitle  = $('<p>').text(softwareName).addClass('card-title');
    cardBody.append(cardTitle);

    // card description
    const cardDescription = $('<p>').text(serviceCategoryItem.description)
                                    .addClass('description');
    cardBody.append(cardDescription);

    //card footer (price and arrow)
    const cardFooter = $('<div>').addClass('card-footer w-100');
    const price = $('<span>').text(serviceCategoryItem.price);
    const arrow = $('<span>').html('&#8594;')
                             .addClass('footer-arrow float-end js-service-item-detail-page-btn')
                             .data('id', serviceCategoryItem.id)
                             .data('name', serviceCategoryItem.name)
                             .data('container-id', serviceCategory + '_service_items_container');
    const arrowContainer = $('<a>').attr('href', '#_');
    arrowContainer.append(arrow);

    if (serviceCategoryItem.price) {
      cardFooter.append(price);
    }
    cardFooter.append(arrowContainer);
    cardBody.append(cardFooter);

    card.append(cardImageContainer, cardBody);

    return card;
  }
}

export { ServiceCatalogItemBuilder };