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

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const ctHost = require('../../package.json').cthost;
const ctApiHost = require('../../package.json').ctApiHost;

/**
 * TestUtils class
 */
class TestUtils {
  //Returns CT host url
  static getCTInstance() {
    return ctHost;
  }

  //Returns CT api host url
  static getCtApiInstance() {
    return ctApiHost;
  }

  static getContextData() {
    return {
      url: this.getCTInstance(),
      context: {
        settings: {
          apiHost: this.getCtApiInstance(),
          currency: 'USD',
          country: 'USA',
          CT_PROTOCOL: 'https',
          CT_AUTH_HOST: 'CT_TEST_INSTANCE_HOSTNAME',
          CT_OAUTH_PATH: '/oauth/CT_INSTANCE_PROJECT/anonymous/token',
          CT_CUSTOMER_OAUTH_PATH: 'CT_TEST_INSTANCE_OAUTH_PATH',
          CT_CLIENTSECRET: 'CT_TEST_INSTANCE_CLIENTSECRET',
          CT_CLIENTID: 'CT_TEST_INSTANCE_CLIENTID',
          bearer: 'RnbiQfaFcWXElStux1Zwc1HgijsagKIj',
          defaultRequest: {
            url: this.getCtApiInstance(),
            method: 'post',
            headers: {
              Authorization: `Bearer RnbiQfaFcWXElStux1Zwc1HgijsagKIj`,
            },
          },
        },
      },
    };
  }
  /**
   * Returns Bearer token for signed in customer
   * @returns {Promise<request.Response>}
   */
  static getBearer() {
    return chai
      .request(TestUtils.getCTInstance())
      .post(
        'oauth/CT_INSTANCE_PROJECT/customers/token?grant_type=password&username=test@example.com&password=Password@123&scope=manage_project:CT_INSTANCE_PROJECT'
      )
      .auth('CT_TEST_INSTANCE_CLIENTID', 'CT_TEST_INSTANCE_CLIENTSECRET')
      .then(response => response.body.access_token)
      .catch(error => error);
  }

  /**
   * Returns Bearer token for Anonymous customer
   * @returns {Promise<string>}
   */
  static getOAuthClientBearer() {
    return chai
      .request(TestUtils.getCTInstance())
      .post(
        'oauth/CT_INSTANCE_PROJECT/anonymous/token?grant_type=client_credentials'
      )
      .auth('CT_TEST_INSTANCE_CLIENTID', 'CT_TEST_INSTANCE_CLIENTSECRET')
      .then(response => response.body.access_token)
      .catch(error => error);
  }

  /**
   *  Method to get Refresh Token
   * @returns {Promise<request.Response>}
   */
  static getRefreshToken() {
    return chai
      .request(TestUtils.getCTInstance())
      .post(
        'oauth/CT_INSTANCE_PROJECT/anonymous/token?grant_type=client_credentials'
      )
      .auth('CT_TEST_INSTANCE_CLIENTID', 'CT_TEST_INSTANCE_CLIENTSECRET')
      .then(response => response.body.refresh_token)
      .catch(error => error);
  }
}
/**
 * @type {TestUtils}
 */
module.exports = TestUtils;
