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
const ctProductsSearchResponse = require('../resources/ctProductSearchResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const ProductsSearchQuery = require('./../../src/graphql/productsSearch.graphql.js');
const CategoryListQuery = require('./../../src/graphql/categoryList.graphql.js');
const ctGetCategoryResponse = require('../resources/getCategory.json');
const mProductsSearchResponse = require('../resources/mProductsSearchResponse.json');
const ctInvalidProductSearchTermResponse = require('../resources/ctInvalidProductSearchTerm.json');
const mInvalidProductsSearchTermResponse = require('../resources/mInvalidProductSearchTerm.json');
const ctInvalidCategoryIdProductSearchResponse = require('../resources/ctInvalidCategoryIdProductSearch.json');
const mInvalidCategoryIdProductSearchResponse = require('../resources/mInvalidCategoryIdProductSearch.json');

describe('ProductsSearch', function() {
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

    it('Query: response should return products based on search term', () => {
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
          query: ProductsSearchQuery,
          variables: {
            search: 'blazer',
            limit: 20,
            offset: 1,
            id: '73f64d48-ab66-4baa-b961-6b19e0637760',
            locale: 'en',
          },
        })
        .reply(200, ctProductsSearchResponse);
      args.variables = {
        searchTerm: 'blazer',
        page: 1,
        pageSize: 20,
        sort: {
          name: 'ASC',
        },
        filter: {
          category_uid: {
            eq: '1',
          },
        },
      };
      args.query =
        'query productSearch($pageSize:Int!$sort:ProductAttributeSortInput!$page:Int!$searchTerm:String!$filter:ProductAttributeFilterInput){products(pageSize:$pageSize sort:$sort currentPage:$page search:$searchTerm filter:$filter){page_info{total_pages __typename}total_count items{__typename id uid sku name thumbnail{url __typename}url_key updated_at price_range{minimum_price{final_price{currency value __typename}__typename}__typename}}__typename}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mProductsSearchResponse.data);
      });
    });
    it('Query: validate incorrect search term with empty response array', () => {
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
          query: ProductsSearchQuery,
          variables: {
            search: 'bla',
            limit: 20,
            offset: 1,
            id: '73f64d48-ab66-4baa-b961-6b19e0637760',
            locale: 'en',
          },
        })
        .reply(200, ctInvalidProductSearchTermResponse);
      args.variables = {
        searchTerm: 'bla',
        page: 1,
        pageSize: 20,
        sort: {
          name: 'ASC',
        },
        filter: {
          category_uid: {
            eq: '1',
          },
        },
      };
      args.query =
        'query productSearch($pageSize:Int!$sort:ProductAttributeSortInput!$page:Int!$searchTerm:String!$filter:ProductAttributeFilterInput){products(pageSize:$pageSize sort:$sort currentPage:$page search:$searchTerm filter:$filter){page_info{total_pages __typename}total_count items{__typename id uid sku name thumbnail{url __typename}url_key updated_at price_range{minimum_price{final_price{currency value __typename}__typename}__typename}}__typename}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(
          mInvalidProductsSearchTermResponse.data
        );
      });
    });
    it('Query: validate invalid category id with empty response array', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CategoryListQuery,
          variables: {
            whereQuery: 'externalId=100',
          },
        })
        .reply(200, ctGetCategoryResponse)
        .log(console.log);

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: ProductsSearchQuery,
          variables: {
            search: 'blazer',
            limit: 20,
            offset: 1,
            id: '73f64d48-ab66-4baa-b961-6b19e0637760',
            locale: 'en',
          },
        })
        .reply(200, ctInvalidCategoryIdProductSearchResponse);
      args.variables = {
        searchTerm: 'blazer',
        page: 1,
        pageSize: 20,
        sort: {
          name: 'ASC',
        },
        filter: {
          category_uid: {
            eq: '100',
          },
        },
      };
      args.query =
        'query productSearch($pageSize:Int!$sort:ProductAttributeSortInput!$page:Int!$searchTerm:String!$filter:ProductAttributeFilterInput){products(pageSize:$pageSize sort:$sort currentPage:$page search:$searchTerm filter:$filter){page_info{total_pages __typename}total_count items{__typename id uid sku name thumbnail{url __typename}url_key updated_at price_range{minimum_price{final_price{currency value __typename}__typename}__typename}}__typename}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(
          mInvalidCategoryIdProductSearchResponse.data
        );
      });
    });
  });
});
