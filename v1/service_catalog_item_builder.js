function buildServiceCategoryItem(serviceCategoryItem, queryParams) {
  const serviceItemType = serviceCategoryItem.type;
  switch (serviceItemType) {
    case 'assigned_it_asset':
      return buildItAssetServiceItem(serviceCategoryItem, queryParams);
    case 'assigned_software_entitlement':
      return buildSoftwareServiceItem(serviceCategoryItem);
    case 'software_request':
      return buildSoftwareRequestServiceItem(serviceCategoryItem, queryParams);
    default:
      // Handle unknown service type
      break;
  }
}

function buildItAssetServiceItem(serviceCategoryItem, queryParams) {
  const card = $('<div>').addClass('row service-item-card border border-light');

  // Create the card image element
  const cardImageContainer = $('<div>').addClass('col-4');
  const cardImage = $('<img>').attr('src', serviceCategoryItem.img_src)
                              .attr('alt', 'IT Asset');
  cardImageContainer.append(cardImage);

  // Create the card body
  const cardBody = $('<div>').addClass('col-8 card-body');

  // Create the card title
  const assetName = serviceCategoryItem.name;
  const cardTitle = $('<p>').text(assetName);
  cardBody.append(cardTitle);

  $.each(serviceCategoryItem.display_fields, function(index, field) {
    var cardField = $('<p>').append($('<span>').text(field.label + ':       ' + field.value));
    cardBody.append(cardField);
  });

  queryParams['asset_id']   = serviceCategoryItem.id;
  queryParams['asset_name'] = assetName;

  var url = '/hc/requests/new' + '?' + $.param(queryParams);
  const submitRequestBtn = $('<a>').attr('href', url)
                                   .text('Report Issue')
                                   .addClass('float-end card-footer');
  cardBody.append(submitRequestBtn);

  card.append(cardImageContainer, cardBody);

  return card;
}

function buildSoftwareServiceItem(serviceCategoryItem) {
  return '';
}

function buildSoftwareRequestServiceItem(serviceCategoryItem, queryParams) {
  const card = $('<div>').addClass('row service-item-card border border-light');

  // Create the card image element
  const cardImageContainer = $('<div>').addClass('col-4');
  const cardImage = $('<img>').attr('src', serviceCategoryItem.img_src)
                              .attr('alt', 'Software');
  cardImageContainer.append(cardImage);

  // Create the card body
  const cardBody = $('<div>').addClass('col-8 card-body');

  // card title
  let softwareName = serviceCategoryItem.name;
  const cardTitle  = $('<p>').text(softwareName);
  cardBody.append(cardTitle);


  // card description
  const cardDescription = $('<p>').text(serviceCategoryItem.description)
                                  .addClass('description');
  cardBody.append(cardDescription);

  //card footer (price and arrow)
  const arrow = $('<i>').addClass('bi bi-arrow-right');
  const cardFooter = $('<div>').addClass('card-footer');
  if (serviceCategoryItem.price) {
    cardFooter.addClass('d-flex');
    const price = $('<span>').text(serviceCategoryItem.price);
    cardFooter.append(price);
  } else {
    arrow.addClass('float-end');
  }
  cardFooter.append(arrow);
  card.append(cardImageContainer, cardBody, cardFooter);

  return card;
}

export { buildServiceCategoryItem, buildItAssetServiceItem };