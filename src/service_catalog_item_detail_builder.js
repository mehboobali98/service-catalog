import {
  t,
  generateI18nKey
} from './i18n.js';

import {
  userRole,
  getCookie,
  setCookieForXHours,
  isMyAssignedAssets,
  placeholderImagePath
} from './utility.js';

import { renderFlashMessages } from './view_helper.js';

class ServiceCatalogItemDetailBuilder {
  constructor(locale) {
    this.locale                 = locale;
    this.userRole               = null;
    this.currency               = null;
    this.serviceCategoriesItems = null;
  }

  build(data) {
    this.userRole               = userRole();
    this.currency               = data.currency;
    this.serviceCategoriesItems = data.service_catalog_data;

    $.each(this.serviceCategoriesItems, (serviceCategory, data) => {
      let containerId = `${serviceCategory}_container`;
      let container   = $(`#${containerId}`);
      if (!isMyAssignedAssets(serviceCategory) && data.service_items) {
        let serviceItems = JSON.parse(data.service_items);
        $.each(serviceItems, (index, serviceCategoryItem) => {
          container.after(this.buildDetailPage(serviceCategory, serviceCategoryItem));
          this.bindItemDetailEventListener(this.userRole, serviceCategory, serviceCategoryItem);
        });
      }
    });
  }

  buildDetailPage(serviceCategory, serviceCategoryItem) {
    const displayFields       = serviceCategoryItem.display_fields;
    const containerId         = `detail_page_container${serviceCategoryItem.id}${serviceCategory}${displayFields.title.value}`;       
    const queryParams         = {};
    const detailPageContainer = $('<div>').attr('id', containerId)
                                          .addClass('row')
                                          .css({ 'display': 'none', 'margin-top': '38px', 'margin-right': '184px' });

    const imageContainer  = $('<div>').addClass('col-3');
    const placeholderPath = placeholderImagePath(serviceCategoryItem);
    const image = $('<img>').attr('src', serviceCategoryItem.display_picture_url || placeholderPath)
                            .attr('alt', 'placeholder image')
                            .addClass('w-100')
                            .on('error', function() {
                              // If the image fails to load, replace the source with a placeholder image
                              $(this).attr('src', placeholderPath)
                            });
    imageContainer.append(image);

    const textFont    = getComputedStyle(document.documentElement).getPropertyValue('--ez_text_font');
    const textColor   = getComputedStyle(document.documentElement).getPropertyValue('--ez_text_color');
    const headingFont = getComputedStyle(document.documentElement).getPropertyValue('--ez_heading_font');

    const detailPageContent = $('<div>').addClass('col-9');
    const detailPageHeader  = $('<div>').addClass('d-flex justify-content-between');
    const headerContent = $('<div>').append($('<p>').text(displayFields.title.value)
                                                    .css({ 'color': textColor, 'line-height': '17px', 'font-family': headingFont, 'font-weight': '600', 'font-size': '16px' }));
    if (displayFields.cost_price.value > 0) {
      headerContent.append($('<p>').text(`${this.currency} ${parseFloat(displayFields.cost_price['value'])}`)
                                   .css({ 'color': textColor, 'line-height': '17px', 'font-family': headingFont, 'font-size': '14px' }));
    }

    queryParams['item_name']            = displayFields.title.value;
    queryParams['ticket_form_id']       = serviceCategoryItem.zendesk_form_id;
    queryParams['service_item_id']      = serviceCategoryItem.id;
    queryParams['service_category']     = this.serviceCategoriesItems[serviceCategory].title;
    queryParams['subject-placeholder']  = t('request-service', 'Request Service');
    const url = `/hc/requests/new?${$.param(queryParams)}`;

    const requestServiceBtnContainer = $('<div>').addClass('request-service-btn-container');
    const requestServiceBtn = $('<a>').attr('href', url)
                                      .attr('data-i18n', 'request-service')
                                      .text('Request Service')
                                      .addClass('btn btn-outline-primary request-service-btn js-request-service-btn');
    requestServiceBtnContainer.append(requestServiceBtn);

    detailPageHeader.append(headerContent, requestServiceBtnContainer);

    const detailPageBody = $('<div>').addClass('mt-3');
    if (Object.keys(displayFields).length) {
      $.each(displayFields, (fieldName, fieldData) => {
        // Only showing description field for now.
        if (fieldName == 'description') {
          let section         = $('<section>');
          let sectionHeader   = $('<p>').attr('data-i18n', 'service-item-details')
                                        .text(fieldData.label)
                                        .css({ 'color': textColor, 'line-height': '17px', 'font-style': headingFont, 'font-weight': '600', 'font-size': '16px' });
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
    const textFont    = getComputedStyle(document.documentElement).getPropertyValue('--ez_text_font');
    const textColor   = getComputedStyle(document.documentElement).getPropertyValue('--ez_text_color');
    const fieldValue  = fieldData['value'];
    const fieldFormat = fieldData['format'];

    if (!fieldFormat) { return $('<p>').text(fieldValue).css({ 'color': textColor, 'font-size': '14px', 'font-weight': '400', 'line-height': '17px', 'font-family': textFont, 'font-size': '12px' }); }

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

  bindItemDetailEventListener(userRole, serviceCategory, serviceCategoryItem) {
    $('body').on('click', '.js-service-item-detail-page-btn, .js-default-service-item', function(e) {
      e.preventDefault();

      const id           = $(this).data('id');
      const name         = $(this).data('name');
      const containerId  = $(this).data('container-id');
      const containerEle = $(`#${containerId}`);
      const detailPageContainerId = `detail_page_container${id}${name}`;
      // to-do: unable to find elemeny by id using jquery but its found using javascript??
      const detailPageEle = $(document.getElementById(detailPageContainerId));
      $('#service_catalog_item_search_results_container').hide();
      containerEle.hide();
      $("[id*='_service_items_container']").hide();
      $('#service_items_container').show();
      detailPageEle.show();
    });

    $('body').on('click', '.js-request-service-btn', function(e) {
      if (userRole() == 'agent') {
        if ($('#flash_messages_outer_container').length == 0 && !getCookie('agent_ticket_submission_flash_message_shown_from_detail_page')) {
          let flashModal = renderFlashMessages(null, 'Please enable access to request forms via Guide Admin > Guide Settings.');
          setCookieForXHours(1, 'agent_ticket_submission_flash_message_shown_from_detail_page');
          $(flashModal).hide().appendTo('body').fadeIn('slow');
          return false;
        }
      } else {
        return true;
      }
    });
  }
}

export {
  ServiceCatalogItemDetailBuilder
};