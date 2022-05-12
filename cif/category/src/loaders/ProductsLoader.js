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
const ProductSearchQuery = require('../graphql/productsSearch.graphql');
class ProductsLoader {
  /**
   * @param {Object} parameters parameters object contains the graphqlContext & actionParameters
   * @param {Object} [actionParameters] Some optional parameters of the I/O Runtime action, like for example authentication info.
   */
  constructor(parameters) {
    this.parameters = parameters;
    // The loading function: "productIds" is an Array of category ids
    let loadingFunction = productIds => {
      // This loader loads each category one by one, but if the 3rd party backend allows it,
      // it could also fetch all products in one single request. In this case, the method
      // must still return an Array of products with the same order as the keys.

      return Promise.resolve(
        productIds.map(productId => {
          // console.debug(`--> Fetching category with id ${productId}`);
          return this.__getCategoryById(productId, this.parameters).catch(
            error => {
              console.error(
                `Failed loading category ${productId}, got error ${JSON.stringify(
                  error,
                  null,
                  0
                )}`
              );
              throw new Error(JSON.stringify(error));
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
        query: parameters.search ? ProductSearchQuery : ProductQuery,
        variables: {},
      };
      if (parameters.search) {
        request.data.variables = {
          locale: 'en',
          id: productId,
          search: parameters.search,
        };
      } else if (sku) {
        request.data.variables.skus = sku.eq ? [sku.eq] : sku.in;
      } else {
        request.data.variables.whereQuery = `masterData(current(${
          url_key
            ? //eslint-disable-next-line
            `slug(en=\"${url_key.eq}\")`
            : //eslint-disable-next-line
            `categories(id=\"${productId}\")`
        }))`;
      }

      if (!url_key && !sku) {
        request.data.variables.limit = parameters.limit || 20;
        request.data.variables.offset = parameters.offset || 1;
      }

      if (parameters.sort && parameters.sort.name && !parameters.search) {
        request.data.variables.sort = `masterData.current.name.en ${parameters.sort.name.toLowerCase()}`;
      }
      TokenUtils.getOAuthClientBearer(
        parameters.actionParameters.context.settings
      ).then(token => {
        request.headers.Authorization = token;
        axios
          .request(request)
          .then(response => {
            if (!response.data.errors) {
              if (parameters.search)
                return resolve(response.data.data.productProjectionSearch);
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
