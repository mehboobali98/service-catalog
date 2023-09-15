import { serviceCategories } from './dummy_data.js';

function addMenuItem(name, url, parent_ele) {
  var anchor = document.createElement('a');
  var link   = document.createTextNode(name);
  anchor.appendChild(link);
  anchor.href = url;
  $("#" + parent_ele).prepend(anchor);
}

function buildServiceCatalog() {
  const newSection = $('<section>');
  newSection.attr('id', 'service-catalog-section');

  const serviceCatalogContainer = $('<div>').addClass('row');

  const navbarContainer = $('<div>').addClass('col-4');
  const navbar = generateNavbar(serviceCategories());
  navbarContainer.append(navbar);

  const serviceItemsContainer = $('<div>').addClass('col-8');

  // Append the navbar to the container
  serviceCatalogContainer.append(navbarContainer);
  serviceCatalogContainer.append(serviceItemsContainer);

  newSection.append(serviceCatalogContainer);
  $('main').append(newSection);
}

// Create a function to generate the vertical navbar
function generateNavbar(navItems) {
  var navbar = $('<ul></ul>');

  $.each(navItems, function(index, item) {
    var listItem = $('<li><a href="' + item.link + '">' + item.text + '</a></li>');
    navbar.append(listItem);
  });

  return navbar;
}

export { addMenuItem, buildServiceCatalog };