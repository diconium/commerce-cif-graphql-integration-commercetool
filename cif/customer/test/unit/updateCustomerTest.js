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
const TestUtils = require('../../../utils/TestUtils.js');
const VersionQuery = require('../../src/graphql/version.grapql');
const UpdateCustomerMutation = require('../../src/graphql/updateCustomer.graphql');
const ctVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');
const ctUpdateCustomerResponse = require('../resources/ctUpdateCustomerResponse.json');
const mUpdateCustomerResponse = require('../resources/mUpdateCustomerResponse.json');
const GetCustomerQuery = require('./../../src/graphql/getCustomer.graphql');
const ctCustomerLoaderResponse = require('../resources/ctCustomerLoader.json');
const ctInvalidVersionNumberResponse = require('../resources/ctInvalidVersionNumber.json');

describe('UpdateCustomer', function() {
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

    it('Query: validate response should update customer details', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCustomerQuery,
        })
        .reply(200, ctCustomerLoaderResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionQuery,
        })
        .reply(200, ctVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: UpdateCustomerMutation,
          variables: {
            id: '69572399-e2c8-4c17-8153-cc34b773ab58',
            version: 106,
            actions: [
              {
                setFirstName: { firstName: 'abc' },
              },
              { setLastName: { lastName: 'xyz' } },
              { changeEmail: { email: 'abc.xyz@123.com' } },
            ],
          },
        })
        .reply(200, ctUpdateCustomerResponse);
      args.variables = {
        customerInput: {
          email: 'abc.xyz@123.com',
          firstname: 'abc',
          lastname: 'xyz',
          password: 'abc123@',
        },
      };
      args.query =
        'mutation SetCustomerInformation($customerInput:CustomerInput!){updateCustomer(input:$customerInput){customer{id ...AccountInformationPageFragment __typename}__typename}}fragment AccountInformationPageFragment on Customer{id firstname lastname email __typename}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mUpdateCustomerResponse.data);
      });
    });

    it('Query: validate response should return invalid version number', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCustomerQuery,
        })
        .reply(200, ctCustomerLoaderResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionQuery,
        })
        .reply(200, ctInvalidVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: UpdateCustomerMutation,
          variables: {
            id: '2890eaad-0b24-4f05-a03a-35638e318116',
            version: 106,
            actions: [
              {
                setFirstName: { firstName: 'abc' },
              },
              { setLastName: { lastName: 'xyz' } },
              { changeEmail: { email: 'abc.xyz@123.com' } },
            ],
          },
        })
        .reply(200, ctUpdateCustomerResponse);
      args.variables = {
        customerInput: {
          email: 'abc.xyz@123.com',
          firstname: 'abc',
          lastname: 'xyz',
          password: 'abc123@',
        },
      };
      args.query =
        'mutation SetCustomerInformation($customerInput:CustomerInput!){updateCustomer(input:$customerInput){customer{id ...AccountInformationPageFragment __typename}__typename}}fragment AccountInformationPageFragment on Customer{id firstname lastname email __typename}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            'Object b596a867-e803-41cd-9f04-815b35e71c14 has a different version than expected. Expected: 120 - Actual: 55.',
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
