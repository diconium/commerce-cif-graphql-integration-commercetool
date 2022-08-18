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

const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
const nock = require('nock');
const assert = require('chai').assert;
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);
const resolve = require('../../src/resolvers/cartResolver.js').main;
const commerceAddLineItemToCartResponse = require('../resources/ctAddLineItemToCartResponse.json');
const mAddProductToCartResponse = require('../resources/mAddProductToCartResponse.json');
const commerceVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');
const commerceInvalidVersionIdResponse = require('../resources/ctInvalidVersionIdResponse.json');
const commerceInvalidCartIdResponse = require('../resources/ctInvalidCartIdResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const VersionCartQuery = require('../../src/graphql/version.grapql.js');
const LineItemToCartMutation = require('../../src/graphql/lineItemCart.graphql.js');

describe('addProductToCart', function() {
  const scope = nock('https://api.commercetools.example.com', {
    reqheaders: {
      Authorization: TestUtils.getContextData().context.settings.defaultRequest
        .headers.Authorization,
    },
  });

  before(() => {
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  describe('Unit Tests', () => {
    let args = TestUtils.getContextData();

    it('Mutation: validate response should return new line item for carts', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
          },
        })
        .reply(200, commerceVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: LineItemToCartMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            actions: {
              addLineItem: {
                sku: 'A0E2000000022N9',
                quantity: 1,
              },
            },
          },
        })
        .reply(200, commerceAddLineItemToCartResponse);

      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-728326003259',
        cartItems: [
          {
            sku: 'A0E2000000022N9',
            selected_options: [],
            quantity: 1,
          },
        ],
      };

      args.query =
        'mutation($cartId:String!$cartItems:[CartItemInput!]!){addProductsToCart(cartId:$cartId cartItems:$cartItems){cart{id items{uid quantity product{sku name thumbnail{url __typename}__typename}__typename}...MiniCartFragment __typename}__typename}}fragment MiniCartFragment on Cart{id total_quantity prices{subtotal_excluding_tax{currency value __typename}__typename}...ProductListFragment __typename}fragment ProductListFragment on Cart{id items{id product{id name url_key url_suffix thumbnail{url __typename}stock_status ...on ConfigurableProduct{variants{attributes{uid __typename}product{id thumbnail{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ...on ConfigurableCartItem{configurable_options{id option_label value_id value_label __typename}__typename}__typename}__typename}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mAddProductToCartResponse.data);
      });
    });

    it('Mutation: validate response should return invalid version id', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
          },
        })
        .reply(200, commerceInvalidVersionIdResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: LineItemToCartMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            actions: {
              addLineItem: {
                sku: 'A0E2000000022N9',
                quantity: 2,
              },
            },
          },
        })
        .reply(200, commerceAddLineItemToCartResponse);
      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-728326003259',
        cartItems: [
          {
            sku: 'A0E2000000022N9',
            quantity: 2,
          },
        ],
      };

      args.query =
        'mutation($cartId:String!$cartItems:[CartItemInput!]!){addProductsToCart(cartId:$cartId cartItems:$cartItems){cart{id items{uid quantity product{sku name thumbnail{url __typename}__typename}__typename}...MiniCartFragment __typename}__typename}}fragment MiniCartFragment on Cart{id total_quantity prices{subtotal_excluding_tax{currency value __typename}__typename}...ProductListFragment __typename}fragment ProductListFragment on Cart{id items{id product{id name url_key url_suffix thumbnail{url __typename}stock_status ...on ConfigurableProduct{variants{attributes{uid __typename}product{id thumbnail{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ...on ConfigurableCartItem{configurable_options{id option_label value_id value_label __typename}__typename}__typename}__typename}';

      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            'Object 03bdd6d9-ede2-495c-8ed8-728326003259 has a different version than expected. Expected: 16 - Actual: 22.',
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });

    it('Mutation: validate response should return invalid cart id', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-072832600325',
          },
        })
        .reply(200, commerceVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: LineItemToCartMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-072832600325',
            version: 106,
            actions: {
              addLineItem: {
                sku: 'A0E2000000022N9',
                quantity: 2,
              },
            },
          },
        })
        .reply(200, commerceInvalidCartIdResponse);
      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-072832600325',
        cartItems: [
          {
            sku: 'A0E2000000022N9',
            quantity: 2,
          },
        ],
      };

      args.query =
        'mutation($cartId:String!$cartItems:[CartItemInput!]!){addProductsToCart(cartId:$cartId cartItems:$cartItems){cart{id items{uid quantity product{sku name thumbnail{url __typename}__typename}__typename}...MiniCartFragment __typename}__typename}}fragment MiniCartFragment on Cart{id total_quantity prices{subtotal_excluding_tax{currency value __typename}__typename}...ProductListFragment __typename}fragment ProductListFragment on Cart{id items{id product{id name url_key url_suffix thumbnail{url __typename}stock_status ...on ConfigurableProduct{variants{attributes{uid __typename}product{id thumbnail{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ...on ConfigurableCartItem{configurable_options{id option_label value_id value_label __typename}__typename}__typename}__typename}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            "The Cart with ID '03bdd6d9-ede2-495c-8ed8-072832600325' was not found.",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
