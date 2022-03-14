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

const LineItemToCartMutation = `mutation UpdateCart($uid: String!, $version: Long!, $actions: [CartUpdateAction!]!) {
    updateCart(
      id: $uid
      version: $version
      actions: $actions
    ) {
      id
      totalPrice {
        centAmount
        currencyCode
      }
      paymentInfo {
        payments {
          id
          paymentMethodInfo {
            name(locale: "en")
            method
          }
        }
      }
      shippingAddress {
        id
        firstname: firstName
        lastname: lastName
        email
        region
        country
        streetName
        city
        postcode: postalCode
        telephone: phone
      }
      discountCodes{
        discountCode{
            code
            id
        }
      }
      billingAddress {
        id
        firstname: firstName
        lastname: lastName
        email
        region
        country
        streetName
        city
        postcode: postalCode
        telephone: phone
      }
      shippingInfo {
        shippingMethod {
          name
          id
        }
      }
      lineItems {
        id
        quantity
        productId
        name(locale: "en")
        slug: productSlug(locale: "en")
        variant {
          images {
            url
          }
        }
        price {
          value {
            centAmount
            currencyCode
          }
        }
      }
  } 
  }`;
module.exports = LineItemToCartMutation;