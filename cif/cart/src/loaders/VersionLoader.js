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
const VersionCartQuery = require('../graphql/version.grapql');

class VersionLoader {
  /**
   * @param {Object} parameters parameters object contains the input, graphqlContext
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   */
  constructor(parameters) {
    this.graphqlContext = parameters.graphqlContext;

    let loadingFunction = inputs => {
      return Promise.resolve(
        inputs.map(input => {
          return this._addLineItemToCart(
            input.cart_id,
            this.graphqlContext
          ).catch(error => {
            throw new Error(error);
          });
        })
      );
    };
    this.loader = new DataLoader(keys => loadingFunction(keys));
  }

  /**
   * method used to call the loadingFunction using dataloader
   * @param {*} input parameter contains the cart id
   */
  load(input) {
    return this.loader.load(input);
  }

  /**
   * @param {String} cartID consists of cart id to be added to the specified cart.
   * @param {Object} graphqlContext contains the product details, cart version and host details
   * @returns {Promise} promise resolves and return version number.
   */
  _addLineItemToCart(cartID, graphqlContext) {
    return new Promise((resolve, reject) => {
      const { defaultRequest } = graphqlContext.settings;
      let request = { ...defaultRequest };
      let uid = cartID;

      request.data = {
        query: VersionCartQuery,
        variables: {
          uid,
        },
      };

      axios
        .request(request)
        .then(response => {
          if (!response.data.errors) {
            return resolve(response.data.data.cart.version);
          }
          reject(response.data.errors[0].message);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = VersionLoader;
