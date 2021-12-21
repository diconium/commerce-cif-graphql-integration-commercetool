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
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);
const resolve = require('../../src/resolvers/categoryResolver.js').main;
const getCategory = require('../resources/getCategory.json');
const TestUtils = require('../../../utils/TestUtils.js');
const CategoryListQuery = require('./../../src/graphql/categoryList.graphql.js');

describe('GetCategories', function() {
  const scope = nock('https://CT_INSTANCE_HOSTNAME', {
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
      args.query = `{categoryList(filters:{category_uid:{eq:"1"}}){uid,name,url_path,url_key,children_count,children{uid,name,url_path,url_key,children_count}}}`;
      // args.categoryId = 1;

      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: CategoryListQuery,
          variables: {
            whereQuery: 'externalId=1',
          },
        })
        .reply(200, getCategory)
        .log(console.log);

      return resolve(args).then(result => {
        assert.isUndefined(result.errors);
        let response = result.data.categoryList[0];
        assert.equal(response.uid, 1);
        assert.equal(response.name, 'New');
        let children = response.children;
        assert.equal(children.length, 3);
      });
    });
  });
});
