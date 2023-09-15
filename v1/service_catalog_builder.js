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

  // Create a new vertical navbar (unordered list)
  const navbar = generateNavbar(serviceCategories());

  // Append the navbar to the new section
  newSection.append(navbar);

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