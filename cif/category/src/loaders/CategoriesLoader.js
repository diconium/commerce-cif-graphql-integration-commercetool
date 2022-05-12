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

const DataLoader = require('dataloader');
const axios = require('axios');
const CategoriesQuery = require('../graphql/categories.graphql');
const TokenUtils = require('../../../common/TokenUtils');
class CategoriesLoader {
  /**
   * @param {Object} parameters parameters object contains the graphqlContext & actionParameters
   * @param {Object} [actionParameters] Some optional parameters of the I/O Runtime action, like for example authentication info.
   */
  constructor(actionParameters) {
    // The loading function: "categoryIds" is an Array of category ids
    let loadingFunction = categoryIds => {
      // This loader loads each category one by one, but if the 3rd party backend allows it,
      // it could also fetch all categories in one single request. In this case, the method
      // must still return an Array of categories with the same order as the keys.
      return Promise.resolve(
        categoryIds.map(categoryId => {
          console.debug(`--> Fetching category with id ${categoryId}`);
          return this.__getCategories(actionParameters).catch(error => {
            console.error(
              `Failed loading category ${categoryId}, got error ${JSON.stringify(
                error,
                null,
                0
              )}`
            );
            throw new Error(error);
          });
        })
      );
    };

    this.loader = new DataLoader(keys => loadingFunction(keys));
  }

  /**
   * Loads the category
   *
   * @returns {Promise} A Promise with the category data.
   */
  load(actionParameters) {
    return this.loader.load(actionParameters);
  }

  /**
   * method used get the category data
   * @param {String} actionParameters contain the context
   * @returns {Promise} A Promise with the category data.
   */
  __getCategories(actionParameters) {
    return new Promise((resolve, reject) => {
      const { defaultRequest } = actionParameters.context.settings;
      let request = { ...defaultRequest };
      request.data = {
        query: CategoriesQuery,
      };

      TokenUtils.getOAuthClientBearer(actionParameters.context.settings).then(
        token => {
          request.headers.Authorization = token;
          axios
            .request(request)
            .then(response => {
              if (!response.data.errors) {
                return resolve(response.data.data.categories);
              }
              reject(response.data.errors);
            })
            .catch(error => {
              reject(error);
            });
        }
      );
    });
  }
}

module.exports = CategoriesLoader;
