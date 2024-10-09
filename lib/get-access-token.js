const { config } = require("hmpo-app");
var msal = require('@azure/msal-node');

const cacheLocation = config.get("e-commerce.cache_location");
const cachePlugin = require('./cachePlugin')(cacheLocation);
const runtimeOptions = null;

const getClientCredentialsToken = async (cca, clientCredentialRequestScopes, ro) => {
        // With client credentials flows permissions need to be granted in the portal by a tenant administrator.
        // The scope is always in the format "<resource>/.default"
        const clientCredentialRequest = {
            scopes: clientCredentialRequestScopes,
            azureRegion: ro ? ro.region : null, // (optional) specify the region you will deploy your application to here (e.g. "westus2")
            skipCache: false,  // (optional) this skips the cache and forces MSAL to get a new token from Azure AD
        };
    
        return await cca.acquireTokenByClientCredential(clientCredentialRequest)
            .then(authResult =>{
                if (!authResult) {
                    throw new Error('Authentication failed!')
                    //TODO should this be thrown?
                }
                return authResult;
            }
            ).catch((error) => {
                console.log(JSON.stringify(error));
                throw new Error('Authentication Error');
                //TODO should this be thrown?
            });
        };

const getAccessToken = async () =>  {
        const loggerOptions = {
            loggerCallback(loglevel, message) {
            console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Verbose,
        }

            // Build MSAL ClientApplication Configuration object
            const clientConfig = {
                auth: {
                    "clientId": config.get("e-commerce.client_id"), 
                    "authority": config.get("e-commerce.authority") + config.get("e-commerce.tenant_id"), 
                    "clientSecret": config.get("e-commerce.client_secret")
                },
                cache: {
                    cachePlugin
                },
                // Uncomment or comment the code below to enable or disable the MSAL logger respectively
                system: {
                    loggerOptions,
                }
            };
    
            // Create msal application object
            const confidentialClientApplication = new msal.ConfidentialClientApplication(clientConfig);
    
            // Execute sample application with the configured MSAL PublicClientApplication
            // const result = await this.getClientCredentialsToken(confidentialClientApplication, ["api://01ea67cf-d24b-463f-87c6-66c46ee61101/.default"], runtimeOptions);
    
            return await getClientCredentialsToken(confidentialClientApplication, 
                                                        ["api://01ea67cf-d24b-463f-87c6-66c46ee61101/.default"], 
                                                        runtimeOptions
            )
            .then(authResult =>{
                if (!authResult) {
                    throw new Error('Authentication failed!')
                    //TODO should this be thrown?
                }
                return authResult.accessToken;
            }
            ).catch((error) => {
                console.log(JSON.stringify(error));
                throw new Error('Authentication Error');
                //TODO should this be thrown?
            });
};

module.exports = { getAccessToken };
