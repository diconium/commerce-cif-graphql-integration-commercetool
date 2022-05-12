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
const CustomerLoader = require('../loaders/CustomerLoader.js');
const Address = require('./Address.js');
const CustomerOrderItemInterface = require('../Interface/CustomerOrderItemInterface.js');

class Customer {
  /**
   * @param {Object} parameters parameter object contains the graphqlContext, actionParameters & access token
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   */
  constructor(parameters) {
    this.actionParameters = parameters.actionParameters;
    this.getCustomerLoader = new CustomerLoader(parameters.actionParameters);
    this.totalPage = this.actionParameters.variables.pageSize;
    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  /**
   * method used to call load method of getCustomerIdLoader class
   */
  __load() {
    return this.getCustomerLoader.load(this.actionParameters);
  }

  /**
   * method used to convert getCustomerIdLoader CT data into magento GraphQL response
   * @param {*} data parameter data contains the generateCustomerToken(AccessToken+CustomerID) data
   */
  __convertData(data) {
    const { customer, orders } = data;

    return {
      ...customer,
      id: 1,
      default_shipping: 1,
      default_billing: 1,

      addresses: customer.addresses.map((address, index) => {
        address.street = [address.street];
        address.default_shipping = index === 0;
        address.default_billing = index === 0;
        address.id = index;
        return new Address(address).address;
      }),

      orders: {
        items: orders.results.flatMap(order => {
          const {
            totalPrice,
            taxedPrice,
            shippingInfo,
            billingAddress,
            shippingAddress,
            lineItems,
          } = order;
          return {
            id: order.id,
            number: order.number,
            order_date: order.order_date,
            status: order.status,
            billing_address:
              billingAddress != undefined
                ? {
                    city: billingAddress.city,
                    country_code: billingAddress.country,
                    firstname: billingAddress.firstname,
                    lastname: billingAddress.lastname,
                    postcode: billingAddress.postcode,
                    region: billingAddress.region,
                    street: [billingAddress.streetName],
                    telephone: billingAddress.telephone,
                  }
                : {
                    city: shippingAddress.city,
                    country_code: shippingAddress.country,
                    firstname: shippingAddress.firstname,
                    lastname: shippingAddress.lastname,
                    postcode: shippingAddress.postcode,
                    region: shippingAddress.region,
                    street: [shippingAddress.streetName],
                    telephone: shippingAddress.telephone,
                  },
            invoices: [
              {
                id: order.id,
              },
            ],
            items: lineItems.map(product => {
              return new CustomerOrderItemInterface({
                id: product.productId,
                product_name: product.name,
                product_sale_price: {
                  currency: product.price.value.currencyCode,
                  value: product.price.value.centAmount,
                },
                product_sku: product.productId,
                product_url_key: product.slug,
                selected_options: [],
                quantity_ordered: product.quantity,
              });
            }),
            payment_methods: [
              {
                name: 'Free',
                type: 'free',
                additional_data: [],
              },
            ],
            shipping_address: {
              city: shippingAddress.city,
              country_code: shippingAddress.country,
              firstname: shippingAddress.firstname,
              lastname: shippingAddress.lastname,
              postcode: shippingAddress.postcode,
              region: shippingAddress.region,
              street: [shippingAddress.streetName],
              telephone: shippingAddress.telephone,
            },
            shipments: [],
            shipping_method: shippingInfo.shippingMethod.name,
            total: {
              discounts: [
                {
                  amount: {
                    currency: totalPrice.currencyCode,
                    value: 0,
                  },
                },
              ],
              grand_total: {
                currency: totalPrice.currencyCode,
                value: totalPrice.centAmount,
              },
              subtotal: {
                currency: taxedPrice.totalNet.currencyCode,
                value: taxedPrice.totalNet.centAmount,
              },
              total_shipping: {
                currency: shippingInfo.shippingRate.price.currencyCode,
                value: shippingInfo.shippingRate.price.centAmount,
              },
              total_tax: {
                currency: taxedPrice.taxPortions[0].amount.currencyCode,
                value: taxedPrice.taxPortions[0].amount.centAmount,
              },
            },
          };
        }),
        page_info: {
          current_page: 0,
          total_pages: this.totalPage,
        },
        total_count: orders.results.length,
      },
    };
  }
}

/**
 * @type {Customer}
 */
module.exports = Customer;
