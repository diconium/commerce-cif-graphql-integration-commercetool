/*******************************************************************************
 *
 *    Copyright 2019 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const CategoryTreeLoader = require('../category/src/loaders/CategoryTreeLoader.js');
const LoaderProxy = require('./LoaderProxy.js');
const Products = require('./Products');
// This module contains 3 classes because they have cross/cyclic dependencies to each other
// and it's not possible to have them in separate files because this is not supported by Javascript

class CategoryTree {
  /**
   * @param {Object} parameters
   * @param {String} parameters.categoryId The category id.
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example authentication info.
   * @param {CategoryTreeLoader} [parameters.categoryTreeLoader] An optional CategoryTreeLoader, to optimise caching.
   * @param {ProductsLoader} [parameters.productsLoader] An optional ProductsLoader, to optimise caching.
   * @param {categoryLevel} Increment this flag for every subcat level and passed to mage.
   * @param {urlPath} Concat all the slug like breadcrumbs.
   * @param {cpath} Concat all the category id like breadcrumbs.
   */
  constructor(parameters) {
    this.graphqlContext = parameters.graphqlContext;
    this.actionParameters = parameters.actionParameters;
    this.filters = { ...parameters.filters };
    this.params = parameters.params;
    this.categoryTreeLoader =
      parameters.categoryTreeLoader || new CategoryTreeLoader(parameters);
    this.categoryLevel = parameters.categoryLevel
      ? parameters.categoryLevel
      : 1;
    this.categoryId = parameters.categoryId || 1;
    if (parameters.filters && parameters.filters.category_uid) {
      this.categoryId =
        parameters.filters.category_uid.eq ||
        parameters.filters.category_uid.in.toString();
    } else if (parameters.filters && parameters.filters.parent_category_uid) {
      this.categoryId = parameters.filters.parent_category_uid.eq;
    }
    this.urlPath = parameters.urlPath ? parameters.urlPath : '';
    this.cpath = parameters.cpath ? parameters.cpath : this.categoryId;
    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  __load() {
    return this.categoryTreeLoader.load(this.categoryId);
  }

  /**
   * Converts some category data from the 3rd-party commerce system into the Magento GraphQL format.
   * Properties that require some extra data fetching with the 3rd-party system must have dedicated getters
   * in this class.
   *
   * @param {Object} data
   * @returns {Object} The backend category data converted into a GraphQL "CategoryTree" data.
   */
  __convertData(data) {
    if (this.categoryLevel === 1) {
      this.urlPath = data.slug;
      this.cpath = data.externalId;
    }

    return {
      ...data,
      id: data.externalId,
      uid: data.externalId,
      url_key: data.slug,
      url_path: this.urlPath,
      level: this.categoryLevel,
      path: this.cpath,
      include_in_menu: 1,
      position: 1,
      staged: false,
    };
  }
  get total_count() {
    return this.__load().then(data => {
      return data ? data.total : 0;
    });
  }
  get page_info() {
    return this.__load().then(data => {
      return {
        current_page: data ? this.params.currentPage || 20 : 1,
        page_size: this.params.pageSize || 20,
        total_pages: data ? 1 : 0,
      };
    });
  }
  get products() {
    return this.__load().then(data => {
      return new Products({
        filters: { category_uid: { eq: data.externalId } },
        limit: this.params.pageSize,
        offset: this.params.currentPage,
        graphqlContext: this.graphqlContext,
        actionParameters: this.actionParameters,
      });
    });
  }
  get __typename() {
    return 'CategoryTree';
  }
  get children() {
    return this.__load().then(data => {
      if (typeof data === 'undefined' || data === '' || data === null) {
        return [];
      }
      if (!data.children || data.children.length === 0) {
        return [];
      }
      let parentSlug = this.urlPath;
      let catidPath = this.cpath;
      this.urlPath = '';
      this.cpath = '';
      return data.children.map(category => {
        this.categoryTreeLoader.prime(category.externalId, category);
        this.urlPath = parentSlug + '/' + category.slug;
        this.cpath = catidPath + '/' + category.externalId;
        let clevel = this.categoryLevel;
        return new CategoryTree({
          categoryId: category.externalId,
          graphqlContext: this.graphqlContext,
          actionParameters: this.actionParameters,
          categoryTreeLoader: this.categoryTreeLoader,
          categoryLevel: parseInt(clevel + 1),
          urlPath: this.urlPath,
          params: this.params,
          cpath: this.cpath,
        });
      });
    });
  }

  get items() {
    return this.__load().then(data => {
      if (typeof data === 'undefined' || data === '' || data === null) {
        return [];
      }
      if (!data.children || data.children.length === 0) {
        return [];
      }
      let parentSlug = this.urlPath;
      let catidPath = this.cpath;
      this.urlPath = '';
      this.cpath = '';
      return data.children.map(category => {
        this.categoryTreeLoader.prime(category.externalId, category);
        this.urlPath = parentSlug + '/' + category.slug;
        this.cpath = catidPath + '/' + category.externalId;
        let clevel = this.categoryLevel;
        return new CategoryTree({
          categoryId: category.externalId,
          graphqlContext: this.graphqlContext,
          actionParameters: this.actionParameters,
          categoryTreeLoader: this.categoryTreeLoader,
          params: this.params,
          categoryLevel: parseInt(clevel + 1),
          urlPath: this.urlPath,
          cpath: this.cpath,
        });
      });
    });
  }
  get children_count() {
    return this.__load().then(data => {
      return data.children ? data.children.length : 0;
    });
  }
}

module.exports.CategoryTree = CategoryTree;
