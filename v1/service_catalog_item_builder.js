function buildServiceCategoryItem(serviceCategoryItem) {
  const serviceItemType = serviceCategoryItem.type;
  switch (serviceItemType) {
    case 'assigned_it_asset':
      buildItAssetServiceItem(serviceCategoryItem);
      break;
    case 'assigned_software_entitlement':
      buildSoftwareServiceItem(serviceCategoryItem);
      break;
    case 'software_request':
      buildSoftwareRequestServiceItem(serviceCategoryItem);
      break;
    default:
      // Handle unknown service type
      break;
  }
}

function buildItAssetServiceItem(serviceCategoryItem) {
  const card = $('<div>').addClass('row service-item-card');

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
    const cardField = $('<p>').append($('<span>').text(field.label + ':' + field.value));
    cardBody.append(cardField);
  });

  // submit request button
  const submitRequestBtn = $('<a>').attr('href', '#').text('Report Issue');
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