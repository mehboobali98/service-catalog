import { ServiceCatalogItemBuilder }        from './service_catalog_item_builder.js';
import { ServiceCatalogItemDetailBuilder }  from './service_catalog_item_detail_builder.js';
import { initFuseSearch, updateResults }    from './search.js';
import { updateServiceCategoryItems } from './dummy_data.js';

class ServiceCatalogBuilder {
  constructor(demoData, zendeskFormData, ezoSubdomain) {
    this.demoData         = demoData;
    this.ezoSubdomain     = ezoSubdomain;
    this.zendeskFormData  = zendeskFormData;

    this.serviceCatalogItemDetailBuilder = new ServiceCatalogItemDetailBuilder(demoData, zendeskFormData);
  }

  addMenuItem(name, url, parent_ele) {
    const serviceCatalog = $('<a>').attr('href', url).text(name).attr('id', 'service-catalog-nav-item');
    $("#" + parent_ele).prepend(serviceCatalog);
  }

  buildServiceCatalog(demoData, zendeskFormData) {
    const containers = this.buildUI();
    this.fetchUserAssetsAndSoftwareEntitlements(containers);
  }

  buildUI() {
    const newSection = $('<section>').attr('id', 'service_catalog_section')
                                     .addClass('service-catalog-section');

    const serviceCatalogContainer = $('<div>').addClass('row');

    const searchAndNavContainer = $('<div>').addClass('col-2');
    const searchAndNavContainerText = $('<h1>').text('Categories');

    const searchField = $('<input>').attr('id', 'search_input')
                                    .attr('type', 'text')
                                    .attr('placeholder', 'search...');
    const searchBar = $('<div>').append(searchField).addClass('service-catalog-search');
    searchAndNavContainer.append(searchAndNavContainerText, searchField);

    const containers = {
      newSection: newSection,
      searchAndNavContainer: searchAndNavContainer,
      serviceCatalogContainer: serviceCatalogContainer
    };

    return containers;
  }

  fetchUserAssetsAndSoftwareEntitlements(containers) {
    $.getJSON('/hc/api/v2/integration/token')
      .then(data => data.token)
      .then(token => {
        if (token) {
          const options = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': true } };
          const endPoint = 'user_assigned_assets_and_software_entitlements';
          const url = 'https://' + this.ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json';
          fetch(url, options)
            .then(response => response.json())
            .then(data => {
              this.demoData = updateServiceCategoryItems(this.demoData, 'my_it_assets', data);
              this.createServiceCategoriesView(containers, true);
            });
        } else {
          this.createServiceCategoriesView(containers, false);
        }
      });
  }

  createServiceCategoriesView(containers, userExists) {
    const navbarContainer = $('<div>').addClass('service-categories-list');
    const navbar = this.generateNavbar(userExists);
    navbarContainer.append(navbar);

    const newSection              = containers['newSection'];
    const searchAndNavContainer   = containers['searchAndNavContainer'];
    const serviceCatalogContainer = containers['serviceCatalogContainer'];

    searchAndNavContainer.append(navbarContainer);
    const serviceItemsContainer = new ServiceCatalogItemBuilder(userExists, this.demoData, this.zendeskFormData).build();
    const searchResultsContainer = $('<div>').attr('id', 'service_catalog_item_search_results_container')
                                             .addClass('col-10 collapse service-catalog-search-results-container');
    serviceCatalogContainer.append(searchAndNavContainer, serviceItemsContainer, searchResultsContainer);
    newSection.append(serviceCatalogContainer);

    $('main').append(newSection);
    this.serviceCatalogItemDetailBuilder.build();
    this.bindEventListeners();
  }

  // Create a function to generate the vertical navbar
  generateNavbar(userExists) {
    const navbar = $('<ul>');

    $.each(this.demoData, function(serviceCategory, serviceCategoryData) {
      let link     = serviceCategory === 'view_raised_requests' ? '/hc/requests' : '#_';
      let listItem = $('<li>').append($('<a>').attr({ 'id': serviceCategory + '_link' ,'href': link, 'target': '_blank' }).text(serviceCategoryData['label']));
      if (serviceCategory === 'my_it_assets' && !userExists) {
        listItem.addClass('collapse');
      } else if (serviceCategory === 'view_raised_requests' && window.HelpCenter.user.role === 'anonymous') {
        listItem.addClass('collapse');
      }

      navbar.append(listItem);
    });

    return navbar;
  }

  bindEventListeners() {
    const fuse = initFuseSearch();
    const serviceCategories    = Object.keys(this.demoData);
    const serviceCategoriesIds = serviceCategories.map(serviceCategory => '#' + serviceCategory + '_link');

    debugger;
    $(serviceCategoriesIds.join(', ')).click(function(e) {
      debugger;
      if ($(this).attr('href') !== '#_') { return true; }
      e.preventDefault();

      var categoryLinkId = $(this).attr('id');
      var containerId = categoryLinkId.replace('_link', '_container');

      // hide service items of remaining categories
      $.each(serviceCategoriesIds, function(index, serviceCategoryId) {
        if ('#' + categoryLinkId === serviceCategoryId) {
          // do nothing
        } else {
          $(serviceCategoryId.replace('_link', '_container')).hide(); // Fix the replacement for hiding containers.
        }
      });

      $("[id*='detail_page_container']").hide();
      $('#' + containerId).show();
      $('#' + containerId.replace('_container', '_service_items_container')).show();
    });

    $('#search_input').on('keyup', function(e) {
      e.preventDefault();

      const query = $(this).val().trim();
      const serviceItemsContainer  = $('#service_items_container');
      const searchResultsContainer = $('#service_catalog_item_search_results_container');
      if (query.length === 0) {
        searchResultsContainer.hide();
        serviceItemsContainer.show();
      } else {
        serviceItemsContainer.hide();
        searchResultsContainer.show();
        updateResults(fuse, query, searchResultsContainer);
      }
    });
  }
}

export { ServiceCatalogBuilder };