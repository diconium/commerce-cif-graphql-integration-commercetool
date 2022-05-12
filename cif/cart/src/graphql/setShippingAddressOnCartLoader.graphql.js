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

const setShippingAddress = `
  mutation(
    $uid: String!
    $version: Long!
    $firstName: String!
    $lastName: String!
    $company: String!
    $streetName: String!
    $city: String!
    $region: String!
    $postalCode: String!
    $country: String!
    $phone: String!
  ) {
    updateCart(
      uid: $uid
      version: $version
      actions: {
        setShippingAddress: {
          address: {
            firstName: $firstName
            lastName: $lastName
            company: $company
            streetName: $streetName
            city: $city
            region: $region
            postalCode: $postalCode
            country: $country
            phone: $phone
          }
        }
      }
    ) {
      shippingAddress {
        firstName
        lastName
        company
        streetName
        city
        region
        postalCode
        country
      }
    }
  }
`;

module.exports = setShippingAddress;
