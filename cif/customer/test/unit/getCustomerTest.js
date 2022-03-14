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
const resolve = require('../../src/resolvers/customerResolver.js').main;
const ctCustomerLoaderReponse = require('../resources/ctCustomerLoader.json');
const mCustomerLoaderResponse = require('../resources/mCustomerLoaderResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const GetCustomerQuery = require('./../../src/graphql/getCustomer.graphql');
describe('getCustomer', function() {
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

    it('Query: validate response should always get the signed in customer', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCustomerQuery,
        })
        .reply(200, ctCustomerLoaderReponse);
      args.query =
        'query {customer{email ,firstname ,lastname, addresses{id ,city ,company ,country_code ,default_billing ,default_shipping,firstname,lastname,postcode,region{region_code}street,telephone}}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mCustomerLoaderResponse.data);
      });
    });
  });
});
