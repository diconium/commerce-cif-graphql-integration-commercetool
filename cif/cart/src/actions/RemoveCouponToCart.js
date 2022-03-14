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
const CartLoader = require('../loaders/CartLoader.js');
const RemoveCouponToCartLoader = require('../loaders/RemoveCouponToCartLoader.js');
const VersionLoader = require('../loaders/VersionLoader.js');

class RemoveCouponToCart {
  /**
   * @param {Object} parameters parameter object contains the cartId,couponCode,graphqlContext & actionParameters
   * @param {String} parameters.input parameter contains the cartId and couponCode
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   */
  constructor(parameters) {
    this.input = parameters.input;
    this.graphqlContext = parameters.graphqlContext;
    this.actionParameters = parameters.actionParameters;
    this.removeCouponToCartLoader = new RemoveCouponToCartLoader(
      parameters.actionParameters
    );
    this._versionLoader = new VersionLoader(parameters);
    this.cartLoader = new CartLoader(parameters.graphqlContext);

    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  /**
   * Version number is mandatory in commercetools for updatecart..
   * method used to initially call the versionLoader to get version number
   * method used to call load method from removeCouponToCart loader class
   */
  __load() {
    return this._versionLoader.load(this.input).then(version => {
      return this.cartLoader.load(this.input.cart_id).then(data => {
        return this.removeCouponToCartLoader.load(
          this.input,
          version,
          data.cart.discountCodes[0].discountCode.id
        );
      });
    });
  }

  /**
   * Converts data from the 3rd-party commerce system into the Magento GraphQL format.
   * @param {Object} data parameter data contains details from commerce
   * @returns {Object} convert the commerce tool data into magento graphQL schema and return the object
   */
  __convertData(data) {
    return { cart: new CartInterface(data).value };
  }
}
module.exports = RemoveCouponToCart;
