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
const ctSetBillingAddressOnCartResponse = require('../resources/SetBillingAddressOnCartResponse.json');
const mSetBillingAddressOnCartResponse = require('../resources/SetBillingAddressOnCart.json');
const ctVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');
const ctInvalidVersionIdResponse = require('../resources/ctInvalidVersionIdResponse.json');
const ctInvalidCartIdResponse = require('../resources/ctInvalidCartIdResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const VersionCartQuery = require('../../src/graphql/version.grapql.js');
const SetBillingAddressMutation = require('../../src/graphql/setBillingAddress.graphql.js');

describe('SetBillingAddressOnCart', function() {
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

    it('Mutation: validate response should return new billing address on cart', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
          },
        })
        .reply(200, ctVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: SetBillingAddressMutation,
          variables: {
            city: 'Austin',
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            firstName: 'Bob',
            lastName: 'Roll',
            company: 'Magento',
            streetName: 'Magento Shipping',
            region: 'US-WA',
            postalCode: '78758',
            country: 'US',
            phone: '9999998899',
          },
        })
        .reply(200, ctSetBillingAddressOnCartResponse);
      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-728326003259',
        firstname: 'Bob',
        lastname: 'Roll',
        street: ['Magento Shipping'],
        city: 'Austin',
        regionCode: 'US-WA',
        postcode: '78758',
        countryCode: 'US',
        telephone: '9999998899',
        company: 'Magento',
      };
      args.query =
        'mutation setBillingAddress($cartId:String!$firstname:String!$lastname:String!$street:[String]!$city:String!$regionCode:String!$postcode:String!$countryCode:String!$telephone:String!$company:String){setBillingAddressOnCart(input:{cart_id:$cartId billing_address:{address:{firstname:$firstname lastname:$lastname street:$street city:$city region:$regionCode postcode:$postcode country_code:$countryCode telephone:$telephone save_in_address_book:false company:$company}}}){cart{id billing_address{firstname lastname country{code __typename}street city region{code __typename}postcode telephone __typename}...PriceSummaryFragment ...AvailablePaymentMethodsFragment __typename}__typename}}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}fragment AvailablePaymentMethodsFragment on Cart{id available_payment_methods{code title __typename}__typename}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mSetBillingAddressOnCartResponse.data);
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
        .reply(200, ctInvalidVersionIdResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: SetBillingAddressMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            firstName: 'Bob',
            lastName: 'Roll',
            company: 'Magento',
            streetName: 'Magento shipping',
            city: 'Austin',
            region: 'US-WA',
            postalCode: '78758',
            country: 'US',
            phone: '9999998899',
          },
        })
        .reply(200, ctSetBillingAddressOnCartResponse);

      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-728326003259',
        firstname: 'Bob',
        lastname: 'Roll',
        street: ['Magento Shipping'],
        city: 'Austin',
        regionCode: 'US-WA',
        postcode: '78758',
        countryCode: 'US',
        telephone: '9999998899',
        company: 'Magento',
      };
      args.query =
        'mutation setBillingAddress($cartId:String!$firstname:String!$lastname:String!$street:[String]!$city:String!$regionCode:String!$postcode:String!$countryCode:String!$telephone:String!$company:String){setBillingAddressOnCart(input:{cart_id:$cartId billing_address:{address:{firstname:$firstname lastname:$lastname street:$street city:$city region:$regionCode postcode:$postcode country_code:$countryCode telephone:$telephone save_in_address_book:false company:$company}}}){cart{id billing_address{firstname lastname country{code __typename}street city region{code __typename}postcode telephone __typename}...PriceSummaryFragment ...AvailablePaymentMethodsFragment __typename}__typename}}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}fragment AvailablePaymentMethodsFragment on Cart{id available_payment_methods{code title __typename}__typename}';
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
            uid: '03bdd6d9-ede2-495c-8ed8-72832600325',
          },
        })
        .reply(200, ctVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: SetBillingAddressMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-72832600325',
            version: 106,
            firstName: 'Bob',
            lastName: 'Roll',
            company: 'Magento',
            streetName: 'Magento Shipping',
            city: 'Austin',
            region: 'US-WA',
            postalCode: '78758',
            country: 'US',
            phone: '9999998899',
          },
        })
        .reply(200, ctInvalidCartIdResponse);

      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-72832600325',
        firstname: 'Bob',
        lastname: 'Roll',
        street: ['Magento Shipping'],
        city: 'Austin',
        regionCode: 'US-WA',
        postcode: '78758',
        countryCode: 'US',
        telephone: '9999998899',
        company: 'Magento',
      };
      args.query =
        'mutation setBillingAddress($cartId:String!$firstname:String!$lastname:String!$street:[String]!$city:String!$regionCode:String!$postcode:String!$countryCode:String!$telephone:String!$company:String){setBillingAddressOnCart(input:{cart_id:$cartId billing_address:{address:{firstname:$firstname lastname:$lastname street:$street city:$city region:$regionCode postcode:$postcode country_code:$countryCode telephone:$telephone save_in_address_book:false company:$company}}}){cart{id billing_address{firstname lastname country{code __typename}street city region{code __typename}postcode telephone __typename}...PriceSummaryFragment ...AvailablePaymentMethodsFragment __typename}__typename}}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}fragment AvailablePaymentMethodsFragment on Cart{id available_payment_methods{code title __typename}__typename}';
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
