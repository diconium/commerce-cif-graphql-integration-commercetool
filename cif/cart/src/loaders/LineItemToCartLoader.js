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

const DataLoader = require('dataloader');
const axios = require('axios');
const LineItemToCartMutation = require('../graphql/lineItemCart.graphql');

class LineItemToCartLoader {
  /**
   * @param {Object} parameters parameters object contains the input, graphqlContext & actionParameters
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional actionParameters of the I/O Runtime action, like for example cartId, versionID, bearer token, query and product details.
   */
  constructor(parameters) {
    this.graphqlContext = parameters.graphqlContext;
    this.actionParameters = parameters.actionParameters;
    this.version = 0;
    let loadingFunction = inputs => {
      return Promise.resolve(
        inputs.map(input => {
          return this._addLineItemToCart(
            input,
            this.version,
            this.graphqlContext,
            this.actionParameters,
            input.custom
          ).catch(error => {
            throw new Error(error);
          });
        })
      );
    };
    this.loader = new DataLoader(keys => loadingFunction(keys));
  }

  /**
   * method used to call the loadingFunction using dataloader
   * @param {*} input parameter contains the cart id
   * @param {*} version parameter contains the version number
   */
  load(input, version) {
    this.version = version;
    return this.loader.load(input);
  }

  /**
   * @param {*} input consists of cart id to be added to the specified cart.
   * @param {*} version parameter contains the version number
   * @param {Object} actionParameters contains the product details, cart version and host details
   * @param {Object} graphqlContext contains the product details, cart version and host details
   * @returns {Promise} promise resolves and return newly added cart item details.
   */
  _addLineItemToCart(input, version, graphqlContext, actionParameters) {
    return new Promise((resolve, reject) => {
      let cartID = input.cart_id || input.cartId;
      const { defaultRequest } = graphqlContext.settings;
      let actions = {};
      if (
        actionParameters.input &&
        actionParameters.input.cart_items &&
        actionParameters.input.cart_items[0].cart_item_id
      ) {
        actions.removeLineItem = {
          lineItemId: actionParameters.input.cart_items[0].cart_item_id,
        }; //Remove Item to cart
      } else {
        let params =
          actionParameters.input &&
          actionParameters.input.cart_items != undefined
            ? actionParameters.input.cart_items
            : actionParameters.cartItems;
        // Add Item to cart if we addSimpleProductToCart mutation input
        if (params[0].data != undefined) {
          const { sku, quantity } = params[0].data;
          actions.addLineItem = { sku, quantity }; // Add Item to cart
        }
        // Add Item to cart if we addProductToCart mutation input
        else if (params[0].sku != undefined) {
          const { sku, quantity } = params[0];
          actions.addLineItem = { sku, quantity }; // Add Item to cart
        } else {
          const { cart_item_id: lineItemId, quantity } = params[0];
          actions.changeLineItemQuantity = { lineItemId, quantity }; //Update Item to cart
        }
      }

      let request = { ...defaultRequest };

      let uid = cartID;
      request.data = {
        query: LineItemToCartMutation,
        variables: {
          uid,
          version,
          actions,
        },
      };
      axios
        .request(request)
        .then(response => {
          if (!response.data.errors) {
            return resolve(response.data.data.updateCart);
          }
          reject(response.data.errors[0].message);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = LineItemToCartLoader;
