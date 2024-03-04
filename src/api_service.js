import { serviceCatalogDataPresent }              from './utility.js';
import { 
  noResultsFound, serviceCatalogEmpty, serviceCatalogDisabled
} from './view_helper.js';

class ApiService {
  constructor(ezoSubdomain) {
    this.ezoSubdomain = ezoSubdomain;
  }

  fetchServiceCategoriesAndItems(callback, noAccessPageCallback, options) {
    $.getJSON('/hc/api/v2/integration/token').then(data => data.token).then(token => {
        if (token) {
          const endPoint        = 'visible_service_categories_and_items';
          const queryParams     = {};
          const requestOptions  = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': true } };

          if(options.searchQuery) {
            queryParams.search_query = options.searchQuery; 
          }

          const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json' + '?' + $.param(queryParams);
          fetch(url, requestOptions)
            .then(response => {
              if (response.status == 400) {
                throw new Error('Bad Request: There was an issue with the request.');
              } else if (response.status == 403) {
                return response.json().catch(() => {
                  // Handle non-JSON response here
                  return noAccessPageCallback();
                });
              } else if (response.status == 404) {
                return noAccessPageCallback();
              }

              if (!response.ok) {
                throw new Error('Network response was not ok');
              }

              return response.json();
            })
            .then(data => {
              $('#loading_icon_container').empty();
              if (data.service_catalog_enabled !== undefined && !data.service_catalog_enabled) {
                $('main').append(serviceCatalogDisabled(this.ezoSubdomain));
              } else if (!serviceCatalogDataPresent(data)) {
                $('main').append(serviceCatalogEmpty(this.ezoSubdomain));
              } else {
                callback(data, options);
              }
            })
            .catch(error => {
              console.error('An error occurred while fetching service categories and items: ' + error.message);
            });
        }
    });
  }

  fetchServiceCategoryItems(categoryId, callback, callBackOptions) {
    $.getJSON('/hc/api/v2/integration/token').then(data => data.token).then(token => {
      if (token) {
        const options       = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': true } };
        const endPoint      = 'visible_service_categories_and_items';
        const queryParams   = {
          service_category_id: categoryId
        }; 
        const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json' + '?' + $.param(queryParams);
        $('#loading_icon_container').show();

        fetch(url, options)
          .then(response => {
            if (response.status === 400) {
              throw new Error('Bad Request: There was an issue with the request.');
            } else if (response.status === 404) {
              return noAccessPageCallback();
            }

            if (!response.ok) {
              throw new Error('Network response was not ok');
            }

            return response.json();
          })
          .then(data => {
            callback(data, callBackOptions.serviceItemsContainerId);
          })
          .catch(error => {
            console.error('An error occurred while fetching service categories and items: ' + error.message);
          });
      }
    });
  }

  withToken() {
    return $.getJSON('/hc/api/v2/integration/token').then(data => data.token);
  }
}

export { ApiService };