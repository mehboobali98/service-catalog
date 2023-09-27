import { getZendeskTicketFormData } from './dummy_data.js';

function buildServiceCategoryItems(serviceCategory, serviceCategoryItems, isVisible) {
  const serviceCategoryItemsContainer = $('<div>');
  serviceCategoryItemsContainer.attr('id', serviceCategory + '_container');

  if (!isVisible) { serviceCategoryItemsContainer.addClass('collapse'); }

  const serviceCategoryLabel = $('<p>').text(serviceCategoryItems.label);
  const serviceCategoryDescription = $('<p>').text(serviceCategoryItems.description);

  serviceCategoryItemsContainer.append(serviceCategoryLabel, serviceCategoryDescription);

  const serviceCategoryItemsFlexContainer = $('<div>').attr('id', serviceCategory + '_service_items_container');
  const serviceCategoryItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

  $.each(serviceCategoryItems.serviceItems, function(index, serviceCategoryItem) {
    serviceCategoryItemsFlex.append(buildServiceCategoryItem(serviceCategory, serviceCategoryItem));
  });

  serviceCategoryItemsFlexContainer.append(serviceCategoryItemsFlex);
  serviceCategoryItemsContainer.append(serviceCategoryItemsFlexContainer);

  return serviceCategoryItemsContainer;
}

function buildServiceCategoryItem(serviceCategory, serviceCategoryItem) {
  debugger;
  const zendeskFormData = getZendeskTicketFormData(serviceCategory);
  switch (serviceCategory) {
    case 'my_it_assets':
      return buildItAssetServiceItem(serviceCategoryItem, zendeskFormData);
    case 'request_new_software':
    case 'request_laptops':
      return buildSoftwareRequestServiceItem(serviceCategoryItem, zendeskFormData, serviceCategory);
    default:
      // Handle unknown service type
      break;
  }
}

function buildItAssetServiceItem(serviceCategoryItem, zendeskFormData) {
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
                                   .addClass('card-footer');
  submitRequestBtn.append($('<span>').html('&#8594;').addClass('footer-arrow'));

  cardBody.append(submitRequestBtn);
  card.append(cardImageContainer, cardBody);

  return card;
}

function buildSoftwareRequestServiceItem(serviceCategoryItem, zendeskFormData, serviceCategory) {
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

export { buildServiceCategoryItems, buildServiceCategoryItem };