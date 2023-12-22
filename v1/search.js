import { isMyAssignedAssets }               from './utility.js'
import { ServiceCatalogItemBuilder }        from './service_catalog_item_builder.js';
import { ServiceCatalogItemDetailBuilder }  from './service_catalog_item_detail_builder.js';

class Search {
    constructor() {
        this.itemBuilder        = null;
        this.itemDetailBuilder  = null;
    }

    // Function to update search results
    updateResults = (data, options) => {
        self                         = this;
        self.itemBuilder             = options.itemBuilder;
        const searchItemsFlex        = $('<div>').addClass('d-flex flex-wrap gap-3');
        self.itemDetailBuilder       = options.itemDetailBuilder;
        const searchResults          = JSON.parse(data.search_results);
        const searchResultsContainer = options.searchResultsContainer;

        searchResultsContainer.empty();
        debugger;
        $.each(searchResults, function(index, serviceItem)) {
            let serviceCategory = service.service_category_title_with_id;
            let serviceCategoryItem = self.itemBuilder.buildServiceCategoryItem(serviceCategory, serviceItem);
            self.itemDetailBuilder.bindItemDetailEventListener(serviceCategoryItem);
            searchItemsFlex.append(serviceCategoryItem);
        }
        debugger;
        // $.each(serviceCategoriesItems, (serviceCategory, serviceCategoryData) => {
        //     let serviceItems = [];
        //     if (isMyAssignedAssets(serviceCategory)) {
        //         serviceItems = serviceCategoryData.service_items['assets'].concat(serviceCategoryData.service_items['software_entitlements']);
        //     } else {
        //         serviceItems = serviceCategoryData.service_items ? JSON.parse(serviceCategoryData.service_items) : [];
        //     }

        //     $.each(serviceItems, function(index, serviceItem) {
        //         let serviceCategoryItem = self.itemBuilder.buildServiceCategoryItem(serviceCategory, serviceItem);
        //         self.itemDetailBuilder.bindItemDetailEventListener(serviceCategoryItem);
        //         searchItemsFlex.append(serviceCategoryItem);
        //     });
        // });
        searchResultsContainer.append(searchItemsFlex);
    }
}

export { Search };