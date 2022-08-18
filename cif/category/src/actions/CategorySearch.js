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

const LoaderProxy = require('../../../common/LoaderProxy.js');
const CategoriesLoader = require('../loaders/CategoriesLoader.js');
class CategorySearch {
  /**
   * @param {Object} parameters
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example authentication info.
   */
  constructor(parameters) {
    this.graphqlContext = parameters.graphqlContext;
    this.actionParameters = parameters.actionParameters;
    this.filters = { ...parameters.filters };
    this.params = parameters.params;
    this.categoriesLoader = new CategoriesLoader(parameters.actionParameters);
    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  /**
   * method used to call load method from categoriesLoader loader class
   */
  __load() {
    return this.categoriesLoader.load(this.actionParameters);
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
    let searchedCategoryWords = this.filters.name.match;

    /**
     * Searched Category Name from the user
     * Covert first letter of each words to UpperCase
     */
    const searchedCategoryName = searchedCategoryWords
      .split(' ')
      .map(word => {
        return word[0].toUpperCase() + word.substring(1);
      })
      .join(' ');

    let searchedCategoryNameData = [];

    /**
     * map each categories data
     */
    let categoriesData = data.results.flatMap(categoryData => categoryData);

    let childrenCategoriesData = categoriesData.flatMap(categoryData => {
      return categoryData.children.flatMap(
        childrenCategoryData => childrenCategoryData
      );
    });

    let childrenSubCategoriesData = childrenCategoriesData.flatMap(
      categoryData => {
        return categoryData.children.flatMap(
          childrenCategoryData => childrenCategoryData
        );
      }
    );

    /**
     *  filter and includes method used to check whether searched category name exists in catalog array
     */
    let filteredCategoriesData = categoriesData.filter(searchName =>
      searchName.name.includes(searchedCategoryName)
    );
    let filteredChildrenCategoriesData = childrenCategoriesData.filter(
      searchName => searchName.name.includes(searchedCategoryName)
    );
    let filteredChildrenSubCategoriesData = childrenSubCategoriesData.filter(
      searchName => searchName.name.includes(searchedCategoryName)
    );

    searchedCategoryNameData = filteredCategoriesData.concat(
      filteredChildrenCategoriesData,
      filteredChildrenSubCategoriesData
    );

    /**
     * This function will remove all the duplicate categories data based on the externalId
     */
    function getUniqueCategoriesList(searchedCategoryNameData, key) {
      return [
        ...new Map(
          searchedCategoryNameData.map(item => [item[key], item])
        ).values(),
      ];
    }
    const categoriesNameData = getUniqueCategoriesList(
      searchedCategoryNameData,
      'externalId'
    );

    return {
      items:
        categoriesNameData != []
          ? categoriesNameData.map(categoryName => {
              return {
                id: categoryName.externalId,
                uid: categoryName.externalId,
                image: null,
                name: categoryName.name,
                url_key: categoryName.slug,
                url_path: categoryName.slug,
                children_count: categoriesNameData.length,
              };
            })
          : [],

      total_count: categoriesNameData.length,
    };
  }
}
module.exports = CategorySearch;
