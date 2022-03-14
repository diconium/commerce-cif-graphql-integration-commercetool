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
const ctCreateCustomerResponse = require('../resources/commerceCreateCustomerResponse.json');
const mCreateCustomerResponse = require('../resources/createCustomerResponse.json');
const ctCustomerAlreadyExistResponse = require('../resources/commerceCustomerAlreadyExistResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const CreateCustomerMutation = require('./../../src/graphql/createCustomer.graphql');

describe('CreateCustomer', function() {
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

    it('Mutation: validate response should always contains new customer', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CreateCustomerMutation,
          variables: {
            email: 'abc.xyz@123.com',
            password: 'Test@1234',
            firstName: 'abc',
            lastName: 'xyz',
          },
        })
        .reply(200, ctCreateCustomerResponse);
      args.query =
        'mutation {createCustomerV2(input: {firstname: "abc", lastname: "xyz", email: "abc.xyz@123.com", password: "Test@1234", is_subscribed: false}) {customer {firstname,lastname,email,is_subscribed}}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mCreateCustomerResponse.data);
      });
    });

    it('Mutation: validate response should return customer already exist', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CreateCustomerMutation,
          variables: {
            email: 'abc.xyz@123.com',
            password: 'Test@1234',
            firstName: 'abc',
            lastName: 'xyz',
          },
        })
        .reply(200, ctCustomerAlreadyExistResponse);
      args.query =
        'mutation {createCustomerV2(input: {firstname: "abc", lastname: "xyz", email: "abc.xyz@123.com", password: "Test@1234", is_subscribed: true}) {customer {firstname,lastname,email,is_subscribed}}}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            'There is already an existing customer with the email \'"abc.xyz@123.com"\'.',
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
