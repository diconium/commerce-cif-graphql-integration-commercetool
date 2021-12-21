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
const commerceCreateCustomerResponse = require('../resources//commerceCreateCustomerResponse.json');
const createCustomerResponse = require('../resources/createCustomerResponse.json');
const commerceCustomerAlreadyExistResponse = require('../resources/commerceCustomerAlreadyExistResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const CreateCustomerMutation = require('./../../src/graphql/createCustomer.graphql');
describe('CreateCustomer', function() {
  const scope = nock('https://CT_INSTANCE_HOSTNAME', {
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
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: CreateCustomerMutation,
          variables: {
            email: 'amar10@test.com',
            password: 'Test@1234',
            firstName: 'Amaresh1',
            lastName: 'muni',
          },
        })
        .reply(200, commerceCreateCustomerResponse);
      args.query =
        'mutation {createCustomerV2(input: {firstname: "Amaresh1", lastname: "muni", email: "amar10@test.com", password: "Test@1234", is_subscribed: false}) {customer {firstname,lastname,email,is_subscribed}}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(createCustomerResponse.data);
      });
    });

    it('Mutation: validate response should return customer already exist', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: CreateCustomerMutation,
          variables: {
            email: 'amar10@test.com',
            password: 'Test@1234',
            firstName: 'Amaresh1',
            lastName: 'muni',
          },
        })
        .reply(200, commerceCustomerAlreadyExistResponse);
      args.query =
        'mutation {createCustomerV2(input: {firstname: "Amaresh1", lastname: "muni", email: "amar10@test.com", password: "Test@1234", is_subscribed: true}) {customer {firstname,lastname,email,is_subscribed}}}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            'There is already an existing customer with the email \'"amar10@test.com"\'.',
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
