import { getZendeskTicketFormData } from './dummy_data.js';

function buildServiceCategoryItem(serviceCategory, serviceCategoryItem) {
  const serviceItemType = serviceCategoryItem.type;
  const zendeskFormData = getZendeskTicketFormData(serviceCategory);
  switch (serviceItemType) {
    case 'assigned_it_asset':
    case 'assigned_software_entitlement':
      return buildItAssetServiceItem(serviceCategoryItem, zendeskFormData);
    case 'software_request':
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
                              .attr('alt', 'IT Asset');
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
                              .attr('alt', 'Software');
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
  const cardFooter = $('<div>').addClass('card-footer');
  const price = $('<span>').text(serviceCategoryItem.price);
  const arrow = $('<span>').attr('id', 'service_item_detail_page_btn' + serviceCategoryItem.id + serviceCategoryItem.name.toLowerCase())
                           .html('&#8594;')
                           .addClass('footer-arrow float-end')
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

export { buildServiceCategoryItem, buildItAssetServiceItem };