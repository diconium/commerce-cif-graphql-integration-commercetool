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
const nock = require('nock');
const chai = require('chai');
const assert = require('chai').assert;
const expect = require('chai').expect;
const resolve = require('../../src/resolvers/cartResolver.js').main;
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);
const applyCoupon = require('../resources/applyCoupon/ctApplyCoupon.json');
const validResponseApplyCouponToCart = require('../resources/applyCoupon/validResponseApplyCouponToCart.json');
const cartNotFound = require('../resources/applyCoupon/ctCartNotFound.json');
const inExpiredCouponCode = require('../resources/applyCoupon/ctExpiredCouponCode.json');
const couponAlreadyExist = require('../resources/applyCoupon/ctCouponAlreadyExist.json');
const invalidCouponCode = require('../resources/applyCoupon/ctInvalidCouponCode.json');
const inActiveCouponCode = require('../resources/applyCoupon/ctInActiveCouponCode.json');
const commerceVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const VersionCartQuery = require('../../src/graphql/version.grapql.js');
const ApplyCouponToCartMutation = require('../../src/graphql/applyCouponToCart.graphql.js');

describe('ApplyCouponOnCart', function() {
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

    it('Mutation: validate apply coupon to cart', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: ApplyCouponToCartMutation,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
            version: 106,
            code: 'FLAT10',
          },
        })
        .reply(200, validResponseApplyCouponToCart)
        .log(console.log);
      args.query =
        'mutation {applyCouponToCart(input: {cart_id: "1cafee87-9cc2-4e3b-bc05-662b8594a5e7",coupon_code: "FLAT10"}){cart{applied_coupon{code}}}}';
      return resolve(args).then(result => {
        assert.isUndefined(result.errors);
        let response = result.data;
        expect(response).to.deep.equals(applyCoupon);
      });
    });

    it('Mutation: validate response should contain cart not found', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: 'Invalid_Cart_ID',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: ApplyCouponToCartMutation,
          variables: {
            uid: 'Invalid_Cart_ID',
            version: 106,
            code: 'FLAT10',
          },
        })
        .reply(200, cartNotFound)
        .log(console.log);
      args.query =
        'mutation {applyCouponToCart(input: {cart_id: "Invalid_Cart_ID",coupon_code: "FLAT10"}){cart{applied_coupon{code}}}}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message: 'Error: Request failed with status code 400',
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });

    it('Mutation: validate response should contain coupon is expired', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: ApplyCouponToCartMutation,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
            version: 106,
            code: 'EXPIRED',
          },
        })
        .reply(200, inExpiredCouponCode)
        .log(console.log);
      args.query =
        'mutation {applyCouponToCart(input: {cart_id: "1cafee87-9cc2-4e3b-bc05-662b8594a5e7",coupon_code: "EXPIRED"}){cart{applied_coupon{code}}}}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            "The discount code 'EXPIRED' is valid only from 2020-05-01T00:00:00.000Z until 2020-05-28T00:00:00.000Z",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });

    it('Mutation: validate response should contain coupon is invalid', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: ApplyCouponToCartMutation,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
            version: 106,
            code: 'INVALID',
          },
        })
        .reply(200, invalidCouponCode)
        .log(console.log);
      args.query =
        'mutation {applyCouponToCart(input: {cart_id: "1cafee87-9cc2-4e3b-bc05-662b8594a5e7",coupon_code: "INVALID"}){cart{applied_coupon{code}}}}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message: "The discount code 'INVALID' was not found.",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });

    it('Mutation: validate response should contain coupon is already exist in cart', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: ApplyCouponToCartMutation,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
            version: 106,
            code: 'FLAT10',
          },
        })
        .reply(200, couponAlreadyExist)
        .log(console.log);
      args.query =
        'mutation {applyCouponToCart(input: {cart_id: "1cafee87-9cc2-4e3b-bc05-662b8594a5e7",coupon_code: "FLAT10"}){cart{applied_coupon{code}}}}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            "The discount code 'f7e3cd2f-1cdd-4544-a16f-e3d9dfda9554' is already present in the cart.",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
    it('Mutation: validate response should contain coupon is inactive', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
          },
        })
        .reply(200, commerceVersionNumberResponse);

      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: ApplyCouponToCartMutation,
          variables: {
            uid: '1cafee87-9cc2-4e3b-bc05-662b8594a5e7',
            version: 106,
            code: 'INACTIVE',
          },
        })
        .reply(200, inActiveCouponCode)
        .log(console.log);
      args.query =
        'mutation {applyCouponToCart(input: {cart_id: "1cafee87-9cc2-4e3b-bc05-662b8594a5e7",coupon_code: "INACTIVE"}){cart{applied_coupon{code}}}}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            "The discount code '1767d4c8-b692-43df-b5a1-2a6b063f95e4' is not active.",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
