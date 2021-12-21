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
const version = require('../../src/graphql/version.grapql.js');
const PlaceOrderMutation = require('../../src/graphql/placeOrder.graphql.js');
const ctPlaceOrderJSON = require('./../resources/ctPlaceOrder.json');
const mPlaceOrderJSON = require('./../resources/mPlaceOrder.json');
const commerceVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');

describe('Place Order', function() {
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

    it('Mutation: validate response should return order id ', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: version,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
          },
        })
        .reply(200, commerceVersionNumberResponse);
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: PlaceOrderMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
          },
        })
        .reply(200, ctPlaceOrderJSON);

      args.query = `mutation {
          placeOrder(
            input: {
              cart_id: "03bdd6d9-ede2-495c-8ed8-728326003259"
            }
          ) {
            order {
              order_id
            }
          }
        }`;
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mPlaceOrderJSON);
      });
    });
  });
});
