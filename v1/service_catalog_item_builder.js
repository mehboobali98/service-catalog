class ServiceCatalogItemBuilder {
  constructor(serviceCategoriesItems, zendeskFormData) {
    this.userExists             = false;
    this.zendeskFormData        = zendeskFormData;
    this.serviceCategoriesItems = serviceCategoriesItems;
  }

  build(userExists) {
    this.userExists = userExists;
    const serviceCategories = Object.keys(this.serviceCategoriesItems);
    const serviceItemsContainer = $('<div>').attr('id', 'service_items_container')
                                            .addClass('col-10 service-items-container');
    const defaultVisibleCategoryIndex = this.getDefaultVisibleCategoryIndex();

    // to-do: handle if no service categories present.
    serviceCategories.forEach((serviceCategory, index) => {
      const serviceCategoryItems = this.serviceCategoriesItems[serviceCategory];
      const isVisible = index === defaultVisibleCategoryIndex;
      serviceItemsContainer.append(this.buildServiceCategoryItems(serviceCategory, serviceCategoryItems, isVisible));
    });

    return serviceItemsContainer;
  }

  getDefaultVisibleCategoryIndex() {
    if (this.userExists) {
      return 0;
    } else if (window.HelpCenter.user.role === 'anonymous') {
      return 2;
    } else {
      return 1;
    }
  }

  buildServiceCategoryItems(serviceCategory, serviceCategoryItems, isVisible) {
    const serviceCategoryItemsContainer = $('<div>');
    serviceCategoryItemsContainer.attr('id', serviceCategory + '_container');

    if (!isVisible) { serviceCategoryItemsContainer.addClass('collapse'); }

    const serviceCategoryLabel = $('<p>').text(serviceCategoryItems.label);
    const serviceCategoryDescription = $('<p>').text(serviceCategoryItems.description);

    serviceCategoryItemsContainer.append(serviceCategoryLabel, serviceCategoryDescription);

    const serviceCategoryItemsFlexContainer = $('<div>').attr('id', serviceCategory + '_service_items_container');
    const serviceCategoryItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

    if (serviceCategoryItems.serviceItems) {
      serviceCategoryItems.serviceItems.forEach((serviceCategoryItem, index) => {
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
    debugger;
    if (serviceCategoryData.serviceItems) {
      serviceCategoryData.serviceItems.forEach((serviceCategoryItem, index) => {
        myItAssetsFlex.append(this.buildServiceCategoryItem('my_it_assets', serviceCategoryItem));
      });
    }
    $('#service_items_container').children(':visible').hide():
    debugger;
    $('#my_it_assets_link').parent().show();
    myItAssetsContainer.show();
  }

  buildServiceCategoryItem(serviceCategory, serviceCategoryItem) {
    const zendeskFormData = this.zendeskFormData[serviceCategory];
    switch (serviceCategory) {
      case 'my_it_assets':
        return this.buildItAssetServiceItem(serviceCategoryItem, zendeskFormData);
      case 'request_new_software':
      case 'request_laptops':
        return this.buildSoftwareRequestServiceItem(serviceCategoryItem, zendeskFormData, serviceCategory);
      default:
        // Handle unknown service type
        break;
    }
  }

  buildItAssetServiceItem(serviceCategoryItem, zendeskFormData) {
    const queryParams = zendeskFormData[serviceCategoryItem.type]['queryParams'] || {};
    const card = $('<div>').addClass('row service-item-card border border-light');

    // Card image
    const cardImageContainer = $('<div>').addClass('col-4');
    const cardImage = $('<img>').attr('src', serviceCategoryItem.img_src)
                                .attr('alt', 'IT Asset')
                                .addClass('w-100');
    cardImageContainer.append(cardImage);

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

    queryParams['asset_id']   = serviceCategoryItem.id;
    queryParams['asset_name'] = assetName;

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

  buildSoftwareRequestServiceItem(serviceCategoryItem, zendeskFormData, serviceCategory) {
    const queryParams = zendeskFormData['queryParams'];
    const card = $('<div>').addClass('row service-item-card border border-light');

    // Create the card image element
    const cardImageContainer = $('<div>').addClass('col-4');
    const cardImage = $('<img>').attr('src', serviceCategoryItem.img_src)
                                .attr('alt', 'Software')
                                .addClass('w-100');
    cardImageContainer.append(cardImage);

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

    if (serviceCategoryItem.price) {
      cardFooter.append(price);
    }
    cardFooter.append(arrow);
    cardBody.append(cardFooter);

    card.append(cardImageContainer, cardBody);

    return card;
  }
}

export { ServiceCatalogItemBuilder };