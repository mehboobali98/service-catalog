import { Search }                           from './search.js';
import { ServiceCatalogItemBuilder }        from './service_catalog_item_builder.js';
import { ServiceCatalogItemDetailBuilder }  from './service_catalog_item_detail_builder.js';
import { updateServiceCategoryItems }       from './dummy_data.js';

class ServiceCatalogBuilder {
  constructor(demoData, zendeskFormData, ezoSubdomain) {
    this.demoData           = demoData;
    this.ezoSubdomain       = ezoSubdomain;
    this.zendeskFormData    = zendeskFormData;
    this.userAuthenticated  = window.HelpCenter.user.role !== 'anonymous';

    this.serviceCatalogItemBuilder       = new ServiceCatalogItemBuilder(demoData, zendeskFormData);
    this.serviceCatalogItemDetailBuilder = new ServiceCatalogItemDetailBuilder(demoData, zendeskFormData);
    this.fuzzySearch = new Search(this.demoData, this.serviceCatalogItemBuilder, this.serviceCatalogItemDetailBuilder);
  }

  addMenuItem(name, url, parent_ele) {
    const serviceCatalog = $('<a>').attr('href', url).text(name).attr('id', 'service-catalog-nav-item');
    $("#" + parent_ele).prepend(serviceCatalog);
  }

  buildServiceCatalog(demoData, zendeskFormData) {
    this.buildUI();
    this.fetchUserAssetsAndSoftwareEntitlements();
  }

  buildUI() {
    const newSection = $('<section>').attr('id', 'service_catalog_section')
                                     .addClass('service-catalog-section');

    const serviceCatalogContainer = $('<div>').addClass('row');

    const searchAndNavContainer = $('<div>').addClass('col-2');
    const searchAndNavContainerText = $('<h4>').text('Categories');

    const searchField = $('<input>').attr('id', 'search_input')
                                    .attr('type', 'text')
                                    .attr('placeholder', 'search...');
    const searchBar = $('<div>').append(searchField).addClass('service-catalog-search');
    searchAndNavContainer.append(searchAndNavContainerText, searchBar);

    const containers = {
      newSection: newSection,
      searchAndNavContainer: searchAndNavContainer,
      serviceCatalogContainer: serviceCatalogContainer
    };
    this.createServiceCategoriesView(containers, true);
  }

