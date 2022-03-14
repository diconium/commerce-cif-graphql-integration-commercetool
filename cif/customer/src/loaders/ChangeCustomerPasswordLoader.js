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
const CustomerChangeMyPasswordMutation = require('../graphql/changeCustomerPassword.graphql');

class ChangePasswordLoader {
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
          return this.__changePassword(
            key,
            this.version,
            actionParameters
          ).catch(error => {
            console.error(
              `Failed loading customer ${key}, got error ${JSON.stringify(
                error[0].message,
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
  load(input, version) {
    this.version = version;
    return this.loader.load(input);
  }

  /**
   * method used to change the cutomer password
   * In a real 3rd-party integration, this method would query the 3rd-party system
   * for example to simulate some HTTP REST call being performed to the 3rd-party commerce system.
   * @param {Object} input parameter contains the customers currentPassword and new password.
   * @param {Object} version parameter contains the version number
   * @param {Object} actionParameters Some parameters of the I/O action itself (e.g. backend server URL, authentication info, etc)
   * @returns {Promise} a promise resolves and return newely created customer password.
   */
  __changePassword(input, version, actionParameters) {
    return new Promise((resolve, reject) => {
      const { defaultRequest } = actionParameters.context.settings;
      let request = { ...defaultRequest };
      request.data = {
        query: CustomerChangeMyPasswordMutation,
        variables: {
          ...input,
          version,
        },
      };
      axios
        .request(request)
        .then(response => {
          if (!response.data.errors)
            return resolve(response.data.data.customerChangeMyPassword);
          reject(response.data.errors);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

/**
 * @type {ChangePasswordLoader}
 */
module.exports = ChangePasswordLoader;
