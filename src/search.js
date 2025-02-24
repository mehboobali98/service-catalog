import { noResultsFound } from './view_helper.js';
import { isMyAssignedAssets } from './utility.js';
import { ServiceCatalogItemBuilder } from './service_catalog_item_builder.js';
import { ServiceCatalogItemDetailBuilder } from './service_catalog_item_detail_builder.js';

class Search {
    constructor() {
        this.itemBuilder = null;
        this.itemDetailBuilder = null;
    }

    /**
     * Safely parses search results from JSON string or returns array directly.
     * @param {Array|string} searchResults
     * @returns {Array}
     */
    parseSearchResults = (searchResults) => {
        if (Array.isArray(searchResults)) return searchResults;

        if (typeof searchResults === 'string') {
            try {
                return JSON.parse(searchResults);
            } catch (e) {
                console.error('Invalid JSON string:', e);
            }
        }
        return [];
    };

    /**
     * Clears previous results and displays a no-results message if needed.
     * @param {Object} container
     * @param {Array} results
     * @returns {boolean} - Returns true if no results found.
     */
    handleNoResults = (container, results) => {
        container.empty();
        if (results.length === 0) {
            container.append(noResultsFound());
            return true;
        }
        return false;
    };

    /**
     * Renders the search results.
     * @param {Array} results
     * @param {Object} container
     */
    renderResults = (results, container) => {
        const searchItemsFlex = $('<div>').addClass('d-flex flex-wrap gap-3');

        results.forEach((serviceItem) => {
            if (serviceItem && serviceItem.service_category_title_with_id) {
                const serviceCategory = serviceItem.service_category_title_with_id;
                const serviceCategoryItem = this.itemBuilder.buildServiceCategoryItem(serviceCategory, serviceItem);

                this.itemDetailBuilder.bindItemDetailEventListener(serviceCategoryItem);
                searchItemsFlex.append(serviceCategoryItem);
            }
        });

        container.append(searchItemsFlex);
    };

    /**
     * Updates the search results and renders them in the provided container.
     * @param {Object} data - The data containing search results.
     * @param {Object} options - Options including the container and builders.
     */
    updateResults = (data, options) => {
        if (!options || !options.searchResultsContainer) {
            console.error('Invalid options provided.');
            return;
        }

        // Parse and validate search results
        const searchResults = this.parseSearchResults(data.search_results);

        // Initialize builders
        this.itemBuilder = options.itemBuilder;
        this.itemDetailBuilder = options.itemDetailBuilder;

        // Handle no results case
        if (this.handleNoResults(options.searchResultsContainer, searchResults)) return;

        // Render search results
        this.renderResults(searchResults, options.searchResultsContainer);
    };
}

export { Search };
