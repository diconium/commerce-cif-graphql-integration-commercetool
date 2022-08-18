[![CircleCI](https://circleci.com/gh/adobe/commerce-cif-graphql-integration-reference.svg?style=svg)](https://circleci.com/gh/adobe/commerce-cif-graphql-integration-reference)
[![codecov](https://codecov.io/gh/adobe/commerce-cif-graphql-integration-reference/branch/master/graph/badge.svg)](https://codecov.io/gh/adobe/commerce-cif-graphql-integration-reference)

# 3rd-Party GraphQL integration with AEM Commerce and CIF on Adobe I/O Runtime

## 2.1 (May 12 2022)
##### ENHANCEMENTS: 
  * Changes in queries and mutations with respect to latest CIF 2.8.0 and Venia
  * Code Optimisation and improvisation on security code check
  * Category Search Functionality
  * Code Optimisation and improvisation on security code check
 ##### BUGFIXES:
  * Unit test upgrade
  * commercetool URL endpoint configuration management optimize


## 2.0 (March 14 2022)
##### ENHANCEMENTS: 
  * Latest Magento Schema Update 
  * Changes in queries and mutations with respect to latest CIF and Venia
  * Functionality for Individual Package deployments are added to store the node modules      independently with respect to each module.
  * Added Sinon Spies for data loaders in order to test function callback handing.
  * Code Optimisation and improvisation on security code check 

 ##### BUGFIXES:
  * Commerce.html, Category Picker and Product Picker components fixes as per latest Schema
  NOTE : Category Search in category picker will be implemented in the next release.  
  * Unit test upgrade
  * Introspection query changes
  * commercetool URL endpoint configuration management
  * Sonar fixes on Code smell issues.



## 1.0 (December 22, 2021)
##### ENHANCEMENTS: 
* Initial Commit of Topology design and Architecture planning of I/O Connector
* Project Creation of I/O Connector to connect commercetool and Adobe CIF using Magento Graphql Schema 2.3 version.
* Implementation of complete commerce flow from fetching products to order generation
* Schema modifications as per required input and output for different endpoints
* CIF Core components modification to fetch media based URL
* Schema Attribute changes for cart_item_id from Int to String as per commercetool data retrieval. 
* Implementation of latest Schema on I/O Connector
* Implementation of latest CIF and query API changes
* Project Execution of AEM CIF - commercetool connectivity through GraphQL API and adapting rest response from commercetool
* Implementation of complete commerce flow from fetching products to order generation

