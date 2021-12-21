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
const SetBillingAddressMutation = require('../graphql/setBillingAddress.graphql');

class SetBillingAddressOnCartLoader {
  /**
   * @param {Object} parameters parameter object contains the cartId,billingAddress,graphqlContext & actionParameters
   * @param {Object} parameters.billingAddress parameter contains the billingaddress details
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   */
  constructor(parameters) {
    this.billingAddressObj = parameters.billingAddress;
    this.graphqlContext = parameters.graphqlContext;
    this.version = 0;
    let loadingFunction = inputs => {
      return Promise.resolve(
        inputs.map(input => {
          return this._setBillingAddressOnCart(
            input,
            this.version,
            this.billingAddressObj,
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
   * @param {*} version parameter contains the version number
   */
  load(input, version) {
    this.version = version;
    return this.loader.load(input);
  }

  /**
   * Method used to set billing address on cart
   * @param {Object} cartID parameter contains the cart ID details
   * @param {Object} version parameter contains the version number
   * @param {Object} billingAddressObj parameter contains the billingaddress details
   * @param {Object} graphqlContext The optional GraphQL execution context passed to the resolver.
   * @returns {Promise} a promise resolves and return new billing address of cart.
   */
  _setBillingAddressOnCart(cartID, version, billingAddressObj, graphqlContext) {
    return new Promise((resolve, reject) => {
      const { defaultRequest } = graphqlContext.settings;
      const {
        firstname: firstName,
        lastname: lastName,
        company,
        street,
        city,
        region,
        postcode: postalCode,
        country_code: country,
        telephone: phone,
      } = billingAddressObj.address;
      let request = { ...defaultRequest };
      let uid = cartID;
      request.data = {
        query: SetBillingAddressMutation,
        variables: {
          city,
          uid,
          version,
          firstName,
          lastName,
          company,
          streetName: street[0],
          region,
          postalCode,
          country,
          phone,
        },
      };

      axios
        .request(request)
        .then(response => {
          if (!response.data.errors) {
            return resolve(response.data.data.updateCart.billingAddress);
          }
          reject(response.data.errors[0].message);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = SetBillingAddressOnCartLoader;
