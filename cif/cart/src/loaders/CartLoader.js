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
const GetCartQuery = require('../graphql/cart.graphql');
const GetCustomerCartQuery = require('../graphql/customerCart.graphql');

class CartLoader {
  /**
   * @param {Object} [graphqlContext] Some optional parameters of the I/O Runtime action, like for example authentication info.
   */
  constructor(graphqlContext) {
    let loadingFunction = cartIds => {
      /**
       * This loader loads each cart one by one, but if the 3rd party backend allows it,
       *it could also fetch all carts in one single request. In this case, the method
       *must still return an Array of carts with the same order as the keys.
       */
      return Promise.resolve(
        cartIds.map(cartId => {
          console.debug(`--> Fetching cart with id ${cartId}`);
          return this.__getCartById(cartId, graphqlContext).catch(error => {
            console.error(
              `Failed loading cart ${cartId}, got error ${JSON.stringify(
                error,
                null,
                0
              )}`
            );
            throw new Error(error[0].message);
          });
        })
      );
    };

    this.loader = new DataLoader(keys => loadingFunction(keys));
  }

  /**
   * Loads the cart with the given cartId.
   * @param {*} cartId parameter contains the cart Id
   * @returns {Promise}return he cart data if promise resolves successfully other wise return error.
   */
  load(cartId) {
    return this.loader.load(cartId);
  }

  /**
   * In a real 3rd-party integration, this method would query the 3rd-party system
   * in order to fetch a cart based on the cart id. This method returns a Promise,
   * for example to simulate some HTTP REST call being performed to the 3rd-party commerce system.
   * @param {String} cartId The cart id.
   * @param {Object} graphqlContext Some parameters of the I/O action itself (e.g. backend server URL, authentication info, etc)
   * @returns {Promise} A Promise with the cart data.
   */
  __getCartById(cartId, graphqlContext) {
    return new Promise((resolve, reject) => {
      const { defaultRequest } = graphqlContext.settings;
      let request = { ...defaultRequest };

      if (cartId.destination_cart_id != undefined) {
        const { destination_cart_id } = cartId;
        request.data = {
          query: GetCartQuery,
          variables: {
            cartId: destination_cart_id,
          },
        };
      } else
        request.data = {
          query: cartId ? GetCartQuery : GetCustomerCartQuery,
          variables: {
            cartId,
          },
        };

      axios
        .request(request)
        .then(response => {
          if (!response.data.errors) {
            resolve(response.data.data);
          }
          reject(response.data.errors);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = CartLoader;
