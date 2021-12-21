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
const CartItemInterface = require('./../Interface/CartItemInterface.js');
const Address = require('../../../customer/src/actions/Address.js');
const ProductsLoader = require('../../../category/src/loaders/ProductsLoader.js');
const {
  AvailablePaymentMethods,
} = require('../loaders/CreatePaymentMethodLoader.js');
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
    this.cartLoader = new CartLoader(parameters.actionParameters);

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

    return this.cartLoader.load(this.cartId).then(async data => {
      await Promise.allSettled(
        data.cart.lineItems.map(async (item, index) => {
          const product = await new ProductsLoader(
            this.parameters
          ).load(item.slug, { url_key: { eq: item.slug } });
          data.cart.lineItems[index] = {
            ...item,
            thumbnail:
              product.results[0].masterData.current.masterVariant.images,
          };
        })
      );
      return data;
    });
  }

  /**
   * @param address
   * @returns {*|string}
   */
  getAvailablePaymentMethod() {
    let availablePayments = [];
    Object.keys(AvailablePaymentMethods).map(key => {
      availablePayments.push({ code: key, title: 'Test' });
    });
    return availablePayments;
  }

  /**
   * @param deliveryModes
   * @returns {[]}
   */

  getSelectedMethod(paymentInfo) {
    if (!paymentInfo) return null;
    const code = paymentInfo.payments[0].paymentMethodInfo.method;
    return {
      code,
      title: AvailablePaymentMethods[code].title,
    };
  }
  /**
   * @param {Object} data parameter data contains the cart entries
   * @returns {Object} The backend cart data converted into a GraphQL "Cart" data.
   */
  __convertData(data) {
    const { cart, shippingMethods } = data;

    // if (cart.activeCart) {
    //   return {
    //     id: cart.activeCart.id,
    //   };
    // }
    const { items } = new CartItemInterface(cart.lineItems);

    return {
      id: cart.id,
      items,
      is_virtual: false,
      total_quantity: cart.lineItems.length,
      available_payment_methods: Object.values(AvailablePaymentMethods),
      selected_payment_method: this.getSelectedMethod(cart.paymentInfo),
      shipping_addresses: cart.shippingAddress
        ? this.getAddress(
            cart.shippingAddress,
            shippingMethods,
            cart.shippingInfo
          )
        : [],
      applied_gift_cards: [],
      billing_address: cart.billingAddress
        ? this.getAddress(cart.billingAddress)[0]
        : null,
      available_shipping_methods: [],
      prices: {
        applied_taxes: [],
        subtotal_excluding_tax: {
          value: cart.totalPrice.centAmount,
          currency: cart.totalPrice.currencyCode,
        },
        subtotal_including_tax: {
          value: cart.totalPrice.centAmount,
          currency: cart.totalPrice.currencyCode,
        },
        grand_total: {
          value: cart.totalPrice.centAmount,
          currency: cart.totalPrice.currencyCode,
        },
        subtotal_with_discount_excluding_tax: {
          value: cart.totalPrice.centAmount,
          currency: cart.totalPrice.currencyCode,
        },
      },
    };
  }
  getAddress(address, shippingmethods, selectedShippingMethod) {
    address.country = {
      code: address.country,
      label: address.country,
    };
    return [
      new Address(address, shippingmethods, selectedShippingMethod).address,
    ];
  }
}

module.exports = Cart;
