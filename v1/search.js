import { isMyAssignedAssets }               from './utility.js'
import { ServiceCatalogItemBuilder }        from './service_catalog_item_builder.js';
import { ServiceCatalogItemDetailBuilder }  from './service_catalog_item_detail_builder.js';

class Search {
    constructor() {
        this.itemBuilder        = null;
        this.itemDetailBuilder  = null;
    }

    // Function to update search results
    updateResults = (serviceCategoriesItems, options) => {
        this.itemBuilder             = new ServiceCatalogItemBuilder();
        this.itemDetailBuilder       = new ServiceCatalogItemDetailBuilder();

        const searchResultsContainer = options.searchResultsContainer;
        // Clear previous results
        searchResultsContainer.empty();
        const searchItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');
        debugger;

        $.each(serviceCategoriesItems, function(serviceCategory, serviceCategoryData) {
            let serviceItems = null;
            if (isMyAssignedAssets(serviceCategory)) {
                serviceItems = serviceCategoryData.service_items['assets'].concat(serviceCategoryData.service_items['software_entitlements']);
            } else {
                serviceCategoryItems.service_items ? JSON.parse(serviceCategoryItems.service_items) : [];
            }

            debugger;

            // Display search results
            serviceItems.forEach(({ item }) => {
                let serviceCategoryItem = this.itemBuilder.buildServiceCategoryItem(serviceCategory, item);
                this.itemDetailBuilder.bindItemDetailEventListener(serviceCategoryItem);
                searchItemsFlex.append(serviceCategoryItem);
            });
            searchResultsContainer.append(searchItemsFlex);
        });
    }
}

export { Search };