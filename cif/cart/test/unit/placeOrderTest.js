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
const VersionCartQuery = require('../../src/graphql/version.grapql.js');
const ctInvalidCartIdResponse = require('../resources/ctInvalidCartIdResponse.json');
const ctInvalidVersionIdResponse = require('../resources/ctInvalidVersionIdResponse.json');
const PlaceOrderMutation = require('../../src/graphql/placeOrder.graphql.js');
const ctPlaceOrderJSON = require('./../resources/ctPlaceOrder.json');
const mPlaceOrderJSON = require('./../resources/mPlaceOrder.json');
const ctVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');

describe('Place Order', function() {
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

    it('Mutation: validate response should return order id ', () => {
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
          query: PlaceOrderMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
          },
        })
        .reply(200, ctPlaceOrderJSON);
      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-728326003259',
      };
      args.query =
        'mutation placeOrder($cartId:String!){placeOrder(input:{cart_id:$cartId}){order{order_number __typename}__typename}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mPlaceOrderJSON.data);
      });
    });

    it('Mutation: validate response should return invalid version id ', () => {
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
          query: PlaceOrderMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
          },
        })
        .reply(200, ctPlaceOrderJSON);

      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-728326003259',
      };
      args.query =
        'mutation placeOrder($cartId:String!){placeOrder(input:{cart_id:$cartId}){order{order_number __typename}__typename}}';
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

    it('Mutation: validate response should return invalid cart id ', () => {
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
          query: PlaceOrderMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-072832600325',
            version: 106,
          },
        })
        .reply(200, ctInvalidCartIdResponse);

      args.variables = {
        cartId: '03bdd6d9-ede2-495c-8ed8-072832600325',
      };
      args.query =
        'mutation placeOrder($cartId:String!){placeOrder(input:{cart_id:$cartId}){order{order_number __typename}__typename}}';
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
  });
});
