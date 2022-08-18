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
const GetCustomerQuery = `query GetCustomer($where: String) {
  me {
    customer {
      id
      firstname: firstName
      lastname: lastName
      email
      defaultBillingAddressId
      defaultShippingAddressId
      addresses {
        id
        firstname: firstName
        lastname: lastName
        email
        region
        country
        city
        streetName
        streetNumber
        postcode: postalCode
        telephone: phone
        country_code: country
      }
    }
    orders(where: $where) {
      results {
        number: orderNumber
        id
        status: orderState
        order_date: createdAt
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
        discountCodes {
          discountCode {
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
          shippingRate {
            price {
              type
              currencyCode
              centAmount
              fractionDigits
            }
          }
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
        taxedPrice {
          totalNet {
            type
            currencyCode
            centAmount
            fractionDigits
          }
          totalGross {
            type
            currencyCode
            centAmount
            fractionDigits
          }
          taxPortions {
            rate
            amount {
              type
              currencyCode
              centAmount
              fractionDigits
            }
          }
        }
      }
    }
  }
}

`;

module.exports = GetCustomerQuery;
