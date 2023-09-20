function buildServiceCategoryItem(serviceCategoryItem) {
  const serviceItemType = serviceCategoryItem.type;
  switch (serviceItemType) {
    case 'assigned_it_asset':
      return buildItAssetServiceItem(serviceCategoryItem);
    case 'assigned_software_entitlement':
      return buildSoftwareServiceItem(serviceCategoryItem);
    case 'software_request':
      return buildSoftwareRequestServiceItem(serviceCategoryItem);
    default:
      // Handle unknown service type
      break;
  }
}

function buildItAssetServiceItem(serviceCategoryItem) {
  const card = $('<div>').addClass('row service-item-card mr-5');

  // Create the card image element
  const cardImageContainer = $('<div>').addClass('col-4');
  const cardImage = $('<img>').attr('src', serviceCategoryItem.img_src)
                              .attr('alt', 'IT Asset');
  cardImageContainer.append(cardImage);

  // Create the card body
  const cardBody = $('<div>').addClass('col-8');

  // Create the card title
  const cardTitle = $('<h4>').text(serviceCategoryItem.name);
  cardBody.append(cardTitle);

  $.each(serviceCategoryItem.display_fields, function(index, field) {
    var cardField = $('<p>').append($('<span>').text(field.label + ':       ' + field.value));
    cardBody.append(cardField);
  });

  // submit request button
  const submitRequestBtn = $('<a>').attr('href', '/hc/requests/new')
                                   .text('Report Issue')
                                   .addClass('float-end');
  cardBody.append(submitRequestBtn);

  card.append(cardImageContainer, cardBody);

  return card;
}

function buildSoftwareServiceItem(serviceCategoryItem) {
  return '';
}

function buildSoftwareRequestServiceItem(serviceCategoryItem) {
  return '';
}

export { buildServiceCategoryItem, buildItAssetServiceItem };