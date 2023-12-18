import { isMyAssignedAssets } from './utility.js'

class Search {
    constructor(itemBuilder, itemDetailBuilder) {
        this.itemBuilder        = itemBuilder;
        this.itemDetailBuilder  = itemDetailBuilder;
    }

    // Function to update search results
    updateResults = (serviceCategoriesItems, searchResultsContainer) => {
        // Clear previous results
        searchResultsContainer.empty();
        const searchItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

        $.each(serviceCategoriesItems, function(serviceCategory, serviceCategoryData) {
            let serviceItems = null;
            if (isMyAssignedAssets(serviceCategory)) {
                serviceItems = serviceCategoryData.service_items['assets'].concat(serviceCategoryData.service_items['software_entitlements']);
            } else {
                serviceCategoryItems.service_items ? JSON.parse(serviceCategoryItems.service_items) : [];
            }

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