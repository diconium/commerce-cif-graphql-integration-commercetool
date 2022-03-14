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
const GetCustomerCartQuery = require('../graphql/customerCart.graphql');

class CustomerCartLoader {
  /**
   * @param {Object} [actionParameters] Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   */
  constructor(actionParameters) {
    // The loading function: "input" is an Array of parameters
    let loadingFunction = inputs => {
      return Promise.resolve(
        inputs.map(input => {
          console.log(input);
          // This loader loads each inputs one by one, but if the 3rd party backend allows it,
          // it could also fetch all inputs in one single request. In this case, the method
          // must still return an Array of inputs with the same order as the input.
          return this._getCustomerCart(actionParameters).catch(error => {
            throw new Error(error.message);
          });
        })
      );
    };
    this.loader = new DataLoader(keys => loadingFunction(keys));
  }

  /**
   * method used to call the loadingFunction using dataloader
   * @param {*} input parameter input
   * @returns {Promise} a promise return cart id after resolved successfully other wise return the error.
   */
  load(input) {
    return this.loader.load(input);
  }

  /**
   * Method used to get the cart id from commercetools
   * @param input
   * @param actionParameters
   * @returns {Promise<unknown>}
   * @private
   */
  _getCustomerCart(actionParameters) {
    return new Promise((resolve, reject) => {
      const { defaultRequest } = actionParameters.context.settings;
      let request = { ...defaultRequest };
      request.data = {
        query: GetCustomerCartQuery,
      };

      axios
        .request(request)
        .then(response => {
          resolve(response.data.data.me.activeCart);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

/**
 * @type {CustomerCartLoader}
 */
module.exports = CustomerCartLoader;
