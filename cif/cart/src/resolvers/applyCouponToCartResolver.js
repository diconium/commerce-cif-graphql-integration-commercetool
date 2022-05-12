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

const { graphql } = require('graphql');
const SchemaBuilder = require('../../../common/SchemaBuilder.js');
const ApplyCouponToCart = require('../actions/ApplyCouponToCart.js');

let cachedSchema = null;

/**
 * Apply coupon to cart resolver
 * @param args
 * @returns {Promise<ExecutionResult<ExecutionResultDataDefault>>}
 */

function resolve(args) {
  if (cachedSchema == null) {
    let schemaBuilder = new SchemaBuilder().filterMutationFields(
      new Set(['applyCouponToCart'])
    );
    cachedSchema = schemaBuilder.build();
  }

  // Builds the resolvers object
  let resolvers = {
    applyCouponToCart: (params, context) => {
      const { input } = params;
      return new ApplyCouponToCart({
        input,
        couponCode: params.input.coupon_code,
        graphqlContext: context,
        actionParameters: args,
      });
    },
  };
  // The resolver for this action
  return graphql(
    cachedSchema,
    args.query,
    resolvers,
    args.context,
    args.variables,
    args.operationName
  )
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error(error);
    });
}

module.exports.main = resolve;
