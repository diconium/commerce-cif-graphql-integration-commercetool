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

class Address {
  /**
   * constructor of the CartItemInterface class
   * @param {*} props parameter contains the cart items
   */
  constructor(address, shippingmethods, selectedShipping) {
    this.data = address;
    this.shippingMethods = shippingmethods;
    this.selectedShippingMethod = selectedShipping;
  }

  /**
   * Method used to return product details name and sku
   */
  get address() {
    return {
      ...this.data,
      street: [this.data.streetName],
      region: {
        region_id: this.data.region,
        label: this.data.region,
        code: this.data.region,
        region_code: this.data.region,
        region: this.data.region,
      },
      selected_shipping_method: this.selected_shipping_method,
      available_shipping_methods: this.available_shipping_methods,
    };
  }
  get selected_shipping_method() {
    if (!this.selectedShippingMethod) return null;
    return {
      carrier_code: this.selectedShippingMethod.shippingMethod.id,
      carrier_title: this.selectedShippingMethod.shippingMethod.name,
      error_message: '',
      method_code: this.selectedShippingMethod.shippingMethod.id,
      method_title: this.selectedShippingMethod.shippingMethod.name,
    };
  }
  get available_shipping_methods() {
    if (this.shippingMethods) {
      return this.shippingMethods.results.map(shippingMethod => {
        return {
          amount: {
            currency: 'EUR',
            value: 10,
          },
          available: true,
          carrier_code: shippingMethod.id,
          carrier_title: shippingMethod.name,
          error_message: '',
          method_code: shippingMethod.id,
          method_title: shippingMethod.name,
          price_excl_tax: {
            value: 10,
            currency: 'EUR',
          },
          price_incl_tax: {
            value: 10,
            currency: 'EUR',
          },
        };
      });
    } else {
      return [];
    }
  }
}
module.exports = Address;
