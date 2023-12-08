import { extractServiceItemsWithCategory }  from './utility.js';

class Search {
    constructor(data, itemBuilder, itemDetailBuilder) {
        this.fuse               = null;
        this.data               = data;
        this.itemBuilder        = itemBuilder;
        this.itemDetailBuilder  = itemDetailBuilder;
        this.initFuseSearch();
    }

    initFuseSearch() {
        const searchableData = extractServiceItemsWithCategory(this.data);
        // Create a Fuse instance with the data and desired options
        const options = {
            keys:          ['name', 'description'],      // Specify the property to search in
            includeScore:  true  // Include search score in the results
        };
        this.fuse = new Fuse(searchableData, options);
    }

    // Function to update search results
    updateResults(query, searchResultsContainer) {
        const results = this.fuse.search(query);

        debugger;

        // Clear previous results
        searchResultsContainer.empty();
        const searchItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

        // Display search results
        results.forEach(({ item }) => {
            let serviceCategoryItem = this.itemBuilder.buildServiceCategoryItem(item.serviceCategoryName, item);
            this.itemDetailBuilder.bindItemDetailEventListener(serviceCategoryItem);
            searchItemsFlex.append(serviceCategoryItem);
        });
        searchResultsContainer.append(searchItemsFlex);
    }
}

export { Search };