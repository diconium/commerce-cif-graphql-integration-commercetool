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
const UpdateCustomerMutation = require('../graphql/updateCustomer.graphql');

class UpdateCustomerLoader {
  /**
   * @param {Object} [actionParameters] parameter object contains the bearer and host details
   */
  constructor(actionParameters) {
    this.actionParameters = actionParameters;
    let loadingFunction = keys => {
      return Promise.resolve(
        keys.map(key => {
          return this._updateCustomer(
            key,
            this.version,
            this.id,
            actionParameters
          ).catch(error => {
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
   * @returns {Promise} a promise return updated Customer details after resolved successfully other wise return the error.
   */
  load(input, version, id) {
    this.id = id;
    this.version = version;
    return this.loader.load(input);
  }

  /**
   * method used to call commerce GraphQL update customer endpoint to update customer deatils.
   * @param {Object} input parameter contains the customer details like firstname, lastname, email, password details.
   * @param {Object} actionParameters Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   * @returns {Promise} a promise resolves and return updated customer details.
   */
  _updateCustomer(input, version, id, actionParameters) {
    return new Promise((resolve, reject) => {
      const { defaultRequest } = actionParameters.context.settings;
      const { firstname, lastname, email } = input;
      let request = { ...defaultRequest };

      request.data = {
        query: UpdateCustomerMutation,
        variables: {
          version,
          id,
          actions: [
            { setFirstName: { firstName: firstname } },
            { setLastName: { lastName: lastname } },
            { changeEmail: { email: email } },
          ],
        },
      };

      axios
        .request(request)
        .then(response => {
          if (!response.data.errors) {
            return resolve(response.data.data.updateCustomer);
          }
          reject(response.data.errors);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = UpdateCustomerLoader;
