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
const ctCartResponse = require('../resources/ctCartResponse.json');
const mCartResponse = require('../resources/mCartResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const GetCartQuery = require('../../src/graphql/cart.graphql');
const ctCartInvalidCartIdResponse = require('../resources/ctCartInvalidCartIdResponse.json');
const mCartInvalidCartIdResponse = require('../resources/mCartInvalidCartIdResponse.json');

describe('getCart', function() {
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

    it('Query: validate response should get the carts', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCartQuery,
          variables: {
            cartId: '757dbca6-b3da-4909-98c3-f8d5099bfb94',
          },
        })
        .reply(200, ctCartResponse);

      args.variables = {
        cartId: '757dbca6-b3da-4909-98c3-f8d5099bfb94',
      };
      args.query =
        'query cartDetails($cartId:String!){cart(cart_id:$cartId){id is_virtual prices{discounts{amount{currency value __typename}label __typename}applied_taxes{amount{currency value __typename}label __typename}subtotal_with_discount_excluding_tax{currency value __typename}subtotal_excluding_tax{currency value __typename}subtotal_including_tax{currency value __typename}grand_total{currency value __typename}__typename}email shipping_addresses{city company country{code __typename}firstname lastname postcode region{code __typename}street telephone available_shipping_methods{method_code method_title carrier_code carrier_title __typename}selected_shipping_method{carrier_code carrier_title method_code method_title __typename}__typename}available_payment_methods{code title __typename}selected_payment_method{code title __typename}billing_address{city country{code __typename}lastname firstname region{code __typename}street postcode telephone __typename}applied_coupon{code __typename}total_quantity items{__typename uid quantity prices{price{currency value __typename}row_total{currency value __typename}__typename}product{name sku thumbnail{url __typename}__typename}...on BundleCartItem{bundle_options{id label type values{id label price quantity __typename}__typename}__typename}}__typename}}';
      return resolve(args).then(result => {
        console.log(result);
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mCartResponse.data);
      });
    });

    it('Query: validate response should get the empty cart', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCartQuery,
          variables: {
            cartId: '757dbca6-b3da-4909-98c3-f8d5099bfb9',
          },
        })
        .reply(200, ctCartInvalidCartIdResponse);

      args.variables = {
        cartId: '757dbca6-b3da-4909-98c3-f8d5099bfb9',
      };
      args.query =
        'query cartDetails($cartId:String!){cart(cart_id:$cartId){id is_virtual prices{discounts{amount{currency value __typename}label __typename}applied_taxes{amount{currency value __typename}label __typename}subtotal_with_discount_excluding_tax{currency value __typename}subtotal_excluding_tax{currency value __typename}subtotal_including_tax{currency value __typename}grand_total{currency value __typename}__typename}email shipping_addresses{city company country{code __typename}firstname lastname postcode region{code __typename}street telephone available_shipping_methods{method_code method_title carrier_code carrier_title __typename}selected_shipping_method{carrier_code carrier_title method_code method_title __typename}__typename}available_payment_methods{code title __typename}selected_payment_method{code title __typename}billing_address{city country{code __typename}lastname firstname region{code __typename}street postcode telephone __typename}applied_coupon{code __typename}total_quantity items{__typename uid quantity prices{price{currency value __typename}row_total{currency value __typename}__typename}product{name sku thumbnail{url __typename}__typename}...on BundleCartItem{bundle_options{id label type values{id label price quantity __typename}__typename}__typename}}__typename}}';
      return resolve(args).then(result => {
        const response = result.data;
        expect(response).to.deep.equals(mCartInvalidCartIdResponse.data);
      });
    });
  });
});
