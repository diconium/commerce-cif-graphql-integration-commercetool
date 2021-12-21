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

const Options = require('./Options.js');
class InputSettings {
  constructor(args) {
    const ymlData = Options.get();
    this.CT_API_HOST = ymlData.CT_API_HOST;
    this.CT_PROTOCOL = ymlData.CT_PROTOCOL;
    this.CT_AUTH_HOST = ymlData.CT_AUTH_HOST;
    this.CT_OAUTH_PATH = ymlData.CT_OAUTH_PATH;
    this.CT_CLIENTSECRET = ymlData.CT_CLIENTSECRET;
    this.CT_CLIENTID = ymlData.CT_CLIENTID;
    this.CT_CUSTOMER_OAUTH_PATH = ymlData.CT_CUSTOMER_OAUTH_PATH;
    this.currency = ymlData.CT_CURRENCY;
    this.lang = ymlData.CT_LANG;
    this.country = ymlData.CT_COUNTRY;

    this.headers = this.extractHeaders(args);
    this.cookies = this.extractCookiesFromHeaders();
    this.bearer = this.extractBearer();
    this.customerId = this.getCustomerId();
    this.language = this.findHeaderValue('accept-language');
    this.defaultRequest = {
      url: this.CT_API_HOST,
      method: 'post',
      headers: {
        Authorization: `Bearer ${this.bearer}`,
      },
    };
  }
  extractHeaders(args) {
    if (args.__ow_headers) {
      return args.__ow_headers;
    }
    return {};
  }

  extractCookiesFromHeaders() {
    if (this.headers && this.headers.cookie) {
      const cookies = this.headers.cookie.split('; ');
      return this.getCookies(cookies);
    }
    return [];
  }

  getCookies(cookies) {
    return cookies.map(cookie => {
      const cookieObject = {};
      const cookieKeyValue = cookie.split('=');
      cookieObject[cookieKeyValue[0]] = cookieKeyValue[1];
      return cookieObject;
    });
  }

  extractBearer() {
    let bearer = this.findCookieValue('ccs-access_token');
    bearer = this.extractedFromAuthorizationHeader(bearer);
    return bearer;
  }

  findCookieValue(cookieName) {
    const cookie = this.cookies.find(cookie =>
      Object.prototype.hasOwnProperty.call(cookie, 'cookieName')
    );
    if (cookie) {
      return cookie[cookieName];
    }
    return '';
  }

  extractedFromAuthorizationHeader(bearer) {
    if (bearer === '') {
      if (this.headers && this.headers.authorization) {
        return this.getAuthorization(this.headers.authorization);
      }
    }
    return bearer;
  }

  getAuthorization(authorizationHeader) {
    if (authorizationHeader.includes('Bearer ')) {
      return authorizationHeader.split('Bearer ')[1];
    }
    return '';
  }

  getCustomerId() {
    return this.bearer ? 'current' : '';
  }

  findHeaderValue(headerName) {
    const headerValue = this.headers[headerName];
    if (headerValue) {
      return headerValue;
    }
    return '';
  }
}
module.exports = InputSettings;
