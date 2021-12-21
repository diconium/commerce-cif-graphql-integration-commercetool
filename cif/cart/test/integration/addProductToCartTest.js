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
const assert = require('chai').assert;
const resolve = require('../../src/resolvers/cartResolver.js').main;
const TestUtils = require('../../../utils/TestUtils.js');
const chai = require('chai');
const expect = require('chai').expect;
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);

describe('AddLineItemToCart', function() {
  before(() => {
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  describe('Integration Tests', () => {
    let args = TestUtils.getContextData();

    it('Mutation: validate response shoud return new line item for cart', () => {
      args.query =
        'mutation {addSimpleProductsToCart(input:{cart_id: "03bdd6d9-ede2-495c-8ed8-728326003259", cart_items: [{data: {quantity: 1, sku: "902b77be-0a40-4f98-a182-56b3367b8cb5" } }]}){cart {items {id,product { name,sku },quantity} }}}';
      return TestUtils.getBearer().then(accessToken => {
        args.context.settings.bearer = accessToken;
        return resolve(args).then(result => {
          const { errors } = result;
          assert.isUndefined(result.errors);
          let responseData = result.data.addSimpleProductsToCart;
          assert.notEqual(responseData, null);
          expect(errors).to.be.undefined;
        });
      });
    });
  });
});
