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

const CategoryTreeLoader = require('../category/src/loaders/CategoryTreeLoader.js');
const ProductsLoader = require('../category/src/loaders/ProductsLoader.js');
const LoaderProxy = require('./LoaderProxy.js');

// This module contains 3 classes because they have cross/cyclic dependencies to each other
// and it's not possible to have them in separate files because this is not supported by Javascript

class Products {
  /**
   * @param {Object} parameters
   * @param {String} parameters.categoryId The category id.
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example authentication info.
   * @param {CategoryTreeLoader} [parameters.categoryTreeLoader] An optional CategoryTreeLoader, to optimise caching.
   * @param {ProductsLoader} [parameters.productsLoader] An optional ProductsLoader, to optimise caching.
   * @param {categoryLevel} Increment this flag for every subcat level and passed to mage.
   * @param {urlPath} Concat all the slug like breadcrumbs.
   * @param {cpath} Concat all the category id like breadcrumbs.
   */
  constructor(parameters) {
    this.graphqlContext = parameters.graphqlContext;
    this.parameters = parameters;
    this.filters = { ...parameters.filters };
    this.actionParameters = parameters.actionParameters;
    this.categoryTreeLoader = new CategoryTreeLoader(parameters);
    this.productsLoader = new ProductsLoader(parameters);

    if (parameters.filters && parameters.filters.category_uid) {
      this.categoryId = parameters.filters.category_uid.eq;
    }
    if (parameters.filters && parameters.filters.url_key) {
      this.product_url = parameters.filters.url_key.eq;
    }
    if (parameters.filters && parameters.filters.sku) {
      this.product_url = parameters.filters.sku.eq || parameters.filters.sku.in;
    }
    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  __load() {
    console.debug(`Loading category for ${this.categoryId}`);
    if (this.categoryId)
      return this.categoryTreeLoader.load(this.categoryId).then(({ id }) => {
        return this.productsLoader.load(id);
      });
    else return this.productsLoader.load(this.product_url);
  }

  /**
   * Converts some category data from the 3rd-party commerce system into the Magento GraphQL format.
   * Properties that require some extra data fetching with the 3rd-party system must have dedicated getters
   * in this class.
   *
   * @param {Object} data
   * @returns {Object} The backend category data converted into a GraphQL "CategoryTree" data.
   */
  __convertData(data) {
    const items = data.results.map(
      product =>
        new Product({
          productData: product,
        })
    );
    return {
      items,
      total_count: data.total,
      page_info: {
        total_pages: Math.ceil(data.total / this.parameters.limit),
      },
    };
  }
}
class Product {
  constructor(parameters) {
    this.productData = parameters.productData;
    return new LoaderProxy(this);
  }

  get __typename() {
    return 'SimpleProduct';
  }
  __load() {
    return Promise.resolve(this.productData);
  }
  __convertData(data) {
    const product = data.masterData ? data.masterData.current : data;
    return {
      uid: data.id,
      id: product.masterVariant.id,
      name: product.name,
      url_key: product.slug,
      sku: product.masterVariant.sku,
      staged: false,
      thumbnail: {
        url:
          product.masterVariant.images &&
          product.masterVariant.images.length > 0
            ? product.masterVariant.images[0].url
            : '',
        label: product.name,
      },
      small_image: {
        url:
          product.masterVariant.images &&
          product.masterVariant.images.length > 0
            ? product.masterVariant.images[0].url
            : '',
        label: product.name,
      },
      price_range: {
        minimum_price: {
          regular_price: {
            value: product.masterVariant.price.value.centAmount,
            currency: 'EUR',
          },
          final_price: {
            value: product.masterVariant.price.value.centAmount,
            currency: 'EUR',
          },
          discount: {
            amount_off: 0,
            percent_off: 0,
          },
        },
      },
    };
  }
  /**
   * media_gallery type is interface can't return data directly so created MediaGallery Interface to return Data
   * @returns {*}
   */
  get media_gallery() {
    const product = this.productData.masterData
      ? this.productData.masterData.current
      : this.productData;
    return product.masterVariant.images
      ? product.masterVariant.images.map(
          (image, index) =>
            new MediaGallery({
              position: index,
              url: image.url,
              disabled: false,
              label: image.altText || '',
            })
        )
      : [];
  }
}
class MediaGallery {
  /**
   * @param {Object} parameters
   * @param {String} parameters.url Url returns path of image
   * @param {Integer} parameters.position Position returns position of image .
   * @param {String} parameters.label Label returns title  of image .
   *
   */
  constructor(parameters) {
    this.image = parameters;
    return new LoaderProxy(this);
  }
  __load() {
    return Promise.resolve(this.image);
  }
  /**
   * get MediaGallery type
   * @returns {string}
   * @private
   */
  get __typename() {
    return 'ProductImage';
  }
  __convertData(data) {
    return {
      url: data.url,
    };
  }
}

module.exports = Products;
