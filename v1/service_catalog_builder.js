import { Search }                           from './search.js';
import { ApiService }                       from './api_service.js';
import { loadingIcon, serviceCatalogDataPresent }        from './utility.js';
import { ServiceCatalogItemBuilder }        from './service_catalog_item_builder.js';
import { ServiceCatalogItemDetailBuilder }  from './service_catalog_item_detail_builder.js';

class ServiceCatalogBuilder {
  constructor(ezoSubdomain) {
    this.apiService                      = new ApiService(ezoSubdomain);
    this.ezoSubdomain                    = ezoSubdomain;
    this.serviceCatalogItemBuilder       = new ServiceCatalogItemBuilder();
    this.serviceCatalogItemDetailBuilder = new ServiceCatalogItemDetailBuilder();
    this.search                          = new Search();
  }

  addMenuItem(name, url, parentEle) {
    const parentElement = $(`#${parentEle}`);
    const serviceCatalogNavItem = $('<a>', {
                                    href: url,
                                    text: name
                                  }).addClass('service-catalog-nav-item nav-link');
    const firstChildElement = parentElement.children(':first');
    if (firstChildElement.is('ul')) {
      firstChildElement.prepend($('<li>').append(serviceCatalogNavItem));
    } else {
      parentElement.prepend(serviceCatalogNavItem);
    }
  }

  buildServiceCatalog() {
    this.buildServiceCatalogHeaderSection();
    $('main').append(loadingIcon());
    this.apiService.fetchServiceCategoriesAndItems(this.buildUI, this.noAccessPage, {});
  }

  buildServiceCatalogHeaderSection() {
    const headerSection     = $('<section>');
    const headerContainer   = $('<div>').addClass('jumbotron jumbotron-fluid service-catalog-header-container');
    const headerEle         = $('<h2>').addClass('service-catalog-header-label')
                                       .text('Service Catalog');
    const headerDescription = $('<p>').addClass('service-catalog-description')
                                      .text('Explore the Service Catalog to find a curated range of solutions to your needs');
    headerContainer.append(headerEle, headerDescription);
    headerSection.append(headerContainer);
    $('main').append(headerSection);
  }

  buildUI = (data, options) => {
    this.data = data;

    if (!serviceCatalogDataPresent(data)) { return; }

    const newSection = $('<section>').attr('id', 'service_catalog_section')
                                     .addClass('service-catalog-section');

    const serviceCatalogContainer = $('<div>').addClass('row');

    const searchAndNavContainer = $('<div>').addClass('col-2');
    const searchAndNavContainerText = $('<p>').text('Categories').addClass('service-categories-heading');

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
    const navbar                 = $('<ul>');
    let activeClassAdded         = false;
    const serviceCategoriesItems = this.data.service_catalog_data;

    $.each(serviceCategoriesItems, function(serviceCategory, serviceCategoryData) {
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
    let timer                  = null;
    const self                 = this;
    const serviceCategories    = Object.keys(this.data.service_catalog_data);
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
      self.apiService.fetchServiceCategoryItems(
        categoryId,
        self.serviceCatalogItemBuilder.buildAndRenderServiceItems,
        callbackOptions
      );
      $('#' + containerId).show();
      $('#' + containerId.replace('_container', '_service_items_container')).show();
    });

    $('#search_input').on('keyup', function(e) {
      e.preventDefault();

      const query                  = $(this).val().trim();
      const serviceItemsContainer  = $('#service_items_container');
      const searchResultsContainer = $('#service_catalog_item_search_results_container');

      const activeCategory = $('#service_categories_list ul li.active');
      // to-do: Handle this.
      //activeCategory.removeClass('active');
      //searchResultsContainer.data('active-category', activeCategory);

      if (query.length === 0) {
        //searchResultsContainer.data('active-category').addClass('active');
        searchResultsContainer.hide();
        serviceItemsContainer.show();
      } else {
        serviceItemsContainer.hide();
        // Clear previous results
        searchResultsContainer.empty();
        debugger;
        searchResultsContainer.append(loadingIcon('col-10'));
        searchResultsContainer.show();

        if (timer) { clearTimeout(timer); }

        timer = setTimeout(
          function () {
            self.apiService.fetchServiceCategoriesAndItems(
              self.search.updateResults,
              self.noAccessPage,
              {
                searchQuery: query,
                searchResultsContainer: searchResultsContainer,
                itemBuilder: self.serviceCatalogItemBuilder,
                itemDetailBuilder: self.serviceCatalogItemDetailBuilder
              }
            );
          },
          500
        );
      }
    });
  }

  noAccessPage() {
    const noAccessPageSection = $('<section>').attr('id', 'no_access_page_section')
                                              .addClass('no-access-page-section');

    const noAccessPageContainer = $('<div>').addClass('d-flex flex-column align-items-center');
    const noAccessImage         = $('<img>').attr('src', 'https://raw.githubusercontent.com/mehboobali98/service-catalog/service_catalog/v1/assets/svgs/no_access_image.svg')
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
}

export { ServiceCatalogBuilder };