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
const CreateCustomer = require('../actions/CreateCustomer.js');
const Customer = require('../actions/Customer.js');
const Country = require('../actions/Country.js');

const GenerateCustomerToken = require('../actions/GenerateCustomerToken.js');
const CreateCustomerAddress = require('../actions/CreateCusomerAddress.js');
let cachedSchema = null;

function resolve(args) {
  if (cachedSchema == null) {
    let schemaBuilder = new SchemaBuilder()
      .filterMutationFields(
        new Set([
          'createCustomerV2',
          'generateCustomerToken',
          'createCustomerAddress',
          'revokeCustomerToken',
        ])
      )
      .filterQueryFields(
        new Set(['customer', 'customerCart', 'countries', 'country'])
      );
    cachedSchema = schemaBuilder.build();
  }

  let resolvers = {
    /**
     * method used to create customer in commerce
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    createCustomerV2: (params, context) => {
      const { input } = params;
      return new CreateCustomer({
        input,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to revoke customer token in commerce
     */
    revokeCustomerToken: () => {
      return {
        result: true,
      };
    },
    /**
     * method used to generate customer token in commerce
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    generateCustomerToken: context => {
      return new GenerateCustomerToken({
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to get the countries in commerce
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    customer: context => {
      return new Customer({
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to get the countries in commerce
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    countries: context => {
      const countries = new Country({
        graphqlContext: context,
        actionParameters: args,
      });
      return countries.response;
    },
    /**
     * method used to get the country in commerce
     * @param {Object} params parameter contains country code,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    country: (params, context) => {
      const countries = new Country({
        countryCode: params.id,
        graphqlContext: context,
        actionParameters: args,
      });
      return countries.responseCountry;
    },
    /**
     * method used to create customer address
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    createCustomerAddress: (params, context) => {
      return new CreateCustomerAddress({
        input: params.input,
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
      return error;
    });
}

module.exports.main = resolve;
