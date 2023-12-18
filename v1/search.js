import { isMyAssignedAssets }               from './utility.js'
import { ServiceCatalogItemBuilder }        from './service_catalog_item_builder.js';
import { ServiceCatalogItemDetailBuilder }  from './service_catalog_item_detail_builder.js';

class Search {
    constructor() {
        this.itemBuilder        = new ServiceCatalogItemBuilder();
        this.itemDetailBuilder  = new ServiceCatalogItemDetailBuilder();
    }

    // Function to update search results
    updateResults = (serviceCategoriesItems, options) => {
        self = this;
        const searchResultsContainer = options.searchResultsContainer;
        // Clear previous results
        searchResultsContainer.empty();
        const searchItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

        debugger;

        $.each(serviceCategoriesItems, (serviceCategory, serviceCategoryData) => {
            let serviceItems = [];
            if (isMyAssignedAssets(serviceCategory)) {
                serviceItems = serviceCategoryData.service_items['assets'].concat(serviceCategoryData.service_items['software_entitlements']);
                self.itemBuilder.zendeskFormData = serviceCategoryData.zendesk_form_data
            } else {
                serviceItems = serviceCategoryData.service_items ? JSON.parse(serviceCategoryData.service_items) : [];
            }

            debugger;
            $.each(serviceItems, function(index, serviceItem) {
                debugger;
                let serviceCategoryItem = self.itemBuilder.buildServiceCategoryItem(serviceCategory, serviceItem);
                self.itemDetailBuilder.bindItemDetailEventListener(serviceCategoryItem);
                searchItemsFlex.append(serviceCategoryItem);
            });
        });

        debugger;


        searchResultsContainer.append(searchItemsFlex);
    }
}

export { Search };