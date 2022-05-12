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
const mApplyGiftCardToCart = require('../resources/mApplyGiftCardToCart.json');
const validResponseApplyCouponToCart = require('../resources/applyCoupon/validResponseApplyCouponToCart.json');
const cartNotFound = require('../resources/applyCoupon/ctCartNotFound.json');
const inExpiredCouponCode = require('../resources/applyCoupon/ctExpiredCouponCode.json');
const couponAlreadyExist = require('../resources/applyCoupon/ctCouponAlreadyExist.json');
const invalidCouponCode = require('../resources/applyCoupon/ctInvalidCouponCode.json');
const inActiveCouponCode = require('../resources/applyCoupon/ctInActiveCouponCode.json');
const commerceVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const VersionCartQuery = require('../../src/graphql/version.grapql.js');
const ApplyGiftCardToCartMutation = require('../../src/graphql/applyGiftCard.graphql.js');

describe('ApplyGiftCardToCart', function() {
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

    it('Mutation: validate apply giftcard to cart', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '76f11761-0d10-4dd3-806d-8ce04ffcd653',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ApplyGiftCardToCartMutation,
          variables: {
            uid: '76f11761-0d10-4dd3-806d-8ce04ffcd653',
            version: 106,
            code: 'FLAT20',
          },
        })
        .reply(200, validResponseApplyCouponToCart)
        .log(console.log);
      args.variables = {
        cartId: '76f11761-0d10-4dd3-806d-8ce04ffcd653',
        giftCardCode: 'FLAT20',
      };
      args.query =
        'mutation applyGiftCardToCart($cartId:String!,$giftCardCode:String!){applyGiftCardToCart(input:{cart_id:$cartId,gift_card_code:$giftCardCode}){cart{id ...CartPageFragment available_payment_methods{code title __typename}__typename}__typename}}fragment CartPageFragment on Cart{id total_quantity ...AppliedCouponsFragment ...GiftCardFragment ...ProductListingFragment ...PriceSummaryFragment __typename}fragment AppliedCouponsFragment on Cart{id applied_coupons{code __typename}__typename}fragment GiftCardFragment on Cart{applied_gift_cards{code current_balance{currency value __typename}__typename}id __typename}fragment ProductListingFragment on Cart{id items{id product{id name sku url_key url_suffix thumbnail{url __typename}small_image{url __typename}stock_status ... on ConfigurableProduct{variants{attributes{uid __typename}product{id small_image{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ... on ConfigurableCartItem{configurable_options{id configurable_product_option_value_uid option_label value_id value_label __typename}__typename}__typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}';
      return resolve(args).then(result => {
        assert.isUndefined(result.errors);
        let response = result.data;
        expect(response).to.deep.equals(mApplyGiftCardToCart.data);
      });
    });

    it('Mutation: validate response should contain cart not found', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: 'Invalid_Cart_ID',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ApplyGiftCardToCartMutation,
          variables: {
            uid: 'Invalid_Cart_ID',
            version: 106,
            code: 'FLAT10',
          },
        })
        .reply(200, cartNotFound)
        .log(console.log);
      args.variables = {
        cartId: 'Invalid_Cart_ID',
        giftCardCode: 'FLAT10',
      };
      args.query =
        'mutation applyGiftCardToCart($cartId:String!,$giftCardCode:String!){applyGiftCardToCart(input:{cart_id:$cartId,gift_card_code:$giftCardCode}){cart{id ...CartPageFragment available_payment_methods{code title __typename}__typename}__typename}}fragment CartPageFragment on Cart{id total_quantity ...AppliedCouponsFragment ...GiftCardFragment ...ProductListingFragment ...PriceSummaryFragment __typename}fragment AppliedCouponsFragment on Cart{id applied_coupons{code __typename}__typename}fragment GiftCardFragment on Cart{applied_gift_cards{code current_balance{currency value __typename}__typename}id __typename}fragment ProductListingFragment on Cart{id items{id product{id name sku url_key url_suffix thumbnail{url __typename}small_image{url __typename}stock_status ... on ConfigurableProduct{variants{attributes{uid __typename}product{id small_image{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ... on ConfigurableCartItem{configurable_options{id configurable_product_option_value_uid option_label value_id value_label __typename}__typename}__typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message: 'Error: Request failed with status code 400',
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });

    it('Mutation: validate response should contain coupon is expired', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ApplyGiftCardToCartMutation,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
            version: 106,
            code: 'EXPIRED',
          },
        })
        .reply(200, inExpiredCouponCode)
        .log(console.log);
      args.variables = {
        cartId: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
        giftCardCode: 'EXPIRED',
      };
      args.query =
        'mutation applyGiftCardToCart($cartId:String!,$giftCardCode:String!){applyGiftCardToCart(input:{cart_id:$cartId,gift_card_code:$giftCardCode}){cart{id ...CartPageFragment available_payment_methods{code title __typename}__typename}__typename}}fragment CartPageFragment on Cart{id total_quantity ...AppliedCouponsFragment ...GiftCardFragment ...ProductListingFragment ...PriceSummaryFragment __typename}fragment AppliedCouponsFragment on Cart{id applied_coupons{code __typename}__typename}fragment GiftCardFragment on Cart{applied_gift_cards{code current_balance{currency value __typename}__typename}id __typename}fragment ProductListingFragment on Cart{id items{id product{id name sku url_key url_suffix thumbnail{url __typename}small_image{url __typename}stock_status ... on ConfigurableProduct{variants{attributes{uid __typename}product{id small_image{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ... on ConfigurableCartItem{configurable_options{id configurable_product_option_value_uid option_label value_id value_label __typename}__typename}__typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            "The discount code 'EXPIRED' is valid only from 2020-05-01T00:00:00.000Z until 2020-05-28T00:00:00.000Z",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });

    it('Mutation: validate response should contain coupon is invalid', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ApplyGiftCardToCartMutation,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
            version: 106,
            code: 'INVALID',
          },
        })
        .reply(200, invalidCouponCode)
        .log(console.log);
      args.variables = {
        cartId: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
        giftCardCode: 'INVALID',
      };
      args.query =
        'mutation applyGiftCardToCart($cartId:String!,$giftCardCode:String!){applyGiftCardToCart(input:{cart_id:$cartId,gift_card_code:$giftCardCode}){cart{id ...CartPageFragment available_payment_methods{code title __typename}__typename}__typename}}fragment CartPageFragment on Cart{id total_quantity ...AppliedCouponsFragment ...GiftCardFragment ...ProductListingFragment ...PriceSummaryFragment __typename}fragment AppliedCouponsFragment on Cart{id applied_coupons{code __typename}__typename}fragment GiftCardFragment on Cart{applied_gift_cards{code current_balance{currency value __typename}__typename}id __typename}fragment ProductListingFragment on Cart{id items{id product{id name sku url_key url_suffix thumbnail{url __typename}small_image{url __typename}stock_status ... on ConfigurableProduct{variants{attributes{uid __typename}product{id small_image{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ... on ConfigurableCartItem{configurable_options{id configurable_product_option_value_uid option_label value_id value_label __typename}__typename}__typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message: "The discount code 'INVALID' was not found.",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });

    it('Mutation: validate response should contain coupon is already exist in cart', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ApplyGiftCardToCartMutation,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
            version: 106,
            code: 'FLAT10',
          },
        })
        .reply(200, couponAlreadyExist)
        .log(console.log);
      args.variables = {
        cartId: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
        giftCardCode: 'FLAT10',
      };
      args.query =
        'mutation applyGiftCardToCart($cartId:String!,$giftCardCode:String!){applyGiftCardToCart(input:{cart_id:$cartId,gift_card_code:$giftCardCode}){cart{id ...CartPageFragment available_payment_methods{code title __typename}__typename}__typename}}fragment CartPageFragment on Cart{id total_quantity ...AppliedCouponsFragment ...GiftCardFragment ...ProductListingFragment ...PriceSummaryFragment __typename}fragment AppliedCouponsFragment on Cart{id applied_coupons{code __typename}__typename}fragment GiftCardFragment on Cart{applied_gift_cards{code current_balance{currency value __typename}__typename}id __typename}fragment ProductListingFragment on Cart{id items{id product{id name sku url_key url_suffix thumbnail{url __typename}small_image{url __typename}stock_status ... on ConfigurableProduct{variants{attributes{uid __typename}product{id small_image{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ... on ConfigurableCartItem{configurable_options{id configurable_product_option_value_uid option_label value_id value_label __typename}__typename}__typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            "The discount code 'f7e3cd2f-1cdd-4544-a16f-e3d9dfda9554' is already present in the cart.",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });

    it('Mutation: validate response should contain coupon is inactive', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ApplyGiftCardToCartMutation,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
            version: 106,
            code: 'INACTIVE',
          },
        })
        .reply(200, inActiveCouponCode)
        .log(console.log);
      args.variables = {
        cartId: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
        giftCardCode: 'INACTIVE',
      };
      args.query =
        'mutation applyGiftCardToCart($cartId:String!,$giftCardCode:String!){applyGiftCardToCart(input:{cart_id:$cartId,gift_card_code:$giftCardCode}){cart{id ...CartPageFragment available_payment_methods{code title __typename}__typename}__typename}}fragment CartPageFragment on Cart{id total_quantity ...AppliedCouponsFragment ...GiftCardFragment ...ProductListingFragment ...PriceSummaryFragment __typename}fragment AppliedCouponsFragment on Cart{id applied_coupons{code __typename}__typename}fragment GiftCardFragment on Cart{applied_gift_cards{code current_balance{currency value __typename}__typename}id __typename}fragment ProductListingFragment on Cart{id items{id product{id name sku url_key url_suffix thumbnail{url __typename}small_image{url __typename}stock_status ... on ConfigurableProduct{variants{attributes{uid __typename}product{id small_image{url __typename}__typename}__typename}__typename}__typename}prices{price{currency value __typename}__typename}quantity ... on ConfigurableCartItem{configurable_options{id configurable_product_option_value_uid option_label value_id value_label __typename}__typename}__typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            "The discount code '1767d4c8-b692-43df-b5a1-2a6b063f95e4' is not active.",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
