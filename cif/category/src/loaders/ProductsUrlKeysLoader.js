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
const TokenUtils = require('../../../common/TokenUtils');
const ProductQuery = require('../graphql/products.graphql');
class ProductsLoader {
  /**
   * @param {Object} parameters parameters object contains the graphqlContext & actionParameters
   * @param {Object} [actionParameters] Some optional parameters of the I/O Runtime action, like for example authentication info.
   */
  constructor(parameters) {
    this.parameters = parameters;
    // The loading function: "productsUrlKeys" is an Array of urlKeys
    let loadingFunction = productsUrlKeys => {
      // This loader loads each urlKey one by one, but if the 3rd party backend allows it,
      // it could also fetch all products in one single request. In this case, the method
      // must still return an Array of products  with the same order as the keys.

      return Promise.resolve(
        productsUrlKeys.map(productUrlKey => {
          // console.debug(`--> Fetching Product with urlKey ${productUrlKey}`);
          return this.__getProductsByUrlKey(
            productUrlKey,
            this.parameters
          ).catch(error => {
            console.error(
              `Failed loading category ${productUrlKey}, got error ${JSON.stringify(
                error[0].message,
                null,
                0
              )}`
            );
            throw new Error(JSON.stringify(error));
          });
        })
      );
    };

    this.loader = new DataLoader(keys => loadingFunction(keys));
  }

  /**
   * Loads the product with the given url_key.
   *
   * @param {*} productUrlKey
   * @returns {Promise} A Promise with the product data.
   */
  loadMany(productUrlKey) {
    return this.loader.loadMany(productUrlKey);
  }

  /**
   * @param {String} productUrlKey The product url_key.
   * @param {String} Parameters contain the context
   * @returns {Promise} A Promise with the product data.
   */
  __getProductsByUrlKey(productUrlKey, parameters) {
    return new Promise((resolve, reject) => {
      const { defaultRequest } = parameters.actionParameters.context.settings;
      let request = { ...defaultRequest };
      let url_key = productUrlKey;
      request.data = {
        query: ProductQuery,
      };

      request.data.variables = {
        // eslint-disable-next-line no-useless-escape
        whereQuery: `masterData(current(slug(en=\"${url_key}\")))`,
      };

      TokenUtils.getOAuthClientBearer(
        parameters.actionParameters.context.settings
      ).then(token => {
        request.headers.Authorization = token;
        axios
          .request(request)
          .then(response => {
            if (!response.data.errors) {
              return resolve(response.data.data.products);
            }
            reject(response.data);
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  }
}

module.exports = ProductsLoader;
