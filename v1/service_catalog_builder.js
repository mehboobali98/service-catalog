import { Search }                           from './search.js';
import { ApiService }                       from './api_service.js';
import { ServiceCatalogItemBuilder }        from './service_catalog_item_builder.js';
import { ServiceCatalogItemDetailBuilder }  from './service_catalog_item_detail_builder.js';
import { updateServiceCategoryItems }       from './dummy_data.js';

class ServiceCatalogBuilder {
  constructor(demoData, zendeskFormData, ezoSubdomain) {
    this.demoData           = demoData;
    this.ezoSubdomain       = ezoSubdomain;
    this.zendeskFormData    = zendeskFormData;
    this.serviceCatalogItemBuilder       = new ServiceCatalogItemBuilder(demoData, zendeskFormData);
    this.serviceCatalogItemDetailBuilder = new ServiceCatalogItemDetailBuilder(demoData, zendeskFormData);
    this.fuzzySearch = new Search(this.demoData, this.serviceCatalogItemBuilder, this.serviceCatalogItemDetailBuilder);
  }

  addMenuItem(name, url, parent_ele) {
    const serviceCatalog = $('<a>').attr('href', url).text(name).attr('id', 'service-catalog-nav-item');
    $("#" + parent_ele).prepend(serviceCatalog);
  }

  buildServiceCatalog(demoData, zendeskFormData) {
    if (window.HelpCenter.user.role === 'anonymous') { return; }

    debugger;
    var data = new ApiService(this.ezoSubdomain).fetchServiceCategoriesAndItems();
    new ApiService(this.ezoSubdomain).fetchServiceCategoriesAndItems((data) => {
      this.buildUI(data);
    });
    //this.fetchUserAssetsAndSoftwareEntitlements();
  }

  buildUI(data) {
    debugger;
    const newSection = $('<section>').attr('id', 'service_catalog_section')
                                     .addClass('service-catalog-section');

    const serviceCatalogContainer = $('<div>').addClass('row');

    const searchAndNavContainer = $('<div>').addClass('col-2');
    const searchAndNavContainerText = $('<h4>').text('Categories').addClass('service-categories-heading');

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
    this.createServiceCategoriesView(containers);
  }

  createServiceCategoriesView(containers) {
    const navbarContainer = $('<div>').attr('id', 'service_categories_list').addClass('service-categories-list');
    const navbar = this.generateNavbar();
    navbarContainer.append(navbar);

    const newSection              = containers['newSection'];
    const searchAndNavContainer   = containers['searchAndNavContainer'];
    const serviceCatalogContainer = containers['serviceCatalogContainer'];

    searchAndNavContainer.append(navbarContainer);
    const serviceItemsContainer   = this.serviceCatalogItemBuilder.build();
    const searchResultsContainer  = $('<div>').attr('id', 'service_catalog_item_search_results_container')
                                              .addClass('col-10 collapse service-catalog-search-results-container');
    serviceCatalogContainer.append(searchAndNavContainer, serviceItemsContainer, searchResultsContainer);
    newSection.append(serviceCatalogContainer);

    const imageSection = $('<section>').addClass('section hero');
    $('main').append(imageSection, newSection);
    this.serviceCatalogItemDetailBuilder.build();
    this.bindEventListeners();
  }

  // Create a function to generate the vertical navbar
  generateNavbar() {
    const navbar = $('<ul>');

    $.each(this.demoData, function(serviceCategory, serviceCategoryData) {
      let link     = '#_';
      let listItem = $('<li>').append($('<a>')
                              .attr({ 'id': serviceCategory + '_link' ,'href': link, 'target': '_blank' })
                              .text(serviceCategoryData['label']));
      navbar.append(listItem);
    });

    return navbar;
  }

  bindEventListeners() {
    const self = this;
    const serviceCategories    = Object.keys(this.demoData);
    const serviceCategoriesIds = serviceCategories.map(serviceCategory => '#' + serviceCategory + '_link');

    $(serviceCategoriesIds.join(', ')).click(function(e) {
      $('#service_categories_list ul li.active').removeClass('active');
      $('#' + e.target.id).parent().addClass('active');

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