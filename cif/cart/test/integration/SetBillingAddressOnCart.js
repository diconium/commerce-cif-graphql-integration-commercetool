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
const assert = require('chai').assert;
const resolve = require('../../src/resolvers/cartResolver').main;
const TestUtils = require('../../../utils/TestUtils.js');
const chai = require('chai');
const expect = require('chai').expect;
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);

describe('SetBillingAddressOnCart', function() {
  before(() => {
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  describe('Integration Tests', () => {
    let args = TestUtils.getContextData();

    it('Mutation: set billing address on cart', () => {
      args.query =
        'mutation {setBillingAddressOnCart(input: {cart_id: "03bdd6d9-ede2-495c-8ed8-728326003259", billing_address: {address: {firstname: "Bob", lastname: "Roll", company: "Magento", street: ["Magento shipping", "Main Street"], city: "Austin", region: "US-WA", postcode: "78758", country_code: "US", telephone: "9999998899", save_in_address_book: false}}}) { cart {billing_address {firstname,lastname,company,street,city,region {code,label},postcode,telephone,country {code,label} }}}}';
      return TestUtils.getBearer().then(accessToken => {
        args.context.settings.bearer = accessToken;
        return resolve(args).then(result => {
          const { errors } = result;
          assert.isUndefined(result.errors);
          let responseData =
            result.data.setBillingAddressOnCart.cart.billing_address;
          assert.notEqual(responseData, null);
          expect(errors).to.be.undefined;
        });
      });
    });
  });
});
