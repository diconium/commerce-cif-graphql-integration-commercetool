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

const LoaderProxy = require('../../../common/LoaderProxy.js');
const CartInterface = require('../Interface/CartInterface.js');
const SetBillingAddressOnCartLoader = require('../loaders/SetBillingAddressOnCartLoader.js');
const VersionLoader = require('../loaders/VersionLoader.js');

class SetBillingAddressOnCart {
  /**
   * @param {Object} parameters parameter object contains the input,billingAddress,graphqlContext & actionParameters
   * @param {String} parameters.input parameter contains the cartId
   * @param {Object} parameters.billingAddress parameter contains the billingaddress details
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   */
  constructor(parameters) {
    this.input = parameters.input;
    this.billingAddresses = parameters.billingAddress;
    this.graphqlContext = parameters.graphqlContext;
    this.actionParameters = parameters.actionParameters;
    this.setBillingAddressOnCartLoader = new SetBillingAddressOnCartLoader(
      parameters
    );
    this._versionLoader = new VersionLoader(parameters);
    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  /**
   * method used to initially call the versionLoader to get version number
   *  then call the load method from setBillingAddressOnCartLoader loader class
   */
  __load() {
    return this._versionLoader.load(this.input).then(version => {
      return this.setBillingAddressOnCartLoader.load(
        this.input.cart_id,
        version
      );
    });
  }

  /**
   * Converts billing Address data from the 3rd-party commerce system into the Magento GraphQL format.
   * @param {Object} data parameter data contains billingAddress details from commerce
   * @returns {Object} convert the commerce data into magento graphQL schema and return the billingAddresss object
   */
  __convertData(data) {
    return { cart: new CartInterface(data).value };
  }
}

module.exports = SetBillingAddressOnCart;
