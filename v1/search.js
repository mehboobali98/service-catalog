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
            // Specify the property to search in
            keys:          ['name', 'display_fields.title' ,'display_fields.description', 'display_fields.short_description'],
            includeScore:  true  // Include search score in the results
        };
        this.fuse = new Fuse(searchableData, options);
    }

    // Function to update search results
    updateResults(query, searchResultsContainer) {
        const results = this.fuse.search(query);

        // Clear previous results
        searchResultsContainer.empty();
        const searchItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

        // Display search results
        results.forEach(({ serviceItem }) => {
            let serviceCategoryItem = this.itemBuilder.buildServiceCategoryItem(serviceItem.serviceCategoryName, serviceItem);
            this.itemDetailBuilder.bindItemDetailEventListener(serviceCategoryItem);
            searchItemsFlex.append(serviceCategoryItem);
        });
        searchResultsContainer.append(searchItemsFlex);
    }
}

export { Search };