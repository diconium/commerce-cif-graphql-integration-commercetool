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
const ctGetCategoryResponse = require('../resources/getCategory.json');
const TestUtils = require('../../../utils/TestUtils.js');
const CategoryListQuery = require('./../../src/graphql/categoryList.graphql.js');
const ctCategoryInvalidUrlkeyResponse = require('../resources/ctCategoryInvalidUrlkey.json');
const ctCategoryInvalidCategoryIdResponse = require('../resources/ctCategoryInvalidCategoryId.json');
const mCategoryInvalidCategoryId = require('../resources/mCategoryInvalidCategoryId.json');
const mCategoryInvalidUrlkey = require('../resources/mCategoryInvalidUrlkey.json');

describe('GetCategories', function() {
  const scope = nock('https://api.europe-west1.gcp.commercetools.com', {
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

    it('Query: response should return category array', () => {
      args.query =
        '{categoryList(filters:{category_uid:{eq:"1"}}){uid,description,name,image,product_count,meta_description,meta_keywords,meta_title,url_key,url_path,staged}}';

      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CategoryListQuery,
          variables: {
            whereQuery: 'externalId=1',
          },
        })
        .reply(200, ctGetCategoryResponse)
        .log(console.log);

      return resolve(args).then(result => {
        assert.isUndefined(result.errors);
        let response = result.data.categoryList[0];
        assert.equal(response.uid, 1);
        assert.equal(response.name, 'New');
      });
    });

    it('Query: response should return category array with filtered slug', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CategoryListQuery,
          variables: {
            whereQuery: 'slug(en="new")',
          },
        })
        .reply(200, ctGetCategoryResponse)
        .log(console.log);

      args.query =
        '{categoryList(filters:{url_key:{eq:"new"}}){uid,description,name,image,product_count,meta_description,meta_keywords,meta_title,url_key,url_path,staged}}';

      return resolve(args).then(result => {
        assert.isUndefined(result.errors);
        let response = result.data.categoryList[0];
        assert.equal(response.uid, 1);
        assert.equal(response.name, 'New');
      });
    });

    it('Query: validate invalid url key with empty response', () => {
      args.query =
        '{categories(filters:{url_key:{eq:"ne"}},pageSize:20 ,currentPage:1){total_count page_info{current_page page_size total_pages}items{uid name url_key url_path children_count children{uid name url_key url_path children_count meta_title meta_description}}}}';
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CategoryListQuery,
          variables: {
            whereQuery: 'slug(en="ne")',
          },
        })
        .reply(200, ctCategoryInvalidUrlkeyResponse)
        .log(console.log);

      return resolve(args).then(result => {
        const response = result;
        expect(response).to.deep.equals(mCategoryInvalidUrlkey);
      });
    });

    it('Query: validate invalid category id with empty response', () => {
      args.query = `{categoryList(filters:{category_uid:{eq:"220"}}){uid,name,url_path,url_key,children_count,children{uid,name,url_path,url_key,children_count}}}`;
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CategoryListQuery,
          variables: {
            whereQuery: 'externalId=220',
          },
        })
        .reply(200, ctCategoryInvalidCategoryIdResponse)
        .log(console.log);

      return resolve(args).then(result => {
        const errors = result;
        expect(errors).to.deep.equals(mCategoryInvalidCategoryId);
      });
    });
  });
});
