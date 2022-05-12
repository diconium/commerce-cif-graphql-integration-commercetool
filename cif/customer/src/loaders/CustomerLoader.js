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
const GetCustomerQuery = require('../graphql/getCustomer.graphql');

class CustomerLoader {
  /**
   * @param {Object} [actionParameters] Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   * @param {Object} [graphqlContext] The optional GraphQL execution context.
   */
  constructor(actionParameters) {
    // The loading function: "input" is an Array of parameters
    let loadingFunction = keys => {
      return Promise.resolve(
        keys.map(key => {
          console.debug(`--> Fetching customer with id ${key}`);
          return this.getCustomer(actionParameters).catch(error => {
            console.error(
              `Failed loading customer ${key}, got error ${JSON.stringify(
                error,
                null,
                0
              )}`
            );
            return null;
          });
        })
      );
    };

    this.loader = new DataLoader(keys => loadingFunction(keys));
  }

  /**
   * method used to call the loadingFunction using dataloader
   * @param {*} input parameter input
   * @returns {Promise} a promise return access token after resolved successfully other wise return the error.
   */
  load(input) {
    return this.loader.load(input);
  }

  /**
   * method used to get the customer Id from CT
   * In a real 3rd-party integration, this method would query the 3rd-party system
   * for example to simulate some HTTP REST call being performed to the 3rd-party commerce system.
   * @param {Object} actionParameters Some parameters of the I/O action itself (e.g. backend server URL, authentication info, etc)
   * @returns {Promise} return access token and customer id as token if promise resolves successfully otherwise return error
   */
  getCustomer(actionParameters) {
    return new Promise((resolve, reject) => {
      let orderNumber =
        actionParameters.variables &&
        actionParameters.variables.filter &&
        actionParameters.variables.filter.number &&
        actionParameters.variables.filter.number.match
          ? actionParameters.variables.filter.number.match
          : undefined;
      const { defaultRequest } = actionParameters.context.settings;
      let request = { ...defaultRequest };

      if (orderNumber === undefined || orderNumber === '') {
        request.data = {
          query: GetCustomerQuery,
        };
      } else {
        request.data = {
          query: GetCustomerQuery,
          variables: {
            // eslint-disable-next-line no-useless-escape
            where: `orderNumber=\"${orderNumber}\"`, //To Fetch searched customer order number details
          },
        };
      }
      axios
        .request(request)
        .then(response => {
          resolve(response.data.data.me);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

/**
 * @type {CustomerLoader}
 */
module.exports = CustomerLoader;
