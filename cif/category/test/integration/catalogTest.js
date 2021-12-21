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
const assert = require('chai').assert;
const resolve = require('../../src/resolvers/categoryResolver.js').main;
const CategoryTreeLoader = require('../../src/loaders/CategoryTreeLoader.js');
const TestUtils = require('../../../utils/TestUtils.js');
const chai = require('chai');
const { expect } = chai;
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);

describe('categoryList', function() {
  let getCategoryById;
  before(() => {
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  beforeEach(() => {
    // We "spy" all the loading functions
    getCategoryById = sinon.spy(
      CategoryTreeLoader.prototype,
      '__getCategoryById'
    );
  });

  afterEach(() => {
    getCategoryById.restore();
  });

  describe('Integration Tests', () => {
    let args = TestUtils.getContextData();

    it('Query: get categories', () => {
      args.query = `query{
                        categoryList(filters: {ids: {in: ["1"]}}) {
                          id
                          name
                          level
                          url_key
                          url_path
                          path
                          children_count
                          children {
                            id
                            name
                            level
                            url_key
                            url_path
                            path
                            children{
                              id
                              name
                              level
                              url_key
                              url_path
                              path
                            }
                          }
                        }
                    }`;

      return TestUtils.getBearer().then(accessToken => {
        args.context.settings.bearer = accessToken;
        args.categoryId = 1;
        return resolve(args).then(result => {
          console.log(result);
          assert.isUndefined(result.errors); // No GraphQL errors
          expect(result.errors).to.be.undefined;
          let category = result.data.categoryList[0];
          assert.equal(category.id, 1);
          assert.equal(category.name, 'New');

          let children = category.children;
          assert.equal(children.length, 3);
          children.forEach((subcategory, idx) => {
            if (idx === 0) {
              assert.equal(subcategory.name, 'Men');
            }
          });
        });
      });
    });

    it('Error when fetching the category data', () => {
      // Replace spy with stub
      getCategoryById.restore();
      getCategoryById = sinon
        .stub(CategoryTreeLoader.prototype, '__getCategoryById')
        .returns(Promise.reject('Connection failed'));

      args.query = `{
                        categoryList(filters: {ids: {in: ["1"]}}) {
                          id
                          name
                          level
                          url_key
                          url_path
                          path
                          children_count
                              children {
                                id
                                name
                                level
                                url_key
                                url_path
                                path
                                    children{
                                      id
                                      name
                                      level
                                      url_key
                                      url_path
                                      path
                                    }
                              }
                        }
                    }`;
      return resolve(args).then(result => {
        expect(result.errors).to.have.lengthOf.above(0);
        assert.equal(result.errors[0].message, 'Backend data is null');
      });
    });
  });
});
