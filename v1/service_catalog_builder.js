import { buildServiceCategoryItem } from './service_catalog_item_builder.js';
import { getServiceCategories, getServiceCategoriesItems, getServiceCategoryItems, updateServiceCategoryItems } from './dummy_data.js';

function addMenuItem(name, url, parent_ele) {
  const serviceCatalog = $('<a>').attr('href', url)
                                 .text(name)
                                 .attr('id', 'service-catalog-nav-item');
  $("#" + parent_ele).prepend(serviceCatalog);
}

function buildServiceCatalog() {
  const containers = buildUI();
  fetchUserAssetsAndSoftwareEntitlements(containers);
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

  return containers;
}

function fetchUserAssetsAndSoftwareEntitlements(containers) {
  $.getJSON('/hc/api/v2/integration/token')
    .then(data => data.token)
    .then(token => {
      if (token) {
        const options = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': true } };
        const endPoint = 'user_assigned_assets_and_software_entitlements';
        const url = 'https://' + ezoSubdomain + '/webhooks/zendesk/' + endPoint + '.json';
        fetch(url, options)
          .then(response => response.json())
          .then(data => {
            updateServiceCategoryItems('my_it_assets', data);
            createServiceCategoriesView(containers, true);
          });
      } else {
        createServiceCategoriesView(containers, false);
      }
    });
}

function createServiceCategoriesView(containers, userExists) {
  const navbarContainer = $('<div>').addClass('service-categories-list');
  const navbar = generateNavbar(getServiceCategories(), userExists);
  navbarContainer.append(navbar);

  const newSection              = containers['newSection'];
  const searchAndNavContainer   = containers['searchAndNavContainer'];
  const serviceCatalogContainer = containers['serviceCatalogContainer'];

  searchAndNavContainer.append(navbarContainer);
  const serviceItemsContainer = buildServiceCategoriesItems(userExists);
  serviceCatalogContainer.append(searchAndNavContainer, serviceItemsContainer);
  newSection.append(serviceCatalogContainer);

  $('main').append(newSection);
  buildServiceItemsDetailPage();
  bindEventListeners(getServiceCategories());
}

// Create a function to generate the vertical navbar
function generateNavbar(serviceCategories, userExists) {
  const navbar = $('<ul></ul>');

  $.each(serviceCategories, function(index, serviceCategory) {
    var listItem = $('<li><a id="' + serviceCategory.id + '_link" href="' + serviceCategory.link + '">' + serviceCategory.name + '</a></li>');
    if (serviceCategory.name === 'My IT Assets' && !userExists) {
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
  const defaultVisibleCategoryIndex = getDefaultVisibleCategoryIndex(userAuthenticated);

  // to-do: handle if no service categories present.
  serviceCategories.forEach((serviceCategory, index) => {
    const serviceCategoryItems = getServiceCategoryItems(serviceCategory);
    const isVisible = index === defaultVisibleCategoryIndex;
    serviceItemsContainer.append(buildServiceCategoryItems(serviceCategory, serviceCategoryItems, isVisible));
  });

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

  const serviceCategoryItemsFlex = $('<div>').attr('id', serviceCategory + '_service_items_container')
                                             .addClass('d-flex gap-3');

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

    const detailPageElements = $("[class*='detail_page_container_']");
    $.each(detailPageElements, function(index, element) {
      element.hide();
    });
    $('#' + containerId).show();
  });
}

function buildServiceItemsDetailPage() {
  debugger;
  $.each(getServiceCategoriesItems(), function(serviceCategory, data) {
    let containerId = serviceCategory + '_service_items_container';
    let container   = $('#' + containerId);
    debugger;
    if (serviceCategory === 'my_it_assets') {
      // do-nothing
    } else {
      $.each(data.serviceItems, function(index, serviceCategoryItem) {
        debugger;
        container.after(buildDetailPage(serviceCategoryItem));
        debugger;
        bindEventListener(serviceCategoryItem);
      });
    }
  });
}

function buildDetailPage(serviceCategoryItem, categoryContainerId) {
  const detailPageContainer = $('div').attr('id', 'detail_page_container_' + serviceCategoryItem.id + '_' + serviceCategoryItem.name)
                                      .addClass('row collapse');

  const imageContainer = $('<div>').addClass('col-3');
  const image = $('<img>').attr('src', serviceCategoryItem.img_src)
                          .attr('alt', 'Software');
  debugger;
  imageContainer.append(image);

  const detailPageContent = $('<div>').addClass('col-9');

  const detailPageHeader  = $('<div>').addClass('d-flex justify-content-between');
  const headerContent = $('<div>').append($('<p>').text(serviceCategoryItem.name))
                                  .append($('<p>').text(serviceCategoryItem.price));
  // to-do: (add request service button)
  detailPageHeader.append(headerContent);

  const detailPageBody = $('<div>');
  const detailPageFields = serviceCategoryItem.detail_page_fields;
  debugger;
  if (detailPageFields) {
    $.each(detailPageFields, function(index, fieldData) {
      let section         = $('<section>');
      let sectionHeader   = $('<h4>').text(fieldData['label']);
      let sectionContent  = $('<p>').text(fieldData['value']);
      section.append(sectionHeader, sectionContent);
      detailPageBody.append(section);
    });
  }

  detailPageContent.append(detailPageHeader, detailPageBody);
  detailPageContainer.append(imageContainer, detailPageContent);

  return detailPageContent;
}

function bindEventListener(serviceCategoryItem) {
  debugger;
  $('body').on('click', '#service_item_detail_page_btn' + serviceCategoryItem.id + serviceCategory.name.toLowerCase(), function(e) {
    e.preventDefault();

    const id   = $(this).data('id');
    const name = $(this).data('name');
    const containerId = $(this).data('container-id');
    debugger;
    const containerEle = $('#' + containerId);
    const detailPageContainerId = 'detail_page_container_' + id + name;
    debugger;
    containerEle.hide();
    $('#' + detailPageContainerId).show();
  });
}

export { addMenuItem, buildServiceCatalog };
