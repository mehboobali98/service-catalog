import { getServiceCategories, getServiceCategoriesItems, getServiceCategoryItems } from './dummy_data.js';

function addMenuItem(name, url, parent_ele) {
  var anchor = document.createElement('a');
  var link   = document.createTextNode(name);
  anchor.appendChild(link);
  anchor.href = url;
  $("#" + parent_ele).prepend(anchor);
}

function buildServiceCatalog() {
  const newSection = $('<section>').attr('id', 'service-catalog-section');

  const serviceCatalogContainer = $('<div>').addClass('row');

  const searchAndNavContainer = $('<div>').addClass('col-4');

  const searchBar = $('<div>').append($('<input>').attr('id', 'search-input').attr('type', 'text').attr('placeholder', 'Search...'));

  const navbarContainer = $('<div>');
  const navbar = generateNavbar(serviceCategories());
  navbarContainer.append(navbar);

  searchAndNavContainer.append(searchBar, navbarContainer)

  //const serviceItemsContainer = buildServiceCategoriesItems();

  // Append the navbar to the container
  serviceCatalogContainer.append(navbarContainer);
  //serviceCatalogContainer.append(serviceItemsContainer);

  newSection.append(serviceCatalogContainer);
  $('main').append(newSection);
}

// Create a function to generate the vertical navbar
function generateNavbar(serviceCategories) {
  const navbar = $('<ul></ul>');

  $.each(serviceCategories, function(index, serviceCategory) {
    var listItem = $('<li><a id="' + serviceCategory.id + '_link" href="' + serviceCategory.link + '">' + serviceCategory.name + '</a></li>');
    navbar.append(listItem);
  });
  return navbar;
}

function buildServiceCategoriesItems() {
  const serviceCategories     = Object.keys(getServiceCategoriesItems());
  const serviceItemsContainer = $('<div>').addClass('col-8');
  const serviceCategoryItems = getServiceCategoryItems(serviceCategory);

  $.each(serviceCategories, function(index, serviceCategory) {
    serviceItemsContainer.append(buildServiceCategoryItems(serviceCategory, serviceCategoryItems[serviceCategory]));
  });

  return serviceItemsContainer;
}

function buildServiceCategoryItems(serviceCategory, serviceCategoryItems) {
  const serviceCategoryItemsContainer = $('<div>');
  serviceCategoryItemsContainer.attr('id', serviceCategory.toLowerCase().replace(/\s+/g, "_"));

  const serviceCategoryLabel = $('<p></p>').text(serviceCategory);
  const serviceCategoryDescription = $('<p></p>').text(serviceCategoryItems.description);

  serviceCategoryItemsContainer.append(serviceCategoryLabel).append(serviceCategoryDescription);

  const serviceCategoryItemsFlex = $('<div>').addClass('d-flex');

  $.each(serviceCategoryItems, function(index, serviceCategoryItem) {
    serviceCategoryItemsFlex.append(buildServiceCategoryItem(serviceCategoryItem));
  });
}

function buildServiceCategoryItem(serviceCategoryItem) {
  k
}

export { addMenuItem, buildServiceCatalog };