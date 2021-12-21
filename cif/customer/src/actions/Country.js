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

const LoaderProxy = require('../../../common/LoaderProxy.js');
const CountryLoader = require('../loaders/CountryLoader.js');

class Country {
  /**
   * @param {Object} parameters parameter object contains the graphqlContext, actionParameters & access token
   * @param {Object} [parameters.countryCode] contains country code
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example countryId, bearer token, query and url info.
   */
  constructor(parameters) {
    this.actionParameters = parameters.actionParameters;
    this.countryCode = parameters.countryCode;
    this.getCountryLoader = new CountryLoader(parameters.actionParameters);
    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  /**
   * method used to call load method of getCountryIdLoader class
   */
  __load() {
    return this.getCountryLoader.load(this.actionParameters);
  }

  /**
   * method used to convert getCountryIdLoader CT data into magento GraphQL response
   * @param {*} data parameter data contains the generateCountryToken(AccessToken+CountryID) data
   */
  __convertData(data) {
    return {
      response: this.countries(data),
      responseCountry: this.countries(data).find(
        ({ id }) => id === this.countryCode
      ),
    };
  }
  countries(data) {
    return data.map(zone => {
      return {
        id: zone.locations[3].country,
        full_name_english: zone.name,
        two_letter_abbreviation: zone.locations[3].country,
        available_regions: this.available_regions(zone.locations[3].state),
      };
    });
  }
  available_regions(stateJSON) {
    if (!stateJSON) return [];
    else {
      try {
        const state = JSON.parse(stateJSON);
        return state.map(({ id, name, code }) => {
          return {
            id,
            code,
            name,
          };
        });
      } catch (ex) {
        return [];
      }
    }
  }
}

/**
 * @type {Country}
 */
module.exports = Country;
