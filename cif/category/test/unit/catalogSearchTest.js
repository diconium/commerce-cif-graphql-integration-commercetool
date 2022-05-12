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
const resolve = require('../../src/resolvers/categoryResolver.js').main;
const TestUtils = require('../../../utils/TestUtils.js');
const CategoriesQuery = require('./../../src/graphql/categories.graphql');
const CtCategoriesResponse = require('../resources/ctCategoriesResponse.json');

describe('CategorySearch', function() {
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

    it('Query: response should return category based on search term', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CategoriesQuery,
        })
        .reply(200, CtCategoriesResponse)
        .log(console.log);
      args.variables = {
        pageSize: 20,
        currentPage: 1,
        filters: {
          name: {
            match: 'Women',
          },
        },
      };
      args.query =
        'query categoryByFilterPagination($filters:CategoryFilterInput!$pageSize:Int=20$currentPage:Int=1){categories(filters:$filters pageSize:$pageSize currentPage:$currentPage){items{id image name uid url_key url_path __typename children_count}total_count __typename}}';
      return resolve(args).then(result => {
        let response = result.data;
        console.log(response);
      });
    });
  });
});
