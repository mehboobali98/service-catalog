import { buildServiceCategoryItem }       from './service_catalog_item_builder.js';
import { getTokenAndFetchAssignedAssets } from './utility.js';
import { getServiceCategories, getServiceCategoriesItems, getServiceCategoryItems } from './dummy_data.js';

function addMenuItem(name, url, parent_ele) {
  const serviceCatalog = $('<a>').attr('href', url)
                                 .text(name)
                                 .attr('id', 'service-catalog-nav-item');
  $("#" + parent_ele).prepend(serviceCatalog);
}

function buildServiceCatalog() {
  buildUI();
  bindEventListeners(getServiceCategories());
}

function buildUI() {
  const newSection = $('<section>').attr('id', 'service_catalog_section').addClass('service-catalog-section');

  const serviceCatalogContainer = $('<div>').addClass('row');

  const searchAndNavContainer = $('<div>').addClass('col-2');
  const searchAndNavContainerText = $('<h1>').text('Categories');

  const searchField = $('<input>').attr('id', 'search-input')
                                  .attr('type', 'text')
                                  .attr('placeholder', 'search...');
  const searchBar = $('<div>').append(searchField).addClass('service-catalog-search');

  const navbarContainer = $('<div>').addClass('service-categories-list');

  debugger;
  getTokenAndFetchAssignedAssets('user_assigned_assets_and_software_entitlements');
  debugger;
  // prepare data to be rendered.

  const navbar = generateNavbar(getServiceCategories());
  navbarContainer.append(navbar);

  searchAndNavContainer.append(searchAndNavContainerText, searchBar, navbarContainer);

  const serviceItemsContainer = buildServiceCategoriesItems();

  // Append the navbar to the container
  serviceCatalogContainer.append(searchAndNavContainer, serviceItemsContainer);
  newSection.append(serviceCatalogContainer);
  $('main').append(newSection);
}

// Create a function to generate the vertical navbar
function generateNavbar(serviceCategories) {
  const navbar = $('<ul></ul>');
  
  $.each(serviceCategories, function(index, serviceCategory) {
    var listItem = $('<li><a id="' + serviceCategory.id + '_link" href="' + serviceCategory.link + '">' + serviceCategory.name + '</a></li>');
    if (serviceCategory.name === 'My IT Assets' && window.HelpCenter.user.role === 'anonymous') {
      listItem.addClass('collapse');
    } else if (serviceCategory.name === 'View Raised Requests' && window.HelpCenter.user.role === 'anonymous') {
      listItem.addClass('collapse');
    }

    navbar.append(listItem);
  });

  return navbar;
}

function buildServiceCategoriesItems() {
  const serviceCategories = Object.keys(getServiceCategoriesItems());
  const serviceItemsContainer = $('<div>').addClass('col-10 service-items-container');

  $.each(serviceCategories, function(index, serviceCategory) {
    var serviceCategoryItems = getServiceCategoryItems(serviceCategory);
    serviceItemsContainer.append(buildServiceCategoryItems(serviceCategory, serviceCategoryItems, serviceCategory === 'my_it_assets'));
  });

  return serviceItemsContainer;
}

function buildServiceCategoryItems(serviceCategory, serviceCategoryItems, visible) {
  const serviceCategoryItemsContainer = $('<div>');
  serviceCategoryItemsContainer.attr('id', serviceCategory + '_container');

  if (!visible) { serviceCategoryItemsContainer.addClass('collapse'); }

  const serviceCategoryLabel = $('<p>').text(serviceCategoryItems.label);
  const serviceCategoryDescription = $('<p>').text(serviceCategoryItems.description);

  serviceCategoryItemsContainer.append(serviceCategoryLabel, serviceCategoryDescription);

  const serviceCategoryItemsFlex = $('<div>').addClass('d-flex gap-3');

  $.each(serviceCategoryItems.serviceItems, function(index, serviceCategoryItem) {
    serviceCategoryItemsFlex.append(buildServiceCategoryItem(serviceCategoryItem));
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
