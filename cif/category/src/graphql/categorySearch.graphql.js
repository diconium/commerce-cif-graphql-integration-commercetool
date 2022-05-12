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
const CategorySearchQuery = `query CategorySearch(
    $fulltext: LocalizedText
    $limit: Int
    $offset: Int
  ) {
    categorySearch(
      fulltext: $fulltext
      limit: $limit
      offset: $offset
    ) {
      offset
      count
      total
      results {
        id
        name(locale: "en")
        version
        description(locale: "en")
        slug(locale: "en")
        externalId
        createdAt
        product_count: stagedProductCount
        children {
          id
          name(locale: "en")
          externalId
          description(locale: "en")
          slug(locale: "en")
          product_count: stagedProductCount
          children {
            id
            name(locale: "en")
            externalId
            description(locale: "en")
            slug(locale: "en")
            product_count: stagedProductCount
          }
        }
      }
    }
  }
  `;
module.exports = CategorySearchQuery;
