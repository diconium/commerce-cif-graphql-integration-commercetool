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
const commerceAddLineItemToCartResponse = require('../resources/ctAddLineItemToCartResponse.json');
const ctAddProductToCartResponse = require('../resources/ctAddProductToCartResponse.json');
const commerceVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');
const commerceInvalidVersionIdResponse = require('../resources/ctInvalidVersionIdResponse.json');
const commerceInvalidCartIdResponse = require('../resources/ctInvalidCartIdResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const AddLineItemToCartMutation = require('../../src/graphql/addLineItemToCart.graphql.js');
const VersionCartQuery = require('../../src/graphql/version.grapql.js');

describe('addProductToCart', function() {
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

    it('Mutation: validate response should return new line item for carts', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
          },
        })
        .reply(200, commerceVersionNumberResponse);
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: AddLineItemToCartMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            sku: '902b77be-0a40-4f98-a182-56b3367b8cb5',
            quantity: 2,
          },
        })
        .reply(200, commerceAddLineItemToCartResponse);

      args.query =
        'mutation {addSimpleProductsToCart(input:{cart_id: "03bdd6d9-ede2-495c-8ed8-728326003259", cart_items: [{data: {quantity: 2, sku: "902b77be-0a40-4f98-a182-56b3367b8cb5" } }]}){cart {prices {subtotal_excluding_tax {value,currency},subtotal_including_tax{value,currency},grand_total{value,currency}},id,items {id,product { name,sku },quantity},total_quantity }}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(ctAddProductToCartResponse.data);
      });
    });

    it('Mutation: validate response should return invalid version id', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
          },
        })
        .reply(200, commerceVersionNumberResponse);
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: AddLineItemToCartMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            sku: '902b77be-0a40-4f98-a182-56b3367b8cb5',
            quantity: 2,
          },
        })
        .reply(200, commerceInvalidVersionIdResponse);
      args.query =
        'mutation {addSimpleProductsToCart(input:{cart_id: "03bdd6d9-ede2-495c-8ed8-728326003259", cart_items: [{data: {quantity: 2, sku: "902b77be-0a40-4f98-a182-56b3367b8cb5" } }]}){cart {prices {subtotal_excluding_tax {value,currency},subtotal_including_tax{value,currency},grand_total{value,currency}},id,items {id,product { name,sku },quantity},total_quantity }}}';
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

    it('Mutation: validate response should return invalid cart id', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
          },
        })
        .reply(200, commerceVersionNumberResponse);
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: AddLineItemToCartMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            sku: '902b77be-0a40-4f98-a182-56b3367b8cb5',
            quantity: 2,
          },
        })
        .reply(200, commerceInvalidCartIdResponse);
      args.query =
        'mutation {addSimpleProductsToCart(input:{cart_id: "03bdd6d9-ede2-495c-8ed8-728326003259", cart_items: [{data: {quantity: 2, sku: "902b77be-0a40-4f98-a182-56b3367b8cb5" } }]}){cart {prices {subtotal_excluding_tax {value,currency},subtotal_including_tax{value,currency},grand_total{value,currency}},id,items {id,product { name,sku },quantity},total_quantity }}}';
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
