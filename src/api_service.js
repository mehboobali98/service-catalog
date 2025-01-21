import {
  setLocale
} from './i18n.js';

import {
  serviceCatalogDataPresent
} from './utility.js';

import { 
  noResultsFound, serviceCatalogEmpty, serviceCatalogDisabled
} from './view_helper.js';

class ApiService {
  constructor(locale, ezoSubdomain, integrationMode) {
    this.locale           = locale;
    this.ezoSubdomain     = ezoSubdomain;
    this.integrationMode  = integrationMode;
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

        debugger;
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
            debugger;
            if (data.service_catalog_enabled !== undefined && !data.service_catalog_enabled) {
              $('main').append(serviceCatalogDisabled(this.ezoSubdomain));
            } else if (!serviceCatalogDataPresent(data) && !data.search_results) {
              $('main').append(serviceCatalogEmpty(this.ezoSubdomain));
            } else {
              callback(data, options);
            }
            setLocale(this.locale, true);
          })
          .catch(error => {
            console.error('An error occurred while fetching service categories and items: ' + error.message);
          });
      }
    });
  }

  fetchServiceCategoriesAndItemsUsingCustomObjects(callback, noAccessPageCallback, options) {
    $.getJSON("/api/v2/users/me").then(userData => userData.email).then(userEmail => {
      debugger;
      if (userEmail) {
        if(options.searchQuery) {
          queryParams.search_query = options.searchQuery; 
        }

        debugger;
        fetch(`/api/v2/custom_objects/assetsonar_service_items/records/search?query=${userEmail}`).then((response) => {
          debugger;
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

          debugger;
          return response.json();
        })
        .then(data => {
          $('#loading_icon_container').empty();
          debugger;
          if (data.service_catalog_enabled !== undefined && !data.service_catalog_enabled) {
            $('main').append(serviceCatalogDisabled(this.ezoSubdomain));
          } else if (!serviceCatalogDataPresent(data) && !data.search_results) {
            $('main').append(serviceCatalogEmpty(this.ezoSubdomain));
          } else {
            debugger;
            callback(data, options);
          }
          setLocale(this.locale, true);
        })
        .catch(error => {
          console.error('An error occurred while fetching service categories and items: ' + error.message);
        });
      }
    });
  }


  fetchCustomObjects() {
    this.fetchUserData()
      .done((userData) => this.handleUserData(userData))
      .fail(function(error) {
        console.error("Failed to fetch user data:", error);
      });
  }

  fetchUserData() {
    return $.getJSON("/api/v2/users/me");
  }

  handleUserData(userData) {
    var userId    = userData.user.id;
    var userEmail = userData.user.email;
    if (userId) {
      this.populateAssetFieldUsingCustomObjects(userId, userEmail);
    } else {
      console.error("User ID not found in response.");
    }
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

        debugger;
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
            debugger;
            callback(data, callBackOptions.serviceItemsContainerId);
            setLocale(this.locale, true);
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