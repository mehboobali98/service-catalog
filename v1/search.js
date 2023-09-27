import { buildServiceCategoryItem }         from './service_catalog_item_builder.js';
import { extractServiceItemsWithCategory }  from './dummy_data.js';

function initFuseSearch() {
    const data = extractServiceItemsWithCategory();
    debugger;
    // Create a Fuse instance with the data and desired options
    const options = {
        keys: ['name'],      // Specify the property to search in
        includeScore: true  // Include search score in the results
    };
    debugger;
    const fuse = new Fuse(data, options);
    return fuse;
}

// Function to update search results
function updateResults(fuse, query, searchResultsContainer) {
    const results = fuse.search(query);

    // Clear previous results
    searchResultsContainer.empty();
    const searchItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

    debugger;
    // Display search results
    results.forEach(({ item }) => {
        searchItemsFlex.append(buildServiceCategoryItem(item.serviceCategoryName, item));
    });
    debugger;
    searchResultsContainer.append(searchItemsFlex);
}

export { updateResults, initFuseSearch };