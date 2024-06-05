import { SvgBuilder }                           from './svg_builder.js';
import { STAGING_CDN_URL, PRODUCTION_CDN_URL }  from './constant.js';

function serviceCatalogDisabled(ezoSubdomain) {
  const serviceCatalogDisabledContainer = $('<div>').addClass('d-flex flex-column align-items-center service-catalog-disabled-container');
  const noAccessImage                   = $('<img>').attr('src', `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/no_access_image.svg`)
                                                    .addClass('no-access-image');

  const nextStepsMessage                = $('<p>').attr('data-i18n', 'enable-service-catalog')
                                                  .text('Please enable Service Catalog Builder in Asset Sonar to start using Service Catalog.')
                                                  .addClass('next-steps-message');

  // button
  const buttonsContainer                = $('<div>').addClass('d-flex mt-3 gap-3 justify-content-end');
  const companySettingsUrl              = `https://${ezoSubdomain}/companies/settings`;
  const companySettingsBtn              = $('<a>').attr('href', companySettingsUrl)
                                                  .attr('data-i18n', 'go-to-assetsonar')
                                                  .text('Go to AssetSonar')
                                                  .addClass('btn btn-outline-primary go-back-btn');
  buttonsContainer.append(companySettingsBtn);

  serviceCatalogDisabledContainer.append(noAccessImage, nextStepsMessage, buttonsContainer);
  return serviceCatalogDisabledContainer;
}

function serviceCatalogEmpty(ezoSubdomain) {
  const serviceCatalogEmptyContainer    = $('<div>').addClass('d-flex flex-column align-items-center service-catalog-empty-container');
  const serviceCategoryImage            = $('<img>').attr('src', `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/service_category.svg`)
                                                    .addClass('no-access-image');

  const nextStepsMessage                = $('<p>').attr('data-i18n', 'create-and-enable-service-categories')
                                                  .text('Please create and enable service categories in the builder to start using Service Catalog.')
                                                  .addClass('next-steps-message');

  // button
  const buttonsContainer                = $('<div>').addClass('d-flex mt-3 gap-3 justify-content-end');
  const serviceCatalogBuilderUrl        = `https://${ezoSubdomain}/service_catalog/builder`;
  const serviceCatalogBtn               = $('<a>').attr('href', serviceCatalogBuilderUrl)
                                                  .attr('data-i18n', 'go-to-service-catalog-builder')
                                                  .text('Go to Service Catalog Builder')
                                                  .addClass('btn btn-outline-primary go-back-btn');
  buttonsContainer.append(serviceCatalogBtn);

  serviceCatalogEmptyContainer.append(serviceCategoryImage, nextStepsMessage, buttonsContainer);
  return serviceCatalogEmptyContainer;
}

function noResultsFound() {
  const noResultsContainer  = $('<div>').attr('id', 'no_results_container')
                                        .addClass('d-flex flex-column align-items-center no-results-container');
  const noResultsImage      = $('<img>').attr('src', `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/no_results_found.svg`)
                                        .addClass('no-results-image');

  const noResultsLabel      = $('<p>').attr('data-i18n', 'no-results-found')
                                      .text('No Result Found')
                                      .addClass('no-results-message');

  noResultsContainer.append(noResultsImage, noResultsLabel);
  return noResultsContainer;
}

function noServiceItems(notFoundMessage) {
  const noResultsContainer  = $('<div>').attr('id', 'no_service_items_found_container')
                                        .addClass('d-flex flex-column align-items-center no-results-container');
  const noResultsImage      = $('<img>').attr('src', `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/service_asset.svg`)
                                        .addClass('no-results-image');

  const noResultsLabel      = $('<p>').text(notFoundMessage)
                                      .addClass('no-results-message');

  noResultsContainer.append(noResultsImage, noResultsLabel);
  return noResultsContainer;
}

function renderFlashMessages(type, message) {
  const flashMessagesOuterContainer = $('<div>').addClass('flash-messages-outer-container');
  const flashMessagesContainer      = $('<div>').addClass('flash-messages-container');
  const flashType                   = $('<div>').addClass('flash-type');

  // svg
  const flashSvgContainer           = $('<div>').addClass('d-flex flash-error-svg-container justify-content-center align-items-center');
  const flashSvg                    = new SvgBuilder().build('flashErrorSvg');
  flashSvgContainer.append(flashSvg);

  // flash message container
  const flashMessageContentContainer  = $('<div>').addClass('d-flex justify-content-center w-100');
  const flashMessageContainer         = $('<div>').addClass('row no-gutters');
  const flashMessage                  = $('<div>').addClass('col-11')
                                                  .append($('<p>').text(message));
  const flashMessageCloseBtnContainer = $('<div>').addClass('col-1');
  const flashMessageCloseBtnFlex      = $('<div>').addClass('d-flex justify-content-end');
  const flashMessageCloseBtn          = $('<div>').addClass('dismiss-icon')
                                                  .append($('<a>').attr('href', '#_').text('x'));
  flashMessageCloseBtnFlex.append(flashMessageCloseBtn);
  flashMessageCloseBtnContainer.append(flashMessageCloseBtnFlex);

  flashMessageContainer.append(flashMessage);
  flashMessageContentContainer.append(flashMessageContainer, flashMessageCloseBtnContainer);

  flashType.append(flashSvgContainer, flashMessageContentContainer);

  flashMessagesContainer.append(flashType);
  flashMessagesOuterContainer.append(flashMessagesContainer);

  return flashMessagesOuterContainer;
}

export {
  noServiceItems,
  noResultsFound,
  serviceCatalogEmpty,
  renderFlashMessages,
  serviceCatalogDisabled
};
