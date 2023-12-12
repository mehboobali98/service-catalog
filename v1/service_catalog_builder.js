import { Search }                           from './search.js';
import { ApiService }                       from './api_service.js';
import { ServiceCatalogItemBuilder }        from './service_catalog_item_builder.js';
import { ServiceCatalogItemDetailBuilder }  from './service_catalog_item_detail_builder.js';

class ServiceCatalogBuilder {
  constructor(ezoSubdomain) {
    this.apiService                      = new ApiService(ezoSubdomain);
    this.ezoSubdomain                    = ezoSubdomain;
    this.serviceCatalogItemBuilder       = new ServiceCatalogItemBuilder();
    this.serviceCatalogItemDetailBuilder = new ServiceCatalogItemDetailBuilder();
  }

  addMenuItem(name, url, parent_ele) {
    const serviceCatalog = $('<a>').attr('href', url).text(name).attr('id', 'service-catalog-nav-item');
    $("#" + parent_ele).prepend(serviceCatalog);
  }

  buildServiceCatalog() {
    const imageSection = $('<section>').addClass('section hero');
    $('main').append(imageSection);
    this.apiService.fetchServiceCategoriesAndItems(this.buildUI, this.noAccessPage);
  }

  buildUI = (data) => {
    this.data = data;
    //this.fuzzySearch = new Search(this.data, this.serviceCatalogItemBuilder, this.serviceCatalogItemDetailBuilder);
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
    const serviceItemsContainer   = this.serviceCatalogItemBuilder.build(this.data);
    const searchResultsContainer  = $('<div>').attr('id', 'service_catalog_item_search_results_container')
                                              .addClass('col-10 collapse service-catalog-search-results-container');
    serviceCatalogContainer.append(searchAndNavContainer, serviceItemsContainer, searchResultsContainer);
    newSection.append(serviceCatalogContainer);

    $('main').append(newSection);
    this.serviceCatalogItemDetailBuilder.build(this.data);
    this.bindEventListeners();
  }

  // Create a function to generate the vertical navbar
  generateNavbar() {
    const navbar         = $('<ul>');
    let activeClassAdded = false;

    $.each(this.data, function(serviceCategory, serviceCategoryData) {
      let link     = '#_';
      let listItem = $('<li>').append($('<a>')
                              .attr({ 'id': serviceCategory + '_link' ,'href': link, 'target': '_blank' })
                              .text(serviceCategoryData['title']));
      if (!activeClassAdded) {
        activeClassAdded = true;
        listItem.addClass('active');
      }
      navbar.append(listItem);
    });

    return navbar;
  }

  bindEventListeners() {
    const self                 = this;
    const serviceCategories    = Object.keys(this.data);
    const serviceCategoriesIds = serviceCategories.map(serviceCategory => '#' + serviceCategory + '_link');

    $(serviceCategoriesIds.join(', ')).click(function(e) {
      var categoryLinkId = $(this).attr('id');
      if ($('#' + e.target.id).parent().hasClass('active') ) { return false; }

      $('#service_categories_list ul li.active').removeClass('active');
      $('#' + e.target.id).parent().addClass('active');

      e.preventDefault();

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
      const callbackOptions = {
        serviceItemsContainerId: '#' + containerId.replace('_container', '_service_items_container')  
      };
      const categoryId = categoryLinkId.split('_')[0];
      self.apiService.fetchServiceCategoryItems(categoryId, self.serviceCatalogItemBuilder.buildAndRenderServiceItems, callbackOptions)
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

  noAccessPage() {
    const noAccessPageSection = $('<section>').attr('id', 'no_access_page_section')
                                              .addClass('no-access-page-section');

    const noAccessPageContainer = $('<div>').addClass('d-flex flex-column align-items-center');
    const noAccessImage         = $('<img>').attr('src', 'https://raw.githubusercontent.com/mehboobali98/service-catalog/connect_service_catalog_with_api/v1/no_access_image.svg')
                                            .addClass('no-access-image');

    const warningMessage        = $('<h4>').text('You do not have permission to access this page!');
    const nextStepsMessage      = $('<p>').text('Please contact your administrator to get access')
                                          .addClass('next-steps-message');

    // buttons
    const buttonsContainer      = $('<div>').addClass('d-flex mt-3 gap-3 justify-content-end');
    const goBackButton          = $('<a>').attr('href', '#_')
                                          .text('Go Back')
                                          .addClass('btn btn-outline-primary go-back-btn')
                                          .click(function() { window.history.back(); });
    buttonsContainer.append(goBackButton);


    noAccessPageContainer.append(noAccessImage, warningMessage, nextStepsMessage, buttonsContainer);
    noAccessPageSection.append(noAccessPageContainer);

    $('main').append(noAccessPageSection);
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