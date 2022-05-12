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

const VersionLoader = require('../loaders/VersionLoader.js');
const LoaderProxy = require('../../../common/LoaderProxy.js');
const ChangePasswordLoader = require('../loaders/ChangeCustomerPasswordLoader.js');

class ChangePassword {
  /**
   * @param {Object} parameters parameter object contains the input, graphqlContext, actionParameters & access token
   * @param {Object} [parameters.input] contains customer address details.
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   */
  constructor(parameters) {
    this.actionParameters = parameters.actionParameters;
    this.input = parameters.input;
    this.changePasswordLoader = new ChangePasswordLoader(
      parameters.actionParameters
    );
    this._versionLoader = new VersionLoader(parameters);

    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  /**
   * method used to call load method of getCustomerAddressIdLoader class
   */
  __load() {
    return this._versionLoader.load(this.input).then(version => {
      return this.changePasswordLoader.load(this.input, version);
    });
  }

  /**
   * method used to convert getCustomerAddressIdLoader CT data into magento GraphQL response
   * @param {*} data parameter data contains the generateCustomerAddressToken(AccessToken+CustomerAddressID) data
   */
  __convertData(data) {
    return {
      email: data.email,
    };
  }
}

/**
 * @type {ChangePassword}
 */
module.exports = ChangePassword;
