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
const ctVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');
const ctInvalidVersionNumberResponse = require('../resources/ctChangeCustomerPasswordInvalidVersionIdResponse.json');
//const ctChangeCustomerInvalidPasswordResponse = require('../resources/ctChangeCustomerInvalidPasswordResponse.json');
const VersionCustomerQuery = require('../../src/graphql/version.grapql.js');
const ChangeCustomerPasswordMutation = require('../../src/graphql/changeCustomerPassword.graphql.js');
const ctChangeCustomerPasswordResponse = require('../resources/ctChangeCustomerPasswordResponse.json');
const mChangeCustomerPasswordResponse = require('../resources/mChangeCustomerPasswordResponse.json');
const mInvalidVersionNumberResponse = require('../resources/mInvalidChangePasswordVersionNumber.json');
describe('ChangeCustomerPassword', function() {
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

    it('Mutation: validate response should change customer password', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCustomerQuery,
        })
        .reply(200, ctVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ChangeCustomerPasswordMutation,
          variables: {
            currentPassword: 'abc@123*',
            newPassword: 'abc123@',
            version: 106,
          },
        })
        .reply(200, ctChangeCustomerPasswordResponse);
      args.variables = {
        currentPassword: 'abc@123*',
        newPassword: 'abc123@',
      };
      args.query =
        'mutation ChangeCustomerPassword($currentPassword:String!$newPassword:String!){changeCustomerPassword(currentPassword:$currentPassword newPassword:$newPassword){ email __typename}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mChangeCustomerPasswordResponse.data);
      });
    });

    it('Mutation: validate response with invalid version number', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCustomerQuery,
        })
        .reply(200, ctInvalidVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ChangeCustomerPasswordMutation,
          variables: {
            currentPassword: 'abc@123*',
            newPassword: 'abc123@',
            version: 106,
          },
        })
        .reply(200, ctChangeCustomerPasswordResponse);
      args.variables = {
        currentPassword: 'abc@123*',
        newPassword: 'abc123@',
      };
      args.query =
        'mutation ChangeCustomerPassword($currentPassword:String!$newPassword:String!){changeCustomerPassword(currentPassword:$currentPassword newPassword:$newPassword){ email __typename}}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).to.deep.equals(mInvalidVersionNumberResponse);
      });
    });

    // it('Mutation: validate response should return invalid password', () => {
    //   scope
    //     .post('/adobeio-ct-connector/graphql', {
    //       query: VersionCustomerQuery,
    //     })
    //     .reply(200, ctVersionNumberResponse);
    //   scope
    //     .post('/adobeio-ct-connector/graphql', {
    //       query: ChangeCustomerPasswordMutation,
    //       variables: {
    //         currentPassword: 'abc@123*',
    //         newPassword: 'abc123@',
    //         version: 106,
    //       },
    //     })
    //     .reply(200, ctChangeCustomerInvalidPasswordResponse);
    //   args.variables = {
    //     currentPassword: 'abc@123*',
    //     newPassword: 'abc123@',
    //   };
    //   args.query =
    //     'mutation ChangeCustomerPassword($currentPassword:String!$newPassword:String!){changeCustomerPassword(currentPassword:$currentPassword newPassword:$newPassword){ email __typename}}';
    //   return resolve(args).then(result => {
    //     let errors = result.errors[0];
    //     expect(errors).shallowDeepEqual({
    //       message: 'Backend data is null',
    //     });
    //   });
    // });
  });
});
