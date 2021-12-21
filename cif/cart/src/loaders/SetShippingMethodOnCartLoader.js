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
const SetShippingMethodOnCartMutation = require('../graphql/setShippingMethod.graphql');

class SetShippingMethodOnCartLoader {
  /**
   * @param {Object} parameters parameter object contains the input, graphqlContext & actionParameters
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional actionParameters of the I/O Runtime action, like for example bearer token, query and url info.
   */
  constructor(parameters) {
    this.graphqlContext = parameters.graphqlContext;
    this.actionParameters = parameters.actionParameters;
    this.version = 0;
    let loadingFunction = inputs => {
      return Promise.resolve(
        inputs.map(input => {
          return this._setShippingMethodOnCart(
            input,
            this.version,
            this.graphqlContext,
            this.actionParameters
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
   * @param {*} version parameter contains the version number
   */
  load(input, version) {
    this.version = version;
    return this.loader.load(input);
  }

  /**
   * Method used to set shipping method on cart
   * @param {Object} input parameter contains the cart ID and shipping method details.
   * @param {Object} version parameter contains the version number.
   * @param {Object} graphqlContext The optional GraphQL execution context passed to the resolver.
   * @returns {Promise} a promise resolves and return the shipping method of cart.
   */
  _setShippingMethodOnCart(input, version, graphqlContext) {
    return new Promise((resolve, reject) => {
      const { defaultRequest } = graphqlContext.settings;
      const { method_code } = input.shipping_methods[0];
      let request = { ...defaultRequest };
      let uid = input.cart_id;
      request.data = {
        query: SetShippingMethodOnCartMutation,
        variables: {
          uid,
          version,
          id: method_code,
        },
      };
      axios
        .request(request)
        .then(response => {
          if (!response.data.errors) {
            return resolve(response.data.data.updateCart);
          }
          reject(response.data.errors[0].message);
        })
        .catch(error => {
          reject(JSON.stringify(error));
        });
    });
  }
}

module.exports = SetShippingMethodOnCartLoader;
