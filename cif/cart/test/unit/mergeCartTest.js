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
const ctCartResponse = require('../resources/ctCartResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const GetCartQuery = require('../../src/graphql/cart.graphql');
const mMergeCartResponse = require('../resources/mMergeCartResponse.json');

describe('MergeCart', function() {
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

    it('Query: validate response should get the merge carts', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCartQuery,
          variables: {
            cartId: '757dbca6-b3da-4909-98c3-f8d5099bfb94',
          },
        })
        .reply(200, ctCartResponse);

      args.variables = {
        destinationCartId: '757dbca6-b3da-4909-98c3-f8d5099bfb94',
        sourceCartId: 'null',
      };
      args.query =
        'mutation MergeCartsAfterSignIn($sourceCartId:String!$destinationCartId:String!){mergeCarts(source_cart_id:$sourceCartId destination_cart_id:$destinationCartId){id items{id __typename}__typename}}';
      return resolve(args).then(result => {
        console.log(result);
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mMergeCartResponse.data);
      });
    });
  });
});
