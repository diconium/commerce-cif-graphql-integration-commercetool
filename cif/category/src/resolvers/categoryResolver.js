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
const { CategoryTree } = require('../../../common/Catalog.js');
const Products = require('../../../common/Products.js');
let cachedSchema = null;

/**
 * Category resolver
 * @param args
 * @returns {Promise<ExecutionResult<ExecutionResultDataDefault>>}
 */
function resolve(args) {
  if (cachedSchema == null) {
    let schemaBuilder = new SchemaBuilder()
      .removeMutationType()
      .filterQueryFields(new Set(['products', 'categoryList', 'categories']));

    cachedSchema = schemaBuilder.build();
  }

  let resolvers = {
    /**
     * method used to get the category list
     * @param {Object} params parameter contains filter,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    categoryList: (params, context) => {
      return [
        new CategoryTree({
          filters: params.filters,
          graphqlContext: context,
          actionParameters: args,
          params,
        }),
      ];
    },
    /**
     * method used to get the category list
     * @param {Object} params parameter contains filter,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    categories: (params, context) => {
      return new CategoryTree({
        filters: params.filters,
        params,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to get the products
     * @param {Object} params parameter contains filter,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    products: (params, context) => {
      return new Products({
        filters: params.filter,
        sort: params.sort,
        search: params.search,
        limit: params.pageSize,
        offset: params.currentPage,
        graphqlContext: context,
        actionParameters: args,
      });
    },
  };

  /**
   * The resolver for this action
   * @param {cachedSchema} cachedSchema parameter contains the catched schema of GraphQL
   * @param {Object} query parameter contains the query of GraphQL
   * @param {cachedSchema} resolvers parameter resolvers of the particular action
   * @param {Object} context parameter contains the context of GraphQL
   * @param {cachedSchema} variables parameter contains the variables of GraphQL
   * @param {Object} operationName parameter contains the operationName of GraphQL context.
   * @returns {Promise} a promise resolves and return the response.
   */
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
