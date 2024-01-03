import { STAGING_CDN_URL,
         PRODUCTION_CDN_URL } from './constant.js';

function noResultsFound() {
  const noResultsContainer = $('<div>').attr('id', 'no_results_container')
                                       .addClass('d-flex flex-column align-items-center no-results-container');
  const noResultsImage  = $('<img>').attr('src', `${PRODUCTION_CDN_URL}/shared/service_catalog/assets/images/svg/no_results_found.svg`);
                                    .addClass('no-results-image');
  const noResultsLabel  = $('<p>').text('No Result Found')
                                  .addClass('no-results-message');
  noResultsContainer.append(noResultsImage, noResultsLabel);
  return noResultsContainer;
}

export { noResultsFound };
