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

class helper {
  /**
   * Separates bearer token and customer id
   * @param actionParameters
   * @returns {*}
   */
  constructor(actionParameters) {
    let { bearer } = actionParameters.context.settings;
    let tokenArray = bearer.split('+');
    actionParameters.context.settings.bearer = tokenArray[0];
    actionParameters.context.settings.customerId = tokenArray[1];

    return actionParameters;
  }
}

/**
 * @type {helper}
 */
module.exports = helper;
