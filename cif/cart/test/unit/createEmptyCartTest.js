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
const ctCreateEmptyCart = require('../resources/ctCreateEmptyCart.json');
const validResponseCreateEmptyCart = require('../resources/validResponseCreateEmptyCart.json');
const TestUtils = require('../../../utils/TestUtils.js');
const CreateEmptyCartMutation = require('../../src/graphql/createEmptyCart.graphql.js');

describe('SetGuestEmailOnCart', function() {
  const scope = nock('https://api.europe-west1.gcp.commercetools.com', {
    reqheaders: {
      Authorization: TestUtils.getContextData().context.settings.defaultRequest
        .headers.Authorization,
    },
  });

  before(() => {
    // Disable console debugging
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  describe('Unit Tests', () => {
    let args = TestUtils.getContextData();

    it('Mutation: validate create empty cart for user', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CreateEmptyCartMutation,
          variables: {
            draft: {
              currency: args.context.settings.currency,
              country: args.context.settings.country,
            },
          },
        })
        .reply(200, ctCreateEmptyCart)
        .log(console.log);
      args.query = 'mutation {createEmptyCart}';
      return resolve(args).then(result => {
        assert.isUndefined(result.errors);
        let response = result.data;
        expect(response).to.deep.equals(validResponseCreateEmptyCart);
      });
    });
  });
});
