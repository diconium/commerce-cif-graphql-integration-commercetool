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
const nock = require('nock');
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);
const resolve = require('../../src/resolvers/customerResolver.js').main;
const ctCustomerLoaderReponse = require('../resources/ctCustomerLoader.json');
const TestUtils = require('../../../utils/TestUtils.js');
const GetCustomerQuery = require('./../../src/graphql/getCustomer.graphql');

describe('getCustomer', function() {
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

    it('Query: validate response should always get the signed in customer and order details', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCustomerQuery,
        })
        .reply(200, ctCustomerLoaderReponse);
      args.variables = {
        filter: {
          number: {
            match: '',
          },
        },
        pageSize: 10,
      };
      args.query =
        'query GetCustomerOrders($filter:CustomerOrdersFilterInput,$pageSize:Int!){customer{id orders(filter:$filter,pageSize:$pageSize){...CustomerOrdersFragment __typename}__typename}}fragment CustomerOrdersFragment on CustomerOrders{items{billing_address{city country_code firstname lastname postcode region street telephone __typename}id invoices{id __typename}items{id product_name product_sale_price{currency value __typename}product_sku product_url_key selected_options{label value __typename}quantity_ordered __typename}number order_date payment_methods{name type additional_data{name value __typename}__typename}shipments{id tracking{number __typename}__typename}shipping_address{city country_code firstname lastname postcode region street telephone __typename}shipping_method status total{discounts{amount{currency value __typename}__typename}grand_total{currency value __typename}subtotal{currency value __typename}total_shipping{currency value __typename}total_tax{currency value __typename}__typename}__typename}page_info{current_page total_pages __typename}total_count __typename}';
      return resolve(args).then(result => {
        let response = result.data;
        console.log(response);
      });
    });
    it('Query: validate response should always get the signed in customer and searched order details', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: GetCustomerQuery,
          variables: {
            where: 'orderNumber="13e4375c-bd82-4796-8279-377907e3959f"',
          },
        })
        .reply(200, ctCustomerLoaderReponse);
      args.variables = {
        filter: {
          number: {
            match: '13e4375c-bd82-4796-8279-377907e3959f',
          },
        },
        pageSize: 10,
      };
      args.query =
        'query GetCustomerOrders($filter:CustomerOrdersFilterInput,$pageSize:Int!){customer{id orders(filter:$filter,pageSize:$pageSize){...CustomerOrdersFragment __typename}__typename}}fragment CustomerOrdersFragment on CustomerOrders{items{billing_address{city country_code firstname lastname postcode region street telephone __typename}id invoices{id __typename}items{id product_name product_sale_price{currency value __typename}product_sku product_url_key selected_options{label value __typename}quantity_ordered __typename}number order_date payment_methods{name type additional_data{name value __typename}__typename}shipments{id tracking{number __typename}__typename}shipping_address{city country_code firstname lastname postcode region street telephone __typename}shipping_method status total{discounts{amount{currency value __typename}__typename}grand_total{currency value __typename}subtotal{currency value __typename}total_shipping{currency value __typename}total_tax{currency value __typename}__typename}__typename}page_info{current_page total_pages __typename}total_count __typename}';
      return resolve(args).then(result => {
        let response = result.data;
        console.log(response);
      });
    });
  });
});
