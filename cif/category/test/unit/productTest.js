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
const assert = require('chai').assert;
const { expect } = chai;
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);
const resolve = require('../../src/resolvers/categoryResolver.js').main;
const ctGetProductsResponse = require('../resources/getProducts.json');
const TestUtils = require('../../../utils/TestUtils.js');
const ProductsQuery = require('./../../src/graphql/products.graphql.js');
const CategoryListQuery = require('./../../src/graphql/categoryList.graphql.js');
const ctGetCategoryResponse = require('../resources/getCategory.json');
const ctProductUrlKeyResponse = require('../resources/ctProductUrlKeyResponse.json');
const ctProductUrlKey1Response = require('../resources/ctProductUrlKeys1Response.json');
const ctProductsInvalidSkuResponse = require('../resources/ctProductsInvalidSku.json');
const mProductsInvalidSkuResponse = require('../resources/mProductsInvalidSku.json');
const ctProductsInvalidUrlkeyResponse = require('../resources/ctProductsInvalidUrlkey.json');
const mProductsInvalidUrlkeyResponse = require('../resources/mProductsInvalidUrlkey.json');
const mProductsResponse = require('../resources/mProducts.json');

describe('GetProducts', function() {
  const scope = nock('https://api.commercetools.example.com', {
    reqheaders: {
      Authorization: TestUtils.getContextData().context.settings.defaultRequest
        .headers.Authorization,
    },
  });

  before(() => {
    // Disable console debugging
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  describe('Unit Tests', () => {
    let args = TestUtils.getContextData();

    it('Query: response should return products with filtered skus', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ProductsQuery,
          variables: {
            skus: ['A0E2000000022N9'],
            sort: 'masterData.current.name.en asc',
          },
        })
        .reply(200, ctGetProductsResponse);

      args.query =
        'query {products(currentPage:1,pageSize:6,filter:{sku:{in: ["A0E2000000022N9"] }},sort:{name:ASC}){total_count,items{__typename,sku,name,small_image{url},url_key,url_path,url_rewrites{url},price_range{minimum_price{regular_price{value,currency},final_price{value,currency},discount{amount_off,percent_off}}},... on ConfigurableProduct{price_range{maximum_price{regular_price{value,currency},final_price{value,currency},discount{amount_off,percent_off}}}},... on BundleProduct{price_range{maximum_price{regular_price{value,currency},final_price{value,currency},discount{amount_off,percent_off}}}},staged},aggregations{options{count,label,value},attribute_code,count,label}}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mProductsResponse.data);
      });
    });

    it('Query: response should return products with selected categories id', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CategoryListQuery,
          variables: {
            whereQuery: 'externalId=1',
          },
        })
        .reply(200, ctGetCategoryResponse)
        .log(console.log);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ProductsQuery,
          variables: {
            whereQuery:
              'masterData(current(categories(id="73f64d48-ab66-4baa-b961-6b19e0637760")))',
            sort: 'masterData.current.name.en asc',
            limit: 6,
            offset: 1,
          },
        })
        .reply(200, ctGetProductsResponse);

      args.query =
        'query {products(currentPage:1,pageSize:6,filter:{ category_uid: {eq:"1" }},sort:{name:ASC}){total_count,items{__typename,sku,name,small_image{url},url_key,url_path,url_rewrites{url},price_range{minimum_price{regular_price{value,currency},final_price{value,currency},discount{amount_off,percent_off}}},... on ConfigurableProduct{price_range{maximum_price{regular_price{value,currency},final_price{value,currency},discount{amount_off,percent_off}}}},... on BundleProduct{price_range{maximum_price{regular_price{value,currency},final_price{value,currency},discount{amount_off,percent_off}}}},staged},aggregations{options{count,label,value},attribute_code,count,label}}}';

      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mProductsResponse.data);
      });
    });

    it('Query: response should return products with filtered url key', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ProductsQuery,
          variables: {
            whereQuery:
              'masterData(current(slug(en="liujo-bag-medium-A15085E0087-olive")))',
            sort: 'masterData.current.name.en asc',
          },
        })
        .reply(200, ctGetProductsResponse);

      args.query =
        'query {products(currentPage:1,pageSize:6,filter:{ url_key:{eq:"liujo-bag-medium-A15085E0087-olive"} },sort:{name:ASC}){total_count,items{__typename,sku,name,small_image{url},url_key,url_path,url_rewrites{url},price_range{minimum_price{regular_price{value,currency},final_price{value,currency},discount{amount_off,percent_off}}},... on ConfigurableProduct{price_range{maximum_price{regular_price{value,currency},final_price{value,currency},discount{amount_off,percent_off}}}},... on BundleProduct{price_range{maximum_price{regular_price{value,currency},final_price{value,currency},discount{amount_off,percent_off}}}},staged},aggregations{options{count,label,value},attribute_code,count,label}}}';

      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mProductsResponse.data);
      });
    });

    it('Query: response should return products with filtered array of url key', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ProductsQuery,
          variables: {
            whereQuery:
              'masterData(current(slug(en="liujo-bag-medium-A15085E0087-olive")))',
          },
        })
        .reply(200, ctProductUrlKey1Response);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ProductsQuery,
          variables: {
            whereQuery:
              'masterData(current(slug(en="daniele-alessandrini-tshirt-M5618E6283506-black")))',
          },
        })
        .reply(200, ctProductUrlKeyResponse);
      args.variables = {
        urlKeys: [
          'liujo-bag-medium-A15085E0087-olive',
          'daniele-alessandrini-tshirt-M5618E6283506-black',
        ],
      };

      args.query =
        'query GetProductThumbnailsByURLKey($urlKeys:[String!]!){products(filter:{url_key:{in:$urlKeys}}){items{id sku thumbnail{label url __typename}url_key url_suffix ...on ConfigurableProduct{variants{product{sku id thumbnail{label url __typename}__typename}__typename}__typename}__typename}__typename}}';

      return resolve(args).then(result => {
        let response = result.data;
        console.log(response);
      });
    });

    it('Query: response should return the empty array for invalid sku ', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ProductsQuery,
          variables: {
            skus: ['A0E2000000022N'],
            sort: 'masterData.current.name.en asc',
          },
        })
        .reply(200, ctProductsInvalidSkuResponse);

      args.query = `query { products( filter: { sku: {eq:"A0E2000000022N"} }, sort: { name: ASC } ) {items { name, url_key, staged, sku, small_image{  url, label } price_range { minimum_price { regular_price { value, currency} final_price {value, currency}discount {amount_off, percent_off}} }}}}`;
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mProductsInvalidSkuResponse);
      });
    });
    it('Query: response should return the empty array for invalid url key ', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ProductsQuery,
          variables: {
            whereQuery:
              'masterData(current(slug(en="liujo-bag-medium-A15085E0087")))',
            sort: 'masterData.current.name.en asc',
          },
        })
        .reply(200, ctProductsInvalidUrlkeyResponse);

      args.query = `query { products( filter: { url_key:{eq:"liujo-bag-medium-A15085E0087"} }, sort: { name: ASC } ) {items { name, url_key, staged, sku, small_image{  url, label } price_range { minimum_price { regular_price { value, currency} final_price {value, currency}discount {amount_off, percent_off}} }}}}`;
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mProductsInvalidUrlkeyResponse);
      });
    });
  });
});
