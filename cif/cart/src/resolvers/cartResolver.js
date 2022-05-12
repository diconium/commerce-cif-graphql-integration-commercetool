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

const { graphql } = require('graphql');
const SchemaBuilder = require('../../../common/SchemaBuilder.js');
const CreateEmptyCart = require('../actions/CreateEmptyCart.js');
const LineItemToCart = require('../actions/LineItemToCart.js');
const SetShippingAddressOnCart = require('../actions/SetShippingAddressOnCart.js');
const SetBillingAddressOnCart = require('../actions/SetBillingAddressOnCart.js');
const Cart = require('../actions/Cart.js');
const SetPaymentMethodOnCart = require('../actions/SetPaymentMethodOnCart.js');
const SetShippingMethodOnCart = require('../actions/SetShippingMethodOnCart.js');
const ApplyCouponToCart = require('../actions/ApplyCouponToCart.js');
const ApplyGiftCardToCart = require('../actions/ApplyGiftCardToCart.js');
const PlaceOrder = require('../actions/PlaceOrder.js');
const CustomerCart = require('../actions/CustomerCart.js');
const RemoveCouponToCart = require('../actions/RemoveCouponToCart.js');

let cachedSchema = null;

/**
 * Create cart resolver
 * @param args
 * @returns {Promise<ExecutionResult<ExecutionResultDataDefault>>}
 */
function resolve(args) {
  if (cachedSchema == null) {
    let schemaBuilder = new SchemaBuilder()
      .filterMutationFields(
        new Set([
          'createEmptyCart',
          'addSimpleProductsToCart',
          'setShippingAddressesOnCart',
          'setBillingAddressOnCart',
          'setPaymentMethodOnCart',
          'setShippingMethodsOnCart',
          'applyCouponToCart',
          'removeCouponFromCart',
          'placeOrder',
          'updateCartItems',
          'removeItemFromCart',
          'mergeCarts',
          'applyGiftCardToCart',
          'addProductsToCart',
        ])
      )
      .filterQueryFields(new Set(['cart', 'customerCart']));
    cachedSchema = schemaBuilder.build();
  }

  // Builds the resolvers object
  let resolvers = {
    /**
     * method used to create empty cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     */
    createEmptyCart: () => {
      const createEmptyCartResolver = new CreateEmptyCart({
        actionParameters: args,
      });
      return createEmptyCartResolver.createEmptyCart.then(cart => cart);
    },
    /**
     * method used to get the cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    cart: (params, context) => {
      return new Cart({
        cartId: params.cart_id,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to get the customer cart
     * @param {Object} params parameter contains input,cart id,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    customerCart: (params, context) => {
      return new CustomerCart({
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to add product to cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    addSimpleProductsToCart: (params, context) => {
      const { input } = params;
      return new LineItemToCart({
        input,
        graphqlContext: context,
        actionParameters: params,
      });
    },
    /**
     * method used to add product to cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    addProductsToCart: (params, context) => {
      const input = params;
      return new LineItemToCart({
        input,
        graphqlContext: context,
        actionParameters: params,
      });
    },
    /**
     * method used to update product to cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    updateCartItems: (params, context) => {
      const { input } = params;
      return new LineItemToCart({
        input,
        graphqlContext: context,
        actionParameters: params,
      });
    },
    /**
     * method used to remove product to cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    removeItemFromCart: (params, context) => {
      const { input } = params;
      return new LineItemToCart({
        input,
        graphqlContext: context,
        actionParameters: params,
      });
    },
    /**
     * method used to set Shipping address on cart
     * @param {Object} params parameter contains input,shippingAddress,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    setShippingAddressesOnCart: (params, context) => {
      return new SetShippingAddressOnCart({
        input: params.input,
        shippingAddress: params.input.shipping_addresses,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to set billing address on cart
     * @param {Object} params parameter contains input,billingAddress,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    setBillingAddressOnCart: (params, context) => {
      return new SetBillingAddressOnCart({
        input: params.input,
        billingAddress: params.input.billing_address,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to set payment method to cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    setPaymentMethodOnCart: (params, context) => {
      return new SetPaymentMethodOnCart({
        input: params.input,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to set the shipping method to cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {Object} context parameter contains the context of the GraphQL Schema
     */
    setShippingMethodsOnCart: (params, context) => {
      return new SetShippingMethodOnCart({
        input: params.input,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to apply coupon to cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {Object} context parameter contains the context of the GraphQL Schema
     */
    applyCouponToCart: (params, context) => {
      const { input } = params;
      return new ApplyCouponToCart({
        input,
        couponCode: params.input.coupon_code,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to remove coupon to cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {Object} context parameter contains the context of the GraphQL Schema
     */
    removeCouponFromCart: (params, context) => {
      const { input } = params;
      return new RemoveCouponToCart({
        input,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to apply gift Card to cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {Object} context parameter contains the context of the GraphQL Schema
     */
    applyGiftCardToCart: (params, context) => {
      const { input } = params;
      return new ApplyGiftCardToCart({
        input,
        couponCode: params.input.gift_card_code,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to place the order to cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {Object} context parameter contains the context of the GraphQL Schema
     */
    placeOrder: (params, context) => {
      return new PlaceOrder({
        input: params.input,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to get the cart
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    mergeCarts: (params, context) => {
      return new Cart({
        cartId: params,
        graphqlContext: context,
        actionParameters: args,
      });
    },
  };

  /**
   * The resolver for this action
   * @param {cachedSchema} cachedSchema parameter contains the catched schema of GraphQL
   * @param {Object} query parameter contains the query of GraphQL
   * @param {cachedSchema} resolvers parameter resolvers of the particular action
   * @param {Object} context parameter contains the context of GraphQL
   * @param {cachedSchema} variables parameter contains the variables of GraphQL
   * @param {Object} operationName parameter contains the operationName of GraphQL context.
   * @returns {Promise} a promise resolves and return the response.
   */
  return graphql(
    cachedSchema,
    args.query,
    resolvers,
    args.context,
    args.variables,
    args.operationName
  )
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error(error);
    });
}

module.exports.main = resolve;
