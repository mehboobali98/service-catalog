import { buildServiceCategoryItem } from './service_catalog_item_builder.js';
import { getServiceCategories, getServiceCategoriesItems, getServiceCategoryItems, updateServiceCategoryItems } from './dummy_data.js';

function addMenuItem(name, url, parent_ele) {
  const serviceCatalog = $('<a>').attr('href', url)
                                 .text(name)
                                 .attr('id', 'service-catalog-nav-item');
  $("#" + parent_ele).prepend(serviceCatalog);
}

function buildServiceCatalog() {
  debugger;
  const containers = buildUI();
  debugger;
  fetchUserAssetsAndSoftwareEntitlements(containers);
  debugger;
  bindEventListeners(getServiceCategories());
}

function buildUI() {
  const newSection = $('<section>').attr('id', 'service_catalog_section')
                                   .addClass('service-catalog-section');

  const serviceCatalogContainer = $('<div>').addClass('row');

  const searchAndNavContainer = $('<div>').addClass('col-2');
  const searchAndNavContainerText = $('<h1>').text('Categories');

  const searchField = $('<input>').attr('id', 'search-input')
                                  .attr('type', 'text')
                                  .attr('placeholder', 'search...');
  const searchBar = $('<div>').append(searchField).addClass('service-catalog-search');
  searchAndNavContainer.append(searchAndNavContainerText, searchField);

  const containers = {
    newSection: newSection,
    searchAndNavContainer: searchAndNavContainer,
    serviceCatalogContainer: serviceCatalogContainer
  };
  
  debugger;
  return containers;
}

function fetchUserAssetsAndSoftwareEntitlements(containers) {
  $.getJSON('/hc/api/v2/integration/token')
    .then(data => data.token)
    .then(token => {
      debugger;
      if (token) {
        const options = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': true } };
        const endPoint = 'user_assigned_assets_and_software_entitlements';
        const url = 'https://' + ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json';
        
        debugger;
        fetch(url, options)
          .then(response => response.json())
          .then(data => {
            debugger;
            updateServiceCategoryItems('my_it_assets', data);
            debugger;
            createServiceCategoriesView(containers, true);
          });
      } else {
        debugger;
        createServiceCategoriesView(containers, false);
      }
    });
}

function createServiceCategoriesView(containers, userExists) {
  const navbarContainer = $('<div>').addClass('service-categories-list');
  const navbar = generateNavbar(getServiceCategories(), userExists);
  navbarContainer.append(navbar);

  debugger;
  const newSection              = containers['newSection'];
  const searchAndNavContainer   = containers['searchAndNavContainer'];
  const serviceCatalogContainer = containers['serviceCatalogContainer'];

  debugger;
  searchAndNavContainer.append(navbarContainer);
  const serviceItemsContainer = buildServiceCategoriesItems(userExists);
  serviceCatalogContainer.append(searchAndNavContainer, serviceItemsContainer);
  newSection.append(serviceCatalogContainer);

  debugger;
  $('main').append(newSection);
}

// Create a function to generate the vertical navbar
function generateNavbar(serviceCategories, userExists) {
  const navbar = $('<ul></ul>');
  
  debugger;
  $.each(serviceCategories, function(index, serviceCategory) {
    var listItem = $('<li><a id="' + serviceCategory.id + '_link" href="' + serviceCategory.link + '">' + serviceCategory.name + '</a></li>');
    if (serviceCategory.name === 'My IT Assets' && userExists) {
      listItem.addClass('collapse');
    } else if (serviceCategory.name === 'View Raised Requests' && window.HelpCenter.user.role === 'anonymous') {
      listItem.addClass('collapse');
    }

    navbar.append(listItem);
  });

  return navbar;
}

function buildServiceCategoriesItems(userAuthenticated) {
  const serviceCategories = Object.keys(getServiceCategoriesItems());
  const serviceItemsContainer = $('<div>').addClass('col-10 service-items-container');
  debugger;
  const defaultVisibleCategoryIndex = getDefaultVisibleCategoryIndex(userAuthenticated);

  // handle if no service categories present.
  serviceCategories.forEach((serviceCategory, index) => {
    const serviceCategoryItems = getServiceCategoryItems(serviceCategory);
    const isVisible = index === defaultVisibleCategoryIndex;
    debugger;
    serviceItemsContainer.append(buildServiceCategoryItems(serviceCategory, serviceCategoryItems, isVisible));
  });
  debugger;

  return serviceItemsContainer;
}

function getDefaultVisibleCategoryIndex(userExists) {
  if (userExists) {
    return 0;
  } else if (window.HelpCenter.user.role === 'anonymous') {
    return 2;
  } else {
    return 1;
  }
}

function buildServiceCategoryItems(serviceCategory, serviceCategoryItems, isVisible) {
  const serviceCategoryItemsContainer = $('<div>');
  serviceCategoryItemsContainer.attr('id', serviceCategory + '_container');

  if (!isVisible) { serviceCategoryItemsContainer.addClass('collapse'); }

  const serviceCategoryLabel = $('<p>').text(serviceCategoryItems.label);
  const serviceCategoryDescription = $('<p>').text(serviceCategoryItems.description);

  serviceCategoryItemsContainer.append(serviceCategoryLabel, serviceCategoryDescription);

  const serviceCategoryItemsFlex = $('<div>').addClass('d-flex gap-3');

  $.each(serviceCategoryItems.serviceItems, function(index, serviceCategoryItem) {
    serviceCategoryItemsFlex.append(buildServiceCategoryItem(serviceCategory, serviceCategoryItem));
  });

  serviceCategoryItemsContainer.append(serviceCategoryItemsFlex);

  return serviceCategoryItemsContainer;
}

function bindEventListeners(serviceCategories) {
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

    $('#' + containerId).show();
  });
}

export { addMenuItem, buildServiceCatalog };
