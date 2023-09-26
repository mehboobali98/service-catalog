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
  const arrow = $('<span>').attr('id', 'service_item_detail_page_btn')
                           .html('&#8594;')
                           .addClass('footer-arrow float-end')
                           .data('id', serviceCategoryItem.id)
                           .data('name', serviceCategoryItem.name);

  if (serviceCategoryItem.price) {
    cardFooter.append(price);
  }
  cardFooter.append(arrow);
  cardBody.append(cardFooter);

  card.append(cardImageContainer, cardBody);
  debugger;
  buildDetailPage(serviceCategoryItem, serviceCategory + '_service_items_container');
  bindEventListener(serviceCategory + '_service_items_container');

  return card;
}

function buildDetailPage(serviceCategoryItem, categoryContainerId) {
  const detailPageContainer = $('div').attr('id', 'detail_page_container_' + serviceCategoryItem.id + '_' + serviceCategoryItem.name)
                                      .addClass('row collapse');

  const imageContainer = $('<div>').addClass('col-3');
  const image = $('<img>').attr('src', serviceCategoryItem.img_src)
                          .attr('alt', 'Software');
  debugger;
  imageContainer.append(image);

  const detailPageContent = $('<div>').addClass('col-9');

  const detailPageHeader  = $('<div>').addClass('d-flex justify-content-between');
  const headerContent = $('<div>').append($('<p>').text(serviceCategoryItem.name))
                                  .append($('<p>').text(serviceCategoryItem.price));
  // to-do: (add request service button)
  detailPageHeader.append(headerContent);

  const detailPageBody = $('<div>');
  const detailPageFields = serviceCategoryItem.detail_page_fields;
  debugger;
  if (detailPageFields) {
    $.each(detailPageFields, function(index, fieldData) {
      let section         = $('<section>');
      let sectionHeader   = $('<h4>').text(fieldData['label']);
      let sectionContent  = $('<p>').text(fieldData['value']);
      section.append(sectionHeader, sectionContent);
      detailPageBody.append(section);
    });
  }

  detailPageContent.append(detailPageHeader, detailPageBody);

  debugger;
  detailPageContainer.append(imageContainer, detailPageContent);
  debugger;
  $('#' + categoryContainerId).after(detailPageContainer);
}

function bindEventListener(containerId) {
  $('#service_item_detail_page_btn').on('click', function(e) {
    e.preventDefault();

    const id   = $(this).data('id');
    const name = $(this).data('name');
    const containerEle = $('#' + containerId);
    const detailPageContainerId = 'detail_page_container_' + id + name;
    debugger;
    containerEle.hide();
    $('#' + detailPageContainerId).show();
  });
}

export { buildServiceCategoryItem, buildItAssetServiceItem };