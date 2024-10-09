# Life Event Ordering Service - Headless eCommerce with Dynamics

The Life Event Ordering Service is intending to use Dynamics eCommerce with a headless approach to provide a seamless experience for users to order services and products. The service will be able to communicate with the Microsoft Commerce Server to retrieve product information and allow users to order products and services. The service will also be able to communicate with the One Login service to authenticate users and retrieve user information.

## Prerequisites
Node.js and npm are required to run this project. You can download them from https://nodejs.org/en/download/.
A dynamics 365 commerce environment is required to run the e-commerce functionality. We are using Commerce Scale Unit (CSU) for the trial environment. This is configured in the default.yaml file.
A OneLogin account is required to run the OneLogin functionality. The client_id and private key are required to be configured in the default.yaml file. The public key is held within the OneLogin service definition.

## Project Structure
The project is structured as follows:
  - controllers: Contains the controllers for the project
  - services: Contains the services for the project
  - routes: Contains the routes for the project
  - models: Contains the models for the project
  - middleware: Contains the middleware for the project
  - config: Contains the configuration for the project
  - app.js: The entry point for the project

## Installing and running

```
$> npm install
$> npm start
```

Then open http://localhost:3000/ in a browser.

## Unit Tests

To run unit tests:

```
$> npm run test:unit
```

## Linting 
Lint will flag programming errors, bugs, stylistic errors and suspicious constructs.
To lint the project run:

```
$> npm run lint
```

## Code Formatting
Prettier will correctly format your code to configurable standards.
To format the code run:
```
$> npm run prettier
```



## Configuring

## One Login Sign In

To use this app against the One Login service requires the client_id value for your Service - managed through the GDS or Admin tool - to be configured in the default.yaml file.
It aslo requires the private key that is used to sign JWT tokens when calls are made to the /authorize endpoint for initiating the sign-in journey. The corresponding public key is held within the One Login service definition.

## E-Commerce

In order to communicate with the Microsoft Commerce Server, an access token must be obtained using a client credentials request, utilising the application registration client details configured in MS Entra in conjunction with Microsoft's Authenticaltion Library. The following paramaters need to be defined correctly in default.yaml to facilitate authentication:

e-commerce section
  - client_id: "<client-id>"
  - tenant_id: "<tennant-id>"
  - authority:  "https://login.microsoftonline.com/"
  - client_secret: "<client-secret>"
  - retail_server_url: "<retailserver-url>"

The Typescript Proxy npm packages provided by Microsoft has been loaded from the @msdyn365-commerce registry at https://pkgs.dev.azure.com/commerce-partner/Registry/_packaging/dynamics365-commerce/npm/registry/

Example calls have been made to the Typescript Proxy API in the commerce.js controller to learn how to make the calls and to look at their return values from our trial e-Commerce environment.  The calls made during trial spikes include the following methods:

- searchAsync, getByIdAsync, getByIdsAsync from @msdyn365-commerce/retail-proxy/dist/DataActions/ProductsDataActions.g.
- createCreateInput, createCustomerAsync, getOrderHistoryAsync, getOrderShipmentsHistoryAsync from @msdyn365-commerce/retail-proxy/dist/DataActions/CustomersDataActions.g.
- createCartAsync, readAsync, addCartLinesAsync, removeCartLinesAsync, checkoutAsync from @msdyn365-commerce/retail-proxy/dist/DataActions/CartsDataActions.g.