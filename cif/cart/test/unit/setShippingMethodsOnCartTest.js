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
const ctSetShippingMethodOnCartResponse = require('../resources/ctShippingMethodOnCartResponse.json');
const mSetShippingMethodOnCartResponse = require('../resources/mShippingMethodOnCartResponse.json');
const ctVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');
const ctInvalidVersionIdResponse = require('../resources/ctInvalidVersionIdResponse.json');
const ctInvalidCartIdResponse = require('../resources/ctInvalidCartIdResponse.json');
const ctSetShippingMethoInvalidIdResponse = require('../resources/ctSetShippingMethodInvalidIdResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const SetShippingMethodMutation = require('../../src/graphql/setShippingMethod.graphql');
const VersionCartQuery = require('../../src/graphql/version.grapql.js');

describe('setShippingMethodOnCart', function() {
  const scope = nock('https://api.europe-west1.gcp.commercetools.com', {
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

    it('Mutation: validate response should return the shipping method of cart', () => {
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
          query: SetShippingMethodMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            id: 'd92e7f4f-5e8e-4407-8443-67896ab7dbaf',
          },
        })
        .reply(200, ctSetShippingMethodOnCartResponse);
      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-728326003259',
        shippingMethod: {
          carrier_code: 'd92e7f4f-5e8e-4407-8443-67896ab7dbaf',
          method_code: 'd92e7f4f-5e8e-4407-8443-67896ab7dbaf',
        },
      };
      args.query =
        'mutation SetShippingMethod($cartId:String!$shippingMethod:ShippingMethodInput!){setShippingMethodsOnCart(input:{cart_id:$cartId shipping_methods:[$shippingMethod]}){cart{id available_payment_methods{code title __typename}...SelectedShippingMethodCheckoutFragment ...PriceSummaryFragment ...ShippingInformationFragment ...AvailableShippingMethodsCheckoutFragment __typename}__typename}}fragment AvailableShippingMethodsCheckoutFragment on Cart{id shipping_addresses{available_shipping_methods{amount{currency value __typename}available carrier_code carrier_title method_code method_title __typename}street __typename}__typename}fragment SelectedShippingMethodCheckoutFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}carrier_code method_code method_title __typename}street __typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}fragment ShippingInformationFragment on Cart{id email shipping_addresses{city country{code label __typename}firstname lastname postcode region{code label region_id __typename}street telephone __typename}__typename}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mSetShippingMethodOnCartResponse.data);
      });
    });

    it('Mutation: validate response should return the invalid version', () => {
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
          query: SetShippingMethodMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            id: 'd92e7f4f-5e8e-4407-8443-67896ab7dbaf',
          },
        })
        .reply(200, ctSetShippingMethodOnCartResponse);

      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-728326003259',
        shippingMethod: {
          carrier_code: 'd92e7f4f-5e8e-4407-8443-67896ab7dbaf',
          method_code: 'd92e7f4f-5e8e-4407-8443-67896ab7dbaf',
        },
      };
      args.query =
        'mutation SetShippingMethod($cartId:String!$shippingMethod:ShippingMethodInput!){setShippingMethodsOnCart(input:{cart_id:$cartId shipping_methods:[$shippingMethod]}){cart{id available_payment_methods{code title __typename}...SelectedShippingMethodCheckoutFragment ...PriceSummaryFragment ...ShippingInformationFragment ...AvailableShippingMethodsCheckoutFragment __typename}__typename}}fragment AvailableShippingMethodsCheckoutFragment on Cart{id shipping_addresses{available_shipping_methods{amount{currency value __typename}available carrier_code carrier_title method_code method_title __typename}street __typename}__typename}fragment SelectedShippingMethodCheckoutFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}carrier_code method_code method_title __typename}street __typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}fragment ShippingInformationFragment on Cart{id email shipping_addresses{city country{code label __typename}firstname lastname postcode region{code label region_id __typename}street telephone __typename}__typename}';
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
          query: SetShippingMethodMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-072832600325',
            version: 106,
            id: 'd92e7f4f-5e8e-4407-8443-67896ab7dbaf',
          },
        })
        .reply(200, ctInvalidCartIdResponse);

      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-072832600325',
        shippingMethod: {
          carrier_code: 'd92e7f4f-5e8e-4407-8443-67896ab7dbaf',
          method_code: 'd92e7f4f-5e8e-4407-8443-67896ab7dbaf',
        },
      };
      args.query =
        'mutation SetShippingMethod($cartId:String!$shippingMethod:ShippingMethodInput!){setShippingMethodsOnCart(input:{cart_id:$cartId shipping_methods:[$shippingMethod]}){cart{id available_payment_methods{code title __typename}...SelectedShippingMethodCheckoutFragment ...PriceSummaryFragment ...ShippingInformationFragment ...AvailableShippingMethodsCheckoutFragment __typename}__typename}}fragment AvailableShippingMethodsCheckoutFragment on Cart{id shipping_addresses{available_shipping_methods{amount{currency value __typename}available carrier_code carrier_title method_code method_title __typename}street __typename}__typename}fragment SelectedShippingMethodCheckoutFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}carrier_code method_code method_title __typename}street __typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}fragment ShippingInformationFragment on Cart{id email shipping_addresses{city country{code label __typename}firstname lastname postcode region{code label region_id __typename}street telephone __typename}__typename}';
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

    it('Mutation: validate response should return the invalid method code', () => {
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
          query: SetShippingMethodMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            id: 'a7197f1b-84bb-40fb-9ea5-00ea93bb625a',
          },
        })
        .reply(200, ctSetShippingMethoInvalidIdResponse);

      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-728326003259',
        shippingMethod: {
          carrier_code: 'd92e7f4f-5e8e-4407-8443-67896ab7dbaf',
          method_code: 'a7197f1b-84bb-40fb-9ea5-00ea93bb625a',
        },
      };
      args.query =
        'mutation SetShippingMethod($cartId:String!$shippingMethod:ShippingMethodInput!){setShippingMethodsOnCart(input:{cart_id:$cartId shipping_methods:[$shippingMethod]}){cart{id available_payment_methods{code title __typename}...SelectedShippingMethodCheckoutFragment ...PriceSummaryFragment ...ShippingInformationFragment ...AvailableShippingMethodsCheckoutFragment __typename}__typename}}fragment AvailableShippingMethodsCheckoutFragment on Cart{id shipping_addresses{available_shipping_methods{amount{currency value __typename}available carrier_code carrier_title method_code method_title __typename}street __typename}__typename}fragment SelectedShippingMethodCheckoutFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}carrier_code method_code method_title __typename}street __typename}__typename}fragment PriceSummaryFragment on Cart{id items{id quantity __typename}...ShippingSummaryFragment prices{...TaxSummaryFragment ...DiscountSummaryFragment ...GrandTotalFragment subtotal_excluding_tax{currency value __typename}__typename}...GiftCardSummaryFragment __typename}fragment DiscountSummaryFragment on CartPrices{discounts{amount{currency value __typename}label __typename}__typename}fragment GiftCardSummaryFragment on Cart{id applied_gift_cards{code applied_balance{value currency __typename}__typename}__typename}fragment GrandTotalFragment on CartPrices{grand_total{currency value __typename}__typename}fragment ShippingSummaryFragment on Cart{id shipping_addresses{selected_shipping_method{amount{currency value __typename}__typename}street __typename}__typename}fragment TaxSummaryFragment on CartPrices{applied_taxes{amount{currency value __typename}__typename}__typename}fragment ShippingInformationFragment on Cart{id email shipping_addresses{city country{code label __typename}firstname lastname postcode region{code label region_id __typename}street telephone __typename}__typename}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            "The referenced object of type 'shipping-method' with identifier 'a7197f1b-84bb-40fb-9ea5-00ea93bb625a' was not found. It either doesn't exist, or it can't be accessed from this endpoint (e.g., if the endpoint filters by store or customer account).",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
