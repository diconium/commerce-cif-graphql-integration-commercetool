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
const LineItemToCartLoader = require('../loaders/LineItemToCartLoader.js');
const VersionLoader = require('../loaders/VersionLoader.js');
const CartInterface = require('../Interface/CartInterface.js');
const CartLoader = require('../loaders/CartLoader.js');
class LineItemToCart {
  /**
   * @param {Object} parameters parameters object contains the input, graphqlContext & actionParameters
   * @param {Object} [parameters.input] contains the cart id, product ID and sku
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional actionParameters of the I/O Runtime action, like for example cartId, versionID, bearer token, query and product details.
   */
  constructor(parameters) {
    this.input = parameters.input;
    this.graphqlContext = parameters.graphqlContext;
    this.actionParameters = parameters.actionParameters;
    this.lineItemToCartLoader = new LineItemToCartLoader(parameters);
    this._versionLoader = new VersionLoader(parameters);

    this.cartLoader = new CartLoader(parameters.graphqlContext);
    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  /**
   * method used to initially call the versionLoader to get version number
   *  then call the load method from addLineItemToCartLoader loader class
   */
  __load() {
    return this._versionLoader.load(this.input).then(version => {
      return this.lineItemToCartLoader.load(this.input, version);
    });
  }

  /**
   * Converts data from the 3rd-party commerce system into the Magento GraphQL format.
   * @param {Object} data parameter data contains details of line item added to cart
   */
  __convertData(data) {
    return { cart: new CartInterface(data, true).value };
  }
}

module.exports = LineItemToCart;
