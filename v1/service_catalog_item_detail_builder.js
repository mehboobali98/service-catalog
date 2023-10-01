class ServiceCatalogItemDetailBuilder {
  constructor(serviceCategoriesItems, zendeskFormData) {
    this.zendeskFormData        = zendeskFormData;
    this.serviceCategoriesItems = serviceCategoriesItems;
  }

  build() {
    $.each(this.serviceCategoriesItems, (serviceCategory, data) => {
      let containerId = serviceCategory + '_container';
      let container   = $('#' + containerId);
      if (serviceCategory === 'my_it_assets' || serviceCategory === 'view_raised_requests') {
        // do-nothing
      } else {
         $.each(data.serviceItems, (index, serviceCategoryItem) => {
          let zendeskFormData = this.zendeskFormData[serviceCategory];
          container.after(this.buildDetailPage(serviceCategoryItem, zendeskFormData));
          this.bindItemDetailEventListener(serviceCategoryItem);
        });
      }
    });
  }

  buildDetailPage(serviceCategoryItem, zendeskFormData) {
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
      $.each(detailPageFields, (index, fieldData) => {
        let section         = $('<section>');
        let sectionHeader   = $('<h4>').text(fieldData['label']);
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

    if (!fieldFormat) { return $('<p>').text(fieldValue); }

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