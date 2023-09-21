import { getServiceCategories, getServiceCategoriesItems, getServiceCategoryItems } from './dummy_data.js';
import { buildServiceCategoryItem } from './service_catalog_item_builder.js';

function addMenuItem(name, url, parent_ele) {
  var anchor = document.createElement('a');
  var link   = document.createTextNode(name);
  anchor.appendChild(link);
  anchor.href = url;
  $("#" + parent_ele).prepend(anchor);
}

function buildServiceCatalog() {
  const newSection = $('<section>').attr('id', 'service_catalog_section').addClass('service-catalog-section');

  const serviceCatalogContainer = $('<div>').addClass('row');

  const searchAndNavContainer = $('<div>').addClass('col-2');
  const searchAndNavContainerText = $('<h1>').text('Categories');

  const searchField = $('<input>').attr('id', 'search-input')
                                  .attr('type', 'text')
                                  .attr('placeholder', 'search...');
  const searchBar = $('<div>').append(searchField).addClass('service-catalog-search');

  const navbarContainer = $('<div>').addClass('service-categories-list');
  const navbar = generateNavbar(getServiceCategories());
  navbarContainer.append(navbar);

  searchAndNavContainer.append(searchAndNavContainerText, searchBar, navbarContainer);

  const serviceItemsContainer = buildServiceCategoriesItems();

  // Append the navbar to the container
  serviceCatalogContainer.append(searchAndNavContainer, serviceItemsContainer); // Add serviceItemsContainer
  newSection.append(serviceCatalogContainer);
  $('main').append(newSection);
  bindEventListeners(getServiceCategories());
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
    var serviceCategoryItems = getServiceCategoryItems(serviceCategory); // Move this line here
    serviceItemsContainer.append(buildServiceCategoryItems(serviceCategory, serviceCategoryItems, serviceCategory === 'My IT Assets'));
  });

  return serviceItemsContainer;
}

function buildServiceCategoryItems(serviceCategory, serviceCategoryItems, visible) {
  const serviceCategoryItemsContainer = $('<div>');
  serviceCategoryItemsContainer.attr('id', serviceCategory.toLowerCase().replace(/\s+/g, "_") + '_container');

  if (!visible) { serviceCategoryItemsContainer.addClass('collapse'); }

  const serviceCategoryLabel = $('<p></p>').text(serviceCategory);
  const serviceCategoryDescription = $('<p></p>').text(serviceCategoryItems.description);

  serviceCategoryItemsContainer.append(serviceCategoryLabel, serviceCategoryDescription);

  const serviceCategoryItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

  $.each(serviceCategoryItems.serviceItems, function(index, serviceCategoryItem) {
    serviceCategoryItemsFlex.append(buildServiceCategoryItem(serviceCategoryItem));
  });

  serviceCategoryItemsContainer.append(serviceCategoryItemsFlex); // Append the flex container

  return serviceCategoryItemsContainer; // Add a return statement
}

function bindEventListeners(serviceCategories) {
  const serviceCategoriesIds = serviceCategories.map(serviceCategory => '#' + serviceCategory.id + '_link');

  $(serviceCategoriesIds.join(', ')).click(function(e) {
    e.preventDefault();

    var categoryLinkId = $(this).attr('id');
    var containerId = categoryLinkId.replace('_link', '_container');
    debugger;

    // hide service items of remaining categories
    $.each(serviceCategoriesIds, function(index, serviceCategoryId) {
      debugger;
      if ('#' + categoryLinkId === serviceCategoryId) {
        // do nothing
      } else {
        debugger;
        $(serviceCategoryId.replace('_link', '_container')).hide(); // Fix the replacement for hiding containers.
      }
    });

    debugger;
    $('#' + containerId).show();
  });
}

export { addMenuItem, buildServiceCatalog };
