import { getZendeskTicketFormData } from './dummy_data.js';

function buildServiceItemsDetailPage(serviceCategoriesItems) {
  $.each(serviceCategoriesItems, function(serviceCategory, data) {
    let containerId = serviceCategory + '_container';
    let container   = $('#' + containerId);
    if (serviceCategory === 'my_it_assets') {
      // do-nothing
    } else {
      $.each(data.serviceItems, function(index, serviceCategoryItem) {
        let zendeskFormData = getZendeskTicketFormData(serviceCategory);
        container.after(buildDetailPage(serviceCategoryItem, zendeskFormData));
        bindEventListener(serviceCategoryItem);
      });
    }
  });
}

function buildDetailPage(serviceCategoryItem, zendeskFormData) {
  const queryParams         = zendeskFormData['queryParams'] || {};
  const detailPageContainer = $('<div>').attr('id', 'detail_page_container' + serviceCategoryItem.id + serviceCategoryItem.name)
                                        .addClass('row')
                                        .css({ 'display': 'none', 'margin-top': '38px', 'margin-right': '184px' });

  const imageContainer = $('<div>').addClass('col-3');
  const image = $('<img>').attr('src', serviceCategoryItem.img_src)
                          .attr('alt', 'Software')
                          .addClass('w-100');
  imageContainer.append(image);

  const detailPageContent = $('<div>').addClass('col-9');

  const detailPageHeader  = $('<div>').addClass('d-flex justify-content-between');
  const headerContent = $('<div>').append($('<p>').text(serviceCategoryItem.name))
                                  .append($('<p>').text(serviceCategoryItem.price));

  queryParams['name'] = serviceCategoryItem.name;
  const url = '/hc/requests/new' + '?' + $.param(queryParams);
  const requestServiceBtn = $('<a>').attr('role', 'button')
                                    .attr('href', url)
                                    .text('Request Service')
                                    .addClass('btn request-service-btn');
  detailPageHeader.append(headerContent, requestServiceBtn);

  const detailPageBody = $('<div>');
  const detailPageFields = serviceCategoryItem.detail_page_fields;
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
  detailPageContainer.append(imageContainer, detailPageContent);

  return detailPageContainer;
}

function bindEventListener(serviceCategoryItem) {
  $('body').on('click', '.js-service-item-detail-page-btn', function(e) {
    e.preventDefault();

    const id           = $(this).data('id');
    const name         = $(this).data('name');
    const containerId  = $(this).data('container-id');
    const containerEle = $('#' + containerId);
    const detailPageContainerId = 'detail_page_container' + id + name;
    // to-do: unable to find elemeny by id using jquery but its found using javascript??
    const detailPageEle = $(document.getElementById(detailPageContainerId));
    containerEle.hide();
    detailPageEle.show();
  });
}

export { buildServiceItemsDetailPage };