function noResultsFound() {
  const container       = $('div').addClass('d-flex flex-column align-items-center no-results-container');
  const noResultsImage  = $('<img>').attr('src', 'https://raw.githubusercontent.com/mehboobali98/service-catalog/service_catalog/v1/assets/svg/no_results_found.svg')
                                    .addClass('no-results-image');
  const noResultsLabel  = $('<p>').text('No Search Results Found')
                                  .addClass('no-results-message');
  container.append(noResultsImage, noResultsLabel);

  return container;
}

export { noResultsFound };