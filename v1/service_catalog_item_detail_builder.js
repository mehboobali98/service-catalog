import { isMyAssignedAssets } from './utility.js';

class ServiceCatalogItemDetailBuilder {
  constructor() {
    this.serviceCategoriesItems = null;
  }

  build(serviceCategoriesItems) {
    this.serviceCategoriesItems = serviceCategoriesItems;
    debugger;
    $.each(this.serviceCategoriesItems, (serviceCategory, data) => {
      let containerId = serviceCategory + '_container';
      let container   = $('#' + containerId);
      debugger;
      if (!isMyAssignedAssets(serviceCategory)) {
        debugger;
        let serviceItems = JSON.parse(data.service_items);
        $.each(serviceItems, (index, serviceCategoryItem) => {
          container.after(this.buildDetailPage(serviceCategoryItem));
          this.bindItemDetailEventListener(serviceCategoryItem);
        });
      }
    });
  }

  buildDetailPage(serviceCategoryItem) {
    const queryParams         = {};
    const displayFields       = serviceCategoryItem.display_fields;
    const detailPageContainer = $('<div>').attr('id', 'detail_page_container' + serviceCategoryItem.id + display_fields.title)
                                          .addClass('row')
                                          .css({ 'display': 'none', 'margin-top': '38px', 'margin-right': '184px' });

    const imageContainer = $('<div>').addClass('col-3');
    const image = $('<img>').attr('src', serviceCategoryItem.img_src)
                            .attr('alt', 'Software')
                            .addClass('w-100');
    imageContainer.append(image);

    const detailPageContent = $('<div>').addClass('col-9');

    const detailPageHeader  = $('<div>').addClass('d-flex justify-content-between');
    const headerContent = $('<div>').append($('<p>').text(display_fields.title)
                                                    .css({ 'color': 'black', 'font-size': '22px', 'font-weight': '700', 'line-height': '17px' }))
                                    .append($('<p>').text(display_fields.cost_price)
                                                    .css({ 'color': 'black', 'font-size': '14px', 'font-weight': '400', 'line-height': '17px' }));

    queryParams['item_name']      = display_fields.title;
    queryParams['ticket_form_id'] = serviceCategoryItem.zendesk_form_id;
    const url = '/hc/requests/new' + '?' + $.param(queryParams);

    const requestServiceBtn = $('<a>').attr('role', 'button')
                                      .attr('href', url)
                                      .text('Request Service')
                                      .addClass('btn request-service-btn');
    detailPageHeader.append(headerContent, requestServiceBtn);

    const detailPageBody = $('<div>');
    debugger;
    if (false) {
      $.each(displayFields, (index, fieldData) => {
        let section         = $('<section>');
        let sectionHeader   = $('<p>').text(fieldData['label']).css({ 'color': 'black', 'font-size': '16px', 'font-weight': '700', 'line-height': '17px' });
        let sectionContent  = this.prepareSectionContent(fieldData);
        section.append(sectionHeader, sectionContent);
        detailPageBody.append(section);
      });
    }

    detailPageContent.append(detailPageHeader, detailPageBody);
    detailPageContainer.append(imageContainer, detailPageContent);

    return detailPageContainer;
  }

  prepareSectionContent(fieldData) {
    const fieldValue  = fieldData['value'];
    const fieldFormat = fieldData['format'];

    if (!fieldFormat) { return $('<p>').text(fieldValue).css({ 'color': 'black', 'font-size': '14px', 'font-weight': '400', 'line-height': '17px' }); }

    if (fieldFormat === 'list') {
      const listEle     = $('<ul>').addClass('service-item-detail-description-list');
      const listValues  = fieldValue.split(',');

      $.each(listValues, function(index, value) {
        let listItem = $("<li>").text(value);
        listEle.append(listItem);
      });

      return listEle;
    }
  }

  bindItemDetailEventListener(serviceCategoryItem) {
    $('body').on('click', '.js-service-item-detail-page-btn', function(e) {
      e.preventDefault();

      const id           = $(this).data('id');
      const name         = $(this).data('name');
      const containerId  = $(this).data('container-id');
      const containerEle = $('#' + containerId);
      const detailPageContainerId = 'detail_page_container' + id + name;
      // to-do: unable to find elemeny by id using jquery but its found using javascript??
      const detailPageEle = $(document.getElementById(detailPageContainerId));
      $('#service_catalog_item_search_results_container').hide();
      containerEle.hide();
      $("[id*='_service_items_container']").hide();
      $('#service_items_container').show();
      detailPageEle.show();
    });
  }
}

export { ServiceCatalogItemDetailBuilder };