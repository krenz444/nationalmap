'use strict';

/*global require,ga*/
var inherit = require('../Core/inherit');
var SearchProviderViewModel = require('./SearchProviderViewModel');
var SearchResultViewModel = require('./SearchResultViewModel');

var defaultValue = require('../../third_party/cesium/Source/Core/defaultValue');
var defined = require('../../third_party/cesium/Source/Core/defined');

var CatalogItemNameSearchProviderViewModel = function(options) {
    SearchProviderViewModel.call(this);

    options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    this.application = options.application;
    this._geocodeInProgress = undefined;

    this.name = 'Catalogue Items';
    this.maxResults = defaultValue(options.maxResults, 10);
};

inherit(SearchProviderViewModel, CatalogItemNameSearchProviderViewModel);

CatalogItemNameSearchProviderViewModel.prototype.search = function(searchText) {
    if (!defined(searchText) || /^\s*$/.test(searchText)) {
        this.isSearching = false;
        this.searchResults.removeAll();
        return;
    }

    this.isSearching = true;
    this.searchResults.removeAll();
    this.searchMessage = undefined;

    ga('send', 'event', 'search', 'catalogue', searchText);

    var topLevelGroup = this.application.catalog.group;
    findMatchingItemsRecursively(this, new RegExp(searchText, 'i'), topLevelGroup);

    if (this.searchResults.length === 0) {
        this.searchMessage = 'Sorry, no catalogue items match your search query.';
    }

    this.isSearching = false;
};

function findMatchingItemsRecursively(viewModel, searchExpression, group) {
    var items = group.items;
    for (var i = 0; viewModel.searchResults.length < viewModel.maxResults && i < items.length; ++i) {
        var item = items[i];

        if (searchExpression.test(item.name)) {
            viewModel.searchResults.push(new SearchResultViewModel({
                name: item.name
            }));
        }

        if (defined(item.items)) {
            findMatchingItemsRecursively(viewModel, searchExpression, item);
        }
    }
}

module.exports = CatalogItemNameSearchProviderViewModel;