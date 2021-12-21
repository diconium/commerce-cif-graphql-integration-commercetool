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
    // The loading function: "categoryIds" is an Array of category ids
    let loadingFunction = productIds => {
      // This loader loads each category one by one, but if the 3rd party backend allows it,
      // it could also fetch all categories in one single request. In this case, the method
      // must still return an Array of categories with the same order as the keys.

      return Promise.resolve(
        productIds.map(productId => {
          console.debug(`--> Fetching category with id ${productId}`);
          return this.__getCategoryById(productId, this.parameters).catch(
            error => {
              console.error(
                `Failed loading category ${productId}, got error ${JSON.stringify(
                  error,
                  null,
                  0
                )}`
              );
              return null;
            }
          );
        })
      );
    };

    this.loader = new DataLoader(keys => loadingFunction(keys));
  }

  /**
   * Loads the category with the given categoryId.
   *
   * @param {*} categoryId
   * @returns {Promise} A Promise with the category data.
   */
  load(productId, filters) {
    if (filters) this.parameters.filters = filters;
    return this.loader.load(productId);
  }

  /**
   * @param {String} productId The product id.
   * @param {String} Parameters contain the context
   * @returns {Promise} A Promise with the category data.
   */
  __getCategoryById(productId, parameters) {
    return new Promise((resolve, reject) => {
      const { defaultRequest } = parameters.actionParameters.context.settings;
      const { url_key, sku } = parameters.filters;
      let request = { ...defaultRequest };

      request.data = {
        query: ProductQuery,
        variables: {
          whereQuery: `masterData(current(${
            url_key
              ? //eslint-disable-next-line
              `slug(en=\"${url_key.eq}\")`
              : sku
              ? //eslint-disable-next-line
              `masterVariant(sku=\"${sku.eq}\")`
              : //eslint-disable-next-line
              `categories(id=\"${productId}\")`
          }))`,
        },
      };
      TokenUtils.getOAuthClientBearer(
        parameters.actionParameters.context.settings
      ).then(token => {
        request.headers.Authorization = token;
        axios
          .request(request)
          .then(response => {
            resolve(response.data.data.products);
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  }
}

module.exports = ProductsLoader;
