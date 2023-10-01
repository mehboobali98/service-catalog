import { buildServiceCategoryItem }         from './service_catalog_item_builder.js';
import { ServiceCatalogItemDetailBuilder }  from './service_catalog_item_detail_builder.js';
import { extractServiceItemsWithCategory }  from './dummy_data.js';

function initFuseSearch() {
    const data = extractServiceItemsWithCategory();
    // Create a Fuse instance with the data and desired options
    const options = {
        keys: ['name'],      // Specify the property to search in
        includeScore: true  // Include search score in the results
    };
    const fuse = new Fuse(data, options);
    return fuse;
}

// Function to update search results
function updateResults(fuse, query, searchResultsContainer) {
    const results = fuse.search(query);

    // Clear previous results
    searchResultsContainer.empty();
    const searchItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

    // Display search results
    results.forEach(({ item }) => {
        let serviceCategoryItem = buildServiceCategoryItem(item.serviceCategoryName, item);
        bindItemDetailEventListener(serviceCategoryItem);
        searchItemsFlex.append(serviceCategoryItem);
    });
    searchResultsContainer.append(searchItemsFlex);
}

export { updateResults, initFuseSearch };