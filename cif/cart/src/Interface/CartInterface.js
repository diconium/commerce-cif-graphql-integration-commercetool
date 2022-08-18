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

const CartItemInterface = require('./CartItemInterface.js');
const Address = require('../../../customer/src/actions/Address.js');
const {
  AvailablePaymentMethods,
} = require('../loaders/CreatePaymentMethodLoader.js');

class CartInterface {
  /**
   * constructor of the CartInterface class
   * @param {*} props parameter contains the cart.
   */
  constructor(props, isLineItem) {
    this.data = props;
    this.isLineItem = isLineItem;
  }
  getSelectedMethod(paymentInfo) {
    if (!paymentInfo)
      return {
        code: 'free',
        title: 'Free',
      };
    const code = paymentInfo.payments[0].paymentMethodInfo.method;
    return {
      code,
      title: AvailablePaymentMethods[code].title,
    };
  }
  /**
   * Method used to return productinterface list  along with the cartid  and quantity
   */
  get value() {
    let { cart, shippingMethods } = this.data;
    if (!cart) {
      cart = { ...this.data };
    }
    //  const lineItems = this.isLineItem ? [cart.lineItems[0]] : cart.lineItems;
    const { items } = new CartItemInterface(cart.lineItems);
    return {
      id: cart.id,
      items,
      is_virtual: false,
      total_quantity: cart.lineItems.length,
      applied_coupons:
        cart.discountCodes && cart.discountCodes.length
          ? [
              {
                code: cart.discountCodes[0].discountCode.code,
              },
            ]
          : null,
      available_payment_methods: Object.values(AvailablePaymentMethods),
      selected_payment_method: this.getSelectedMethod(cart.paymentInfo),
      shipping_addresses: cart.shippingAddress
        ? this.getAddress(
            cart.shippingAddress,
            shippingMethods,
            cart.shippingInfo
          )
        : [],
      applied_gift_cards:
        cart.discountCodes && cart.discountCodes.length
          ? [
              {
                code: cart.discountCodes[0].discountCode.code,

                applied_balance: {
                  currency: cart.totalPrice.currencyCode,
                  value: cart.totalPrice.centAmount,
                },
                current_balance: {
                  currency: cart.totalPrice.currencyCode,
                  value: cart.totalPrice.centAmount,
                },
              },
            ]
          : [],
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
module.exports = CartInterface;
