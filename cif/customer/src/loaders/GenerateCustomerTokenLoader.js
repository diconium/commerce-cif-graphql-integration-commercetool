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
const qs = require('querystring');
class GenerateCustomerTokenLoader {
  /**
   * @param {Object} [actionParameters] Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   */
  constructor(actionParameters) {
    // The loading function: "input" is an Array of parameters
    let loadingFunction = inputs => {
      return Promise.resolve(
        inputs.map(input => {
          // This loader loads each inputs one by one, but if the 3rd party backend allows it,
          // it could also fetch all inputs in one single request. In this case, the method
          // must still return an Array of inputs with the same order as the input.
          return this._generateCustomerToken(input, actionParameters).catch(
            error => {
              throw new Error(error.message);
            }
          );
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
   * method used to get the access token from CT
   * In a real 3rd-party integration, this method would query the 3rd-party system
   * for example to simulate some HTTP REST call being performed to the 3rd-party commerce system.
   * @param {Object} input  parameter contains like email, password
   * @param {Object} actionParameters Some parameters of the I/O action itself (e.g. backend server URL, authentication info, etc)
   * @returns {Promise} return access token if promise resolves successfully otherwise return error
   */
  _generateCustomerToken(actionParameters, input) {
    return new Promise((resolve, reject) => {
      const { email, password } = input;
      const {
        CT_PROTOCOL,
        CT_AUTH_HOST,
        CT_CLIENTID,
        CT_CLIENTSECRET,
        CT_CUSTOMER_OAUTH_PATH,
      } = actionParameters.context.settings;
      let authUrl = `${CT_PROTOCOL}://${CT_AUTH_HOST}${CT_CUSTOMER_OAUTH_PATH}`;
      let config = {
        auth: {
          username: CT_CLIENTID,
          password: CT_CLIENTSECRET,
        },
        params: {
          grant_type: 'password',
          username: email,
          password: password,
          scope: 'manage_project:CT_INSTANCE_PROJECT',
        },
      };
      const request = {
        url: authUrl,
        method: 'POST',
        auth: config.auth,
        data: qs.stringify(config.params),
      };

      axios
        .request(request)
        .then(response => {
          resolve(response.data.access_token);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

/**
 * @type {GenerateCustomerTokenLoader}
 */
module.exports = GenerateCustomerTokenLoader;