  fetchUserAssetsAndSoftwareEntitlements() {
    const myItAssetsContainer   = $('#my_it_assets_container');
    const loadingIconContainer  = this.loadingIcon();
    myItAssetsContainer.append(loadingIconContainer);

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
              loadingIconContainer.hide();

              this.demoData = updateServiceCategoryItems(this.demoData, 'my_it_assets', data);
              this.serviceCatalogItemBuilder.renderMyItAssets(this.demoData['my_it_assets']);
            });
        } else {
          loadingIconContainer.hide();

          // user does not exist in AssetSonar, so hide my_it_assets
          const myItAssetsLink = $('#my_it_assets_link');
          myItAssetsLink.parent().hide();
          myItAssetsContainer.hide();

          // Determine service category and its item which should be shown.
          const nextElement   = myItAssetsLink.parent().next();
          const nextElementId = nextElement.children().attr('id');
          
          if (nextElementId === 'view_raised_requests_link' && window.HelpCenter.user.role === 'anonymous') {
            nextElement.next().show();
            myItAssetsContainer.parent().next().next().show();
          } else {
            nextElement.show();
            myItAssetsContainer.parent().next().show();
          }
        }
      });
  }

  createServiceCategoriesView(containers, userExists) {
    const navbarContainer = $('<div>').attr('id', 'service_categories_list').addClass('service-categories-list');
    const navbar = this.generateNavbar(userExists);
    navbarContainer.append(navbar);

    const newSection              = containers['newSection'];
    const searchAndNavContainer   = containers['searchAndNavContainer'];
    const serviceCatalogContainer = containers['serviceCatalogContainer'];

    searchAndNavContainer.append(navbarContainer);
    const serviceItemsContainer   = this.serviceCatalogItemBuilder.build(userExists);
    const searchResultsContainer  = $('<div>').attr('id', 'service_catalog_item_search_results_container')
                                              .addClass('col-10 collapse service-catalog-search-results-container');
    serviceCatalogContainer.append(searchAndNavContainer, serviceItemsContainer, searchResultsContainer);
    newSection.append(serviceCatalogContainer);

    $('main').append(newSection);
    this.serviceCatalogItemDetailBuilder.build();
    this.bindEventListeners();
  }

  // Create a function to generate the vertical navbar
  generateNavbar(userExists) {
    let activeClassAdded = false;
    const navbar = $('<ul>');

    $.each(this.demoData, function(serviceCategory, serviceCategoryData) {
      let link     = serviceCategory === 'view_raised_requests' ? '/hc/requests' : '#_';
      let listItem = $('<li>').append($('<a>').attr({ 'id': serviceCategory + '_link' ,'href': link, 'target': '_blank' }).text(serviceCategoryData['label']));
      if (serviceCategory === 'my_it_assets' && !userExists) {
        listItem.addClass('collapse');
      } else if (serviceCategory === 'view_raised_requests' && window.HelpCenter.user.role === 'anonymous') {
        listItem.addClass('collapse');
      } else if (!activeClassAdded) {
        listItem.addClass('active');
        activeClassAdded = true;
      }

      navbar.append(listItem);
    });

    return navbar;
  }

  bindEventListeners() {
    const self = this;
    const serviceCategories    = Object.keys(this.demoData);
    const serviceCategoriesIds = serviceCategories.map(serviceCategory => '#' + serviceCategory + '_link');

    $(serviceCategoriesIds.join(', ')).click(function(e) {
      if ($(this).attr('href') !== '#_') { return true; }

      e.preventDefault();

      var categoryLinkId = $(this).attr('id');
      var containerId = categoryLinkId.replace('_link', '_container');

      // hide service items of remaining categories
      $.each(serviceCategoriesIds, function(index, serviceCategoryId) {
        if ('#' + categoryLinkId === serviceCategoryId) {
          // do nothing
        } else {
          $(serviceCategoryId).parent().removeClass('active');
          $(serviceCategoryId.replace('_link', '_container')).hide(); // Fix the replacement for hiding containers.
        }
      });

      $('#' + e.target.id).parent().addClass('active');
      $("[id*='detail_page_container']").hide();
      $('#' + containerId).show();
      $('#' + containerId.replace('_container', '_service_items_container')).show();
    });

    $('#search_input').on('keyup', function(e) {
      e.preventDefault();

      const query = $(this).val().trim();
      const serviceItemsContainer  = $('#service_items_container');
      const searchResultsContainer = $('#service_catalog_item_search_results_container');

      $('#service_categories_list ul li.active').removeClass('active');

      if (query.length === 0) {
        searchResultsContainer.hide();
        serviceItemsContainer.show();
      } else {
        serviceItemsContainer.hide();
        searchResultsContainer.show();
        self.fuzzySearch.updateResults(query, searchResultsContainer);
      }
    });
  }

  loadingIcon() {
    const loadingIconContainer    = $('<div>').attr('id', 'loading_icon_container')
                                              .addClass('col-10');
    const loadingIconFlex         = $('<div>').addClass('d-flex flex-column align-items-center');
    // to-do: store this on cdn and use.
    const loadingIcon             = $('<img>').attr({ 'src': 'https://s2.svgbox.net/loaders.svg?ic=puff',
                                                      'alt': 'Loading...'
                                                    });
    loadingIconFlex.append(loadingIcon);
    loadingIconContainer.append(loadingIconFlex);

    return loadingIconContainer;
  }
}

export { ServiceCatalogBuilder };