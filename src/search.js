import {
    noResultsFound
}   from './view_helper.js'
import {
    isMyAssignedAssets
}   from './utility.js'
import {
    ServiceCatalogItemBuilder
}   from './service_catalog_item_builder.js';
import {
    ServiceCatalogItemDetailBuilder
}   from './service_catalog_item_detail_builder.js';

class Search {
    constructor() {
        this.itemBuilder        = null;
        this.itemDetailBuilder  = null;
    }

    // Function to update search results
    updateResults = (data, options) => {
        const searchResults = data.search_results || Object.values(data.service_catalog_data);
        const searchResultsContainer = options.searchResultsContainer;
        debugger;
        searchResultsContainer.empty();
        if (!searchResults.length) {
            searchResultsContainer.append(noResultsFound());
            return;
        }

        self                     = this;
        self.itemBuilder         = options.itemBuilder;
        const searchItemsFlex    = $('<div>').addClass('d-flex flex-wrap gap-3');
        self.itemDetailBuilder   = options.itemDetailBuilder;       
        let parsedSearchResults  = Array.isArray(searchResults) ? searchResults : JSON.parse(searchResults);

        debugger;
        $.each(searchResults, function(index, serviceItem) {
            if (serviceItem) {
                let serviceCategory     = serviceItem.service_category_title_with_id;
                let serviceCategoryItem = self.itemBuilder.buildServiceCategoryItem(serviceCategory, serviceItem);
                self.itemDetailBuilder.bindItemDetailEventListener(serviceCategoryItem);
                searchItemsFlex.append(serviceCategoryItem);
            }
        });
        searchResultsContainer.append(searchItemsFlex);
    }
}

export {
    Search
};