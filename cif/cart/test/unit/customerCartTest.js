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
const TestUtils = require('../../../utils/TestUtils.js');
const CustomerCartQuery = require('../../src/graphql/customerCart.graphql');
const ctCustomerCartResponse = require('../resources/ctCustomerCartResponse.json');
const mCustomerCartResponse = require('../resources/mCustomerCartResponse.json');

describe('CustomerCart', function() {
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

    it('Query: validate response should get the Customer cart', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CustomerCartQuery,
        })
        .reply(200, ctCustomerCartResponse);
      args.query = 'query{ customerCart { id}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mCustomerCartResponse.data);
      });
    });
  });
});
