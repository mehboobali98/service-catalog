import { isMyAssignedAssets, placeholderImagePath } from './utility.js';

class ServiceCatalogItemDetailBuilder {
  constructor() {
    this.serviceCategoriesItems = null;
  }

  build(serviceCategoriesItems) {
    this.serviceCategoriesItems = serviceCategoriesItems;
    $.each(this.serviceCategoriesItems, (serviceCategory, data) => {
      let containerId = serviceCategory + '_container';
      let container   = $('#' + containerId);
      if (!isMyAssignedAssets(serviceCategory) && data.service_items) {
        let serviceItems = JSON.parse(data.service_items);
        $.each(serviceItems, (index, serviceCategoryItem) => {
          container.after(this.buildDetailPage(serviceCategory, serviceCategoryItem));
          this.bindItemDetailEventListener(serviceCategoryItem);
        });
      }
    });
  }

  buildDetailPage(serviceCategory, serviceCategoryItem) {
    const queryParams         = {};
    const displayFields       = serviceCategoryItem.display_fields;
    const detailPageContainer = $('<div>').attr('id', 'detail_page_container' + serviceCategoryItem.id + displayFields.title.value)
                                          .addClass('row')
                                          .css({ 'display': 'none', 'margin-top': '38px', 'margin-right': '184px' });

    const imageContainer  = $('<div>').addClass('col-3');
    const placeholderPath = placeholderImagePath(serviceCategoryItem);
    const image = $('<img>').attr('src', serviceCategoryItem.display_picture_url)
                            .attr('alt', 'placeholder image')
                            .addClass('w-100')
                            .on('error', function() {
                              // If the image fails to load, replace the source with a placeholder image
                              $(this).attr('src', placeholderPath)
                            });
    imageContainer.append(image);

    const detailPageContent = $('<div>').addClass('col-9');

    const detailPageHeader  = $('<div>').addClass('d-flex justify-content-between');
    const headerContent = $('<div>').append($('<p>').text(displayFields.title.value)
                                                    .css({ 'color': 'black', 'font-size': '22px', 'font-weight': '700', 'line-height': '17px' }))
    if (displayFields.cost_price) {
      headerContent.append($('<p>').text(displayFields.cost_price.value)
                                   .css({ 'color': 'black', 'font-size': '14px', 'font-weight': '400', 'line-height': '17px' }));
    }

    queryParams['item_name']        = displayFields.title.value;
    queryParams['ticket_form_id']   = serviceCategoryItem.zendesk_form_id;
    queryParams['service_category'] = this.serviceCategoriesItems[serviceCategory].title;
    const url = '/hc/requests/new' + '?' + $.param(queryParams);

    const requestServiceBtn = $('<a>').attr('role', 'button')
                                      .attr('href', url)
                                      .text('Request Service')
                                      .addClass('btn request-service-btn');
    detailPageHeader.append(headerContent, requestServiceBtn);

    const detailPageBody = $('<div>');
    if (Object.keys(displayFields).length) {
      $.each(displayFields, (fieldName, fieldData) => {
        // Only showing description field for now.
        if (fieldName == 'description') {
          let section         = $('<section>');
          let sectionHeader   = $('<p>').text(fieldData['label']).css({ 'color': 'black', 'font-size': '16px', 'font-weight': '700', 'line-height': '17px' });
          let sectionContent  = this.prepareSectionContent(fieldData);
          section.append(sectionHeader, sectionContent);
          detailPageBody.append(section);
        }
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