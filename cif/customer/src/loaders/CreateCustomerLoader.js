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
const CreateCustomerMutation = require('../graphql/createCustomer.graphql');
const TokenUtils = require('../../../common/TokenUtils');

class CreateCustomerLoader {
  /**
   * @param {Object} [actionParameters] parameter object contains the bearer and host details
   */
  constructor(actionParameters) {
    let loadingFunction = keys => {
      return Promise.resolve(
        keys.map(key => {
          return this._createCustomer(key, actionParameters).catch(error => {
            throw new Error(error[0].message);
          });
        })
      );
    };
    this.loader = new DataLoader(keys => loadingFunction(keys));
  }

  /**
   * method used to call the loadingFunction using dataloader
   * @param {*} input parameter contains the customer details like firstname, lastname, email,  password details
   * @returns {Promise} a promise return cart Id after resolved successfully other wise return the error.
   */
  load(input) {
    return this.loader.load(input);
  }

  /**
   * method used to call commerce GraphQL create customer endpoint to create new customer.
   * @param {Object} input parameter contains the customer details like firstname, lastname, email, password details.
   * @param {Object} actionParameters contains the product details, cart version and host details.
   * @returns {Promise} a promise resolves and return newely created customer.
   */
  _createCustomer(input, actionParameters) {
    return new Promise((resolve, reject) => {
      const { defaultRequest } = actionParameters.context.settings;
      const {
        firstname: firstName,
        lastname: lastName,
        email,
        password,
      } = input;
      let request = { ...defaultRequest };

      request.data = {
        query: CreateCustomerMutation,
        variables: {
          email,
          password,
          firstName,
          lastName,
        },
      };
      TokenUtils.getOAuthClientBearer(actionParameters.context.settings).then(
        token => {
          request.headers.Authorization = token;
          axios
            .request(request)
            .then(response => {
              if (!response.data.errors) {
                return resolve(response.data.data.customerSignUp.customer);
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

module.exports = CreateCustomerLoader;
