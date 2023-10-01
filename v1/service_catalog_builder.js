import { buildServiceCategoryItems }    from './service_catalog_item_builder.js';
import { buildServiceItemsDetailPage }  from './service_catalog_item_detail_builder.js';
import { initFuseSearch, updateResults } from './search.js';
import { getServiceCategories, getServiceCategoriesItems, getServiceCategoryItems, updateServiceCategoryItems } from './dummy_data.js';

class ServiceCatalogBuilder {
  constructor(demoData, zendeskFormData, ezoSubdomain) {
    this.demoData         = demoData;
    this.ezoSubdomain     = ezoSubdomain;
    this.zendeskFormData  = zendeskFormData;
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
    this.searchAndNavContainer.append(searchAndNavContainerText, searchField);

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
              this.updateServiceCategoryItems('my_it_assets', data);
              this.createServiceCategoriesView(containers, true);
            });
        } else {
          this.createServiceCategoriesView(containers, false);
        }
      });
  }

  createServiceCategoriesView(containers, userExists) {
    const navbarContainer = $('<div>').addClass('service-categories-list');
    const navbar = this.generateNavbar(getServiceCategories(), userExists);
    navbarContainer.append(navbar);

    const newSection              = containers['newSection'];
    const searchAndNavContainer   = containers['searchAndNavContainer'];
    const serviceCatalogContainer = containers['serviceCatalogContainer'];

    searchAndNavContainer.append(navbarContainer);
    const serviceItemsContainer = buildServiceCategoriesItems(userExists);
    const searchResultsContainer = $('<div>').attr('id', 'service_catalog_item_search_results_container')
                                             .addClass('col-10 collapse service-catalog-search-results-container');
    serviceCatalogContainer.append(searchAndNavContainer, serviceItemsContainer, searchResultsContainer);
    newSection.append(serviceCatalogContainer);

    $('main').append(newSection);
    buildServiceItemsDetailPage(getServiceCategoriesItems());
    this.bindEventListeners(getServiceCategories());
  }

  // Create a function to generate the vertical navbar
  generateNavbar(serviceCategories, userExists) {
    const navbar = $('<ul></ul>');

    $.each(serviceCategories, function(index, serviceCategory) {
      var listItem = $('<li><a id="' + serviceCategory.id + '_link" href="' + serviceCategory.link + '">' + serviceCategory.name + '</a></li>');
      if (serviceCategory.name === 'My IT Assets' && !userExists) {
        listItem.addClass('collapse');
      } else if (serviceCategory.name === 'View Raised Requests' && window.HelpCenter.user.role === 'anonymous') {
        listItem.addClass('collapse');
      }

      navbar.append(listItem);
    });

    return navbar;
  }

  buildServiceCategoriesItems(userAuthenticated) {
    const serviceCategories = Object.keys(getServiceCategoriesItems());
    const serviceItemsContainer = $('<div>').attr('id', 'service_items_container')
                                            .addClass('col-10 service-items-container');
    const defaultVisibleCategoryIndex = this.getDefaultVisibleCategoryIndex(userAuthenticated);

    // to-do: handle if no service categories present.
    serviceCategories.forEach((serviceCategory, index) => {
      const serviceCategoryItems = getServiceCategoryItems(serviceCategory);
      const isVisible = index === defaultVisibleCategoryIndex;
      serviceItemsContainer.append(buildServiceCategoryItems(serviceCategory, serviceCategoryItems, isVisible));
    });

    return serviceItemsContainer;
  }

  getDefaultVisibleCategoryIndex(userExists) {
    if (userExists) {
      return 0;
    } else if (window.HelpCenter.user.role === 'anonymous') {
      return 2;
    } else {
      return 1;
    }
  }

  bindEventListeners(serviceCategories) {
    const fuse = initFuseSearch();
    const serviceCategoriesIds = serviceCategories.map(serviceCategory => '#' + serviceCategory.id + '_link');

    $(serviceCategoriesIds.join(', ')).click(function(e) {
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