import { extractServiceItemsWithCategory }  from './dummy_data.js';

class Search {
    constructor(demoData, itemBuilder, itemDetailBuilder) {
        this.fuse               = null;
        this.demoData           = demoData;
        this.itemBuilder        = itemBuilder;
        this.itemDetailBuilder  = itemDetailBuilder;
        this.initFuseSearch();
    }

    initFuseSearch() {
        const data = extractServiceItemsWithCategory(this.demoData);
        // Create a Fuse instance with the data and desired options
        const options = {
            keys: ['name'],      // Specify the property to search in
            includeScore: true  // Include search score in the results
        };
        this.fuse = new Fuse(data, options);
    }

    // Function to update search results
    updateResults(query, searchResultsContainer) {
        const results = this.fuse.search(query);

        // Clear previous results
        searchResultsContainer.empty();
        const searchItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

        // Display search results
        results.forEach(({ item }) => {
            let serviceCategoryItem = itemBuilder.buildServiceCategoryItem(item.serviceCategoryName, item);
            itemDetailBuilder = bindItemDetailEventListener(serviceCategoryItem);
            searchItemsFlex.append(serviceCategoryItem);
        });
        searchResultsContainer.append(searchItemsFlex);
    }

}

export { Search };