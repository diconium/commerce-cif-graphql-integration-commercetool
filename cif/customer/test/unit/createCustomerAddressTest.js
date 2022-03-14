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
const { expect } = chai;
const nock = require('nock');
const assert = require('chai').assert;
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);
const resolve = require('../../src/resolvers/customerResolver.js').main;
const ctVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');
const ctCreateCustomerAddressResponse = require('../resources/ctCreateCustomerAddressResponse.json');
const mCreateCustomerAddressResponse = require('../resources/mCreateCustomerAddressResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const ctInvalidVersionNumberResponse = require('../resources/ctInvalidVersionNumber.json');
const VersionCustomerQuery = require('../../src/graphql/version.grapql.js');
const CreateCustomerAddressMutation = require('../../src/graphql/createCustomerAddress.graphql');

describe('CreateCustomerAddress', function() {
  const scope = nock('https://api.europe-west1.gcp.commercetools.com', {
    reqheaders: {
      Authorization: TestUtils.getContextData().context.settings.defaultRequest
        .headers.Authorization,
    },
  });

  before(() => {
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  describe('Unit Tests', () => {
    let args = TestUtils.getContextData();

    it('Mutation: validate response should create customer address', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCustomerQuery,
        })
        .reply(200, ctVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CreateCustomerAddressMutation,
          variables: {
            city: 'Austin',
            version: 106,
            firstName: 'Bob',
            lastName: 'Roll',
            company: 'Magento',
            streetName: 'Magento Street',
            region: 'US-WA',
            postalCode: '78758',
            country: 'US',
            phone: '9999998899',
          },
        })
        .reply(200, ctCreateCustomerAddressResponse);
      args.variables = {
        region: {
          region_code: 'US-WA',
          region_id: 'US-WA',
        },
        firstname: 'Bob',
        lastname: 'Roll',
        city: 'Austin',
        company: 'Magento',
        country_code: 'US',
        postcode: '78758',
        telephone: '9999998899',
        street: ['Magento Street'],
        default_shipping: true,
        default_billing: false,
      };

      args.query =
        'mutation($city:String,$company:String,$country_code:CountryCodeEnum,$default_billing:Boolean,$default_shipping:Boolean,$firstname:String,$lastname:String,$postcode:String,$region:CustomerAddressRegionInput,$street:[String],$telephone:String){createCustomerAddress(input:{city:$city, company:$company ,country_code:$country_code, default_billing:$default_billing ,default_shipping:$default_shipping,firstname:$firstname ,lastname:$lastname ,postcode:$postcode ,region:$region ,street:$street ,telephone:$telephone}){id ,city,company ,country_code ,default_billing ,default_shipping, firstname ,lastname ,postcode ,region{region_code}street,telephone }}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(mCreateCustomerAddressResponse.data);
      });
    });

    it('Mutation: validate response should return invalid version number', () => {
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: VersionCustomerQuery,
        })
        .reply(200, ctInvalidVersionNumberResponse);
      scope
        .post('/adobeio-ct-connector/graphql', {
          query: CreateCustomerAddressMutation,
          variables: {
            city: 'Austin',
            version: 106,
            firstName: 'Bob',
            lastName: 'Roll',
            company: 'Magento',
            streetName: 'Magento Street',
            region: 'US-WA',
            postalCode: '78758',
            country: 'US',
            phone: '9999998899',
          },
        })
        .reply(200, ctCreateCustomerAddressResponse);
      args.variables = {
        region: {
          region_code: 'US-WA',
          region_id: 'US-WA',
        },
        firstname: 'Bob',
        lastname: 'Roll',
        city: 'Austin',
        company: 'Magento',
        region_code: 'US-WA',
        country_code: 'US',
        postcode: '78758',
        telephone: '9999998899',
        street: ['Magento Street'],
        default_shipping: true,
        default_billing: false,
      };

      args.query =
        'mutation($city:String,$company:String,$country_code:CountryCodeEnum,$default_billing:Boolean,$default_shipping:Boolean,$firstname:String,$lastname:String,$postcode:String,$region:CustomerAddressRegionInput,$street:[String],$telephone:String){createCustomerAddress(input:{city:$city, company:$company ,country_code:$country_code, default_billing:$default_billing ,default_shipping:$default_shipping,firstname:$firstname ,lastname:$lastname ,postcode:$postcode ,region:$region ,street:$street ,telephone:$telephone}){id ,city,company ,country_code ,default_billing ,default_shipping, firstname ,lastname ,postcode ,region{region_code}street,telephone }}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            'Object b596a867-e803-41cd-9f04-815b35e71c14 has a different version than expected. Expected: 120 - Actual: 55.',
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
