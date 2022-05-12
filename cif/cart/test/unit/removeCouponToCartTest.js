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
const nock = require('nock');
const chai = require('chai');
const assert = require('chai').assert;
const expect = require('chai').expect;
const resolve = require('../../src/resolvers/cartResolver.js').main;
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);
const TestUtils = require('../../../utils/TestUtils.js');
const VersionCartQuery = require('../../src/graphql/version.grapql.js');
const RemoveCouponToCartMutation = require('../../src/graphql/removeCouponToCart.graphql');
const ctRemoveCouponToCartResponse = require('../resources/ctRemoveCouponToCartResponse.json');
const mRemoveCouponToCartResponse = require('../resources/mRemoveCouponToCartResponse.json');
const GetCartQuery = require('../../src/graphql/cart.graphql');
const ctVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');
const ctCartResponse = require('../resources/ctCartResponse.json');
const ctInvalidVersionIdResponse = require('../resources/ctInvalidVersionIdResponse.json');
const ctInvalidCartIdResponse = require('../resources/ctInvalidCartIdResponse.json');
const ctRemoveCouponIdErrorResposne = require('../resources/ctRemoveCouponIdErrorResponse.json');

describe('RemoveCouponToCart', function() {
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

    it('Mutation: validate remove coupon to cart', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '65990889-bc81-46e1-b83c-83105715bd39',
          },
        })
        .reply(200, ctVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCartQuery,
          variables: {
            cartId: '65990889-bc81-46e1-b83c-83105715bd39',
          },
        })
        .reply(200, ctCartResponse);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: RemoveCouponToCartMutation,
          variables: {
            uid: '65990889-bc81-46e1-b83c-83105715bd39',
            version: 106,
            couponid: 'b372a64f-f6ed-4c1d-afca-ef4f14d3cf02',
          },
        })
        .reply(200, ctRemoveCouponToCartResponse);
      args.variables = {
        cartId: '65990889-bc81-46e1-b83c-83105715bd39',
      };
      args.query =
        'mutation removeCouponFromCart($cartId:String!){removeCouponFromCart(input:{cart_id:$cartId}){cart{id ...CartPageFragment available_payment_methods{code title __typename}__typename}__typename}}fragment CartPageFragment on Cart{id total_quantity ...AppliedCouponsFragment ...GiftCardFragment ...ProductListingFragment ...PriceSummaryFragment __typename}fragment AppliedCouponsFragment on Cart{id applied_coupons{code __typename}__typename}fragment GiftCardFragment on Cart{applied_gift_cards{code current_balance{currency value __typename}__typename}id __typename}fragment ProductListingFragment on Cart{id items{id product{id name sku url_key url_suffix thumbnail{url __typename}small_image{url __typename}stock_status ...on ConfigurableProduct{variants{attributes{uid __typename}product{id small_image{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ...on ConfigurableCartItem{configurable_options{id configurable_product_option_value_uid option_label value_id value_label __typename}__typename}__typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}';
      return resolve(args).then(result => {
        assert.isUndefined(result.errors);
        let response = result.data;
        expect(response).to.deep.equals(mRemoveCouponToCartResponse.data);
      });
    });

    it('Mutation: validate response should return invalid version number', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
          },
        })
        .reply(200, ctInvalidVersionIdResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCartQuery,
          variables: {
            cartId: '03bdd6d9-ede2-495c-8ed8-728326003259',
          },
        })
        .reply(200, ctCartResponse);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: RemoveCouponToCartMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            couponid: 'b372a64f-f6ed-4c1d-afca-ef4f14d3cf02',
          },
        })
        .reply(200, ctRemoveCouponToCartResponse);
      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-728326003259',
      };
      args.query =
        'mutation removeCouponFromCart($cartId:String!){removeCouponFromCart(input:{cart_id:$cartId}){cart{id ...CartPageFragment available_payment_methods{code title __typename}__typename}__typename}}fragment CartPageFragment on Cart{id total_quantity ...AppliedCouponsFragment ...GiftCardFragment ...ProductListingFragment ...PriceSummaryFragment __typename}fragment AppliedCouponsFragment on Cart{id applied_coupons{code __typename}__typename}fragment GiftCardFragment on Cart{applied_gift_cards{code current_balance{currency value __typename}__typename}id __typename}fragment ProductListingFragment on Cart{id items{id product{id name sku url_key url_suffix thumbnail{url __typename}small_image{url __typename}stock_status ...on ConfigurableProduct{variants{attributes{uid __typename}product{id small_image{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ...on ConfigurableCartItem{configurable_options{id configurable_product_option_value_uid option_label value_id value_label __typename}__typename}__typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}';
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

    it('Mutation: validate response should return the invalid cart id', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-072832600325',
          },
        })
        .reply(200, ctVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCartQuery,
          variables: {
            cartId: '03bdd6d9-ede2-495c-8ed8-072832600325',
          },
        })
        .reply(200, ctInvalidCartIdResponse);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: RemoveCouponToCartMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-072832600325',
            version: 106,
            couponid: 'b372a64f-f6ed-4c1d-afca-ef4f14d3cf02',
          },
        })
        .reply(200, ctRemoveCouponToCartResponse);
      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-072832600325',
      };
      args.query =
        'mutation removeCouponFromCart($cartId:String!){removeCouponFromCart(input:{cart_id:$cartId}){cart{id ...CartPageFragment available_payment_methods{code title __typename}__typename}__typename}}fragment CartPageFragment on Cart{id total_quantity ...AppliedCouponsFragment ...GiftCardFragment ...ProductListingFragment ...PriceSummaryFragment __typename}fragment AppliedCouponsFragment on Cart{id applied_coupons{code __typename}__typename}fragment GiftCardFragment on Cart{applied_gift_cards{code current_balance{currency value __typename}__typename}id __typename}fragment ProductListingFragment on Cart{id items{id product{id name sku url_key url_suffix thumbnail{url __typename}small_image{url __typename}stock_status ...on ConfigurableProduct{variants{attributes{uid __typename}product{id small_image{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ...on ConfigurableCartItem{configurable_options{id configurable_product_option_value_uid option_label value_id value_label __typename}__typename}__typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}';
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

    it('Mutation: validate response should return cannot remove discount code ', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '65990889-bc81-46e1-b83c-83105715bd39',
          },
        })
        .reply(200, ctVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCartQuery,
          variables: {
            cartId: '65990889-bc81-46e1-b83c-83105715bd39',
          },
        })
        .reply(200, ctCartResponse);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: RemoveCouponToCartMutation,
          variables: {
            uid: '65990889-bc81-46e1-b83c-83105715bd39',
            version: 106,
            couponid: 'b372a64f-f6ed-4c1d-afca-ef4f14d3cf02',
          },
        })
        .reply(200, ctRemoveCouponIdErrorResposne);
      args.variables = {
        cartId: '65990889-bc81-46e1-b83c-83105715bd39',
      };
      args.query =
        'mutation removeCouponFromCart($cartId:String!){removeCouponFromCart(input:{cart_id:$cartId}){cart{id ...CartPageFragment available_payment_methods{code title __typename}__typename}__typename}}fragment CartPageFragment on Cart{id total_quantity ...AppliedCouponsFragment ...GiftCardFragment ...ProductListingFragment ...PriceSummaryFragment __typename}fragment AppliedCouponsFragment on Cart{id applied_coupons{code __typename}__typename}fragment GiftCardFragment on Cart{applied_gift_cards{code current_balance{currency value __typename}__typename}id __typename}fragment ProductListingFragment on Cart{id items{id product{id name sku url_key url_suffix thumbnail{url __typename}small_image{url __typename}stock_status ...on ConfigurableProduct{variants{attributes{uid __typename}product{id small_image{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ...on ConfigurableCartItem{configurable_options{id configurable_product_option_value_uid option_label value_id value_label __typename}__typename}__typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            "Cannot remove discount code 'b372a64f-f6ed-4c1d-afca-ef4f14d3cf02' because it is not contained in the cart.",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
