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
  const newSection = $('<section>').attr('id', 'service_catalog_section');

  const serviceCatalogContainer = $('<div>').addClass('row');

  const searchAndNavContainer = $('<div>').addClass('col-4 mr-4');

  const searchField = $('<input>').attr('id', 'search-input')
                                  .attr('type', 'text')
                                  .attr('placeholder', 'Search...');
  const searchBar = $('<div>').append(searchField).addClass('service-catalog-search');

  const navbarContainer = $('<div>');
  const navbar = generateNavbar(getServiceCategories());
  navbarContainer.append(navbar);

  searchAndNavContainer.append(searchBar, navbarContainer);

  const serviceItemsContainer = buildServiceCategoriesItems();

  // Append the navbar to the container
  serviceCatalogContainer.append(searchAndNavContainer, serviceItemsContainer); // Add serviceItemsContainer
  newSection.append(serviceCatalogContainer);
  $('main').append(newSection);
}

// Create a function to generate the vertical navbar
function generateNavbar(serviceCategories) {
  const navbar = $('<ul></ul>').addClass('service-categories-list');
  
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
  const serviceItemsContainer = $('<div>').addClass('col-8');

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

  const serviceCategoryItemsFlex = $('<div>').addClass('d-flex flex-wrap');

  $.each(serviceCategoryItems.serviceItems, function(index, serviceCategoryItem) {
    serviceCategoryItemsFlex.append(buildServiceCategoryItem(serviceCategoryItem));
  });

  serviceCategoryItemsContainer.append(serviceCategoryItemsFlex); // Append the flex container

  return serviceCategoryItemsContainer; // Add a return statement
}

export { addMenuItem, buildServiceCatalog };
