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
const CartLoader = require('./../loaders/CartLoader.js');
const CartInterface = require('../Interface/CartInterface.js');
// const ShippingMethodsLoader = require('./.ShippingMethodsLoader.js');

class Cart {
  /**
   * @param {Object} parameters parameter object contains the cartId, couponCode, graphqlContext & actionParameters
   * @param {String} parameters.cartId parameter contain cart Id
   * @param {String} parameters.couponCode parameter contain couponCode
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example authentication info.
   */
  constructor(parameters) {
    this.cartId = parameters.cartId;
    this.parameters = parameters;
    this.graphqlContext = parameters.graphqlContext;
    this.actionParameters = parameters.actionParameters;
    this.cartLoader = new CartLoader(parameters.graphqlContext);

    // this.shippingMethodsLoader = new ShippingMethodsLoader(
    //   parameters.actionParameters
    // );
    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  /**
   * @returns {Promise<T>}
   * @private
   */
  __load() {
    console.debug(`Loading cart for ${this.cartId}`);
    return this.cartLoader.load(this.cartId);
  }

  /**
   * @param deliveryModes
   * @returns {[]}
   */
  /**
   * Converts data from the 3rd-party commerce system into the Magento GraphQL format.
   * @param {Object} data parameter data contains the cart entries
   * @returns {Object} The backend cart data converted into a GraphQL "Cart" data.
   */
  __convertData(data) {
    return new CartInterface(data).value;
  }
}

module.exports = Cart;
