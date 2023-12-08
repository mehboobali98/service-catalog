class ApiService {
  constructor(ezoSubdomain) {
    this.ezoSubdomain = ezoSubdomain;
  }

  fetchServiceCategoriesAndItems(callback, noAccessPageCallback) {
    $.getJSON('/hc/api/v2/integration/token')
     .then(data => data.token)
     .then(token => {
        if (token) {
          const options = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': true } };
          const endPoint = 'visible_service_categories_and_items';
          const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json';

          fetch(url, options)
            .then(response => {
              if (response.status === 400) {
                throw new Error('Bad Request: There was an issue with the request.');
              } else if (response.status === 404) {
                debugger;
                return noAccessPageCallback();
              }

              if (!response.ok) {
                throw new Error('Network response was not ok');
              }

              return response.json();
            })
            .then(data => {
              callback(data);
            })
            .catch(error => {
              alert('An error occurred while fetching service categories and items: ' + error.message);
            });
        }
    });
  }
}

export { ApiService };