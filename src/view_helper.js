import {
  STAGING_CDN_URL,
  PRODUCTION_CDN_URL
} from './constant.js';

function serviceCatalogDisabled(ezoSubdomain) {
  const serviceCatalogDisabledContainer = $('<div>').addClass('d-flex flex-column align-items-center service-catalog-disabled-container');
  const noAccessImage                   = $('<img>').attr('src', `${STAGING_CDN_URL}/shared/service_catalog/dist/public/images/svg/no_access_image.svg`)
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
  const serviceCategoryImage            = $('<img>').attr('src', `${STAGING_CDN_URL}/shared/service_catalog/dist/public/images/svg/service_category.svg`)
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

  const noResultsImage      = $('<img>').attr('src', `${STAGING_CDN_URL}/shared/service_catalog/dist/public/images/svg/no_results_found.svg`)
                                        .addClass('no-results-image');

  const noResultsLabel      = $('<p>').attr('data-i18n', 'no-results-found')
                                      .text('No Result Found')
                                      .addClass('no-results-message');

  noResultsContainer.append(noResultsImage, noResultsLabel);
  return noResultsContainer;
}

function noServiceItems(notFoundMessageKey) {
  const noResultsContainer  = $('<div>').attr('id', 'no_service_items_found_container')
                                       .addClass('d-flex flex-column align-items-center no-results-container');

  const noResultsImage      = $('<img>').attr('src', `${STAGING_CDN_URL}/shared/service_catalog/dist/public/images/svg/service_asset.svg`)
                                        .addClass('no-results-image');

  const noResultsLabel      = $('<p>').attr('data-i18n', notFoundMessageKey)
                                      .text(notFoundMessage)
                                      .addClass('no-results-message');

  noResultsContainer.append(noResultsImage, noResultsLabel);
  return noResultsContainer;
}

export {
  noServiceItems,
  noResultsFound,
  serviceCatalogEmpty,
  serviceCatalogDisabled
};
