require('@babel/register')({
    ignore: [],
    only: [
        /src/,
        /node_modules\/@msdyn365-commerce\/retail-proxy/
    ],
    presets: ['@babel/preset-env'],
    cache: false
});

const BaseController = require("hmpo-form-wizard").Controller;
const { searchAsync, getByIdAsync, getByIdsAsync } = require('@msdyn365-commerce/retail-proxy/dist/DataActions/ProductsDataActions.g');
const { createCreateInput, createCustomerAsync, getOrderHistoryAsync, getOrderShipmentsHistoryAsync } = require('@msdyn365-commerce/retail-proxy/dist/DataActions/CustomersDataActions.g')
const { createCartAsync, readAsync, addCartLinesAsync, removeCartLinesAsync, checkoutAsync } = require('@msdyn365-commerce/retail-proxy/dist/DataActions/CartsDataActions.g');

const eCommerceTokenLib = require("../lib/get-access-token");

class CommerceController extends BaseController {

    async get(req, res, next) {
        console.log("commerce controller get");

        let token = await eCommerceTokenLib.getAccessToken();
        console.log("After getAccessToken", token);

        this.callRetailServerAPIs(token);
        super.get(req, res, next);
    }

    successHandler(req, res, next) {
        super.successHandler(req, res, next);
        console.log("commerce controller successhandler");

    }

    async callRetailServerAPIs(accessToken) {

    const recordId = 68719552887; // Example product ID
    const channelId = 68719479831; // Test online store channel ID
    const operatingUnitNumber = "277";

    const myContext = {
            requestContext: 
            {
                apiSettings: {
                    baseUrl: "",
                    channelId: channelId,
                    oun: operatingUnitNumber,
                    baseImageUrl: "",
                },
                user: {
                    token: "string",
                    isAuthenticated: true,
                },
                locale: "en-gb",
                operationId: "", 
                query: undefined, //IDictionary<string>
                params: undefined, //IRequestContextParams;
                accessToken: accessToken,
            },
        };
    
        try {
            // Investigation of methods to fetch product information from Commerce server

            // Method 1: Fetch details about a single product by ID
            console.log('Calling getByIdAsync for recordId:', recordId);
            
            const product = await getByIdAsync(myContext, recordId, channelId);
           
            console.log("Name: ", product.Name, " ItemId: ", product.ItemId , " Price: " , product.Price);

            // Method 2: Fetch details about a group of products using IDs
            const products = await getByIdsAsync(myContext, channelId, [68719552888,68719552889,68719552890], 
                                                 null,  //inventLocationId?: string |
                                                 null); //catalogId?: number | null)

            console.log('Product getByIdsAsync:', JSON.stringify(products));

            products.forEach(function (product){
                console.log('RecordId:', product.RecordId);
                console.log('ProductNumber:', product.ProductNumber);
                console.log('ItemId:', product.ItemId);
                console.log('Name:', product.Name);
                console.log('Price:', product.Price);
                console.log('MasterProductId:', product.MasterProductId);
            });

            // Method 3: Using product search API

            /* Rules deduced from error messages:
            1.  This criteria combination is not suppoted: 
                useProductIds=True; useCategoryIds=False; useItemIds=True; useKeywords=False. 
                Only one search criteria type can be specified.
        
            2.  When searching virtual catalogue products, you can search only by id, category or keyword.
            */

            var searchResult;
            var myProductSearchCriteria;

            /* Search by Category ID */
            myProductSearchCriteria = { 
                //Ids: [],
                //Ids?: number[];
                CategoryIds: [68719491845],  // from category hierarchy - record ID
                //IncludeProductsFromDescendantCategories: true, //IncludeProductsFromDescendantCategories?: boolean;
                //SearchCondition: "UltralightSuperpacke", //"Men's Backpack",
                //SkipVariantExpansion: true,
                //IncludeAttributes: true,
                //Barcodes?: string[];
                //
                //ItemIds: [{ItemId: "75001", InventDimensionId: null,  Barcode: null, ExtensionProperties: [] }],
                //Refinement?: ProductRefinerValue[];
                //CustomerAccountNumber: "00447",
                //RecommendationListId?: string;
                //DownloadProductData: false,
                //Context?: ProjectionDomain;
                //Language: "en-gb",
                //IsOnline: true
                //DataLevelValue: 1 //0 - Identity,1 - Minimal,2 - Standard,3 - Extended,4 - Complete
            }
        
            searchResult = await searchAsync(myContext, myProductSearchCriteria);
            console.log('Product searchAsync Result1:', searchResult);
            console.log('Product searchAsync Result1:', JSON.stringify(searchResult));

            console.log('Product search result length:', searchResult.length)

            searchResult.forEach(function (item){
                console.log('RecordId:', item.RecordId);
                console.log('ProductNumber:', item.ProductNumber);
                console.log('ItemId:', item.ItemId);
            });

            /* Search by Product IDs */
            myProductSearchCriteria = { 
                Ids: [68719552888,68719552889,68719552890]
                };

            searchResult = await searchAsync(myContext, myProductSearchCriteria);

            console.log('Product Result length:', searchResult.length)
            
            searchResult.forEach(function (item){
                console.log('RecordId:', item.RecordId);
                console.log('ProductNumber:', item.ProductNumber);
                console.log('ItemId:', item.ItemId);

                item.ProductProperties.forEach(function (property) {
                    property.TranslatedProperties.forEach(function (trans) {
                        console.log('TranslatedProperties KeyName:', trans.KeyName);
                        console.log('TranslatedProperties ValueString:', trans.ValueString);
                        console.log('TranslatedProperties ProductId:', trans.ProductId);
                    });
                });

                item.CompositionInformation?.VariantInformation?.Variants.forEach(function (variant) {
                    console.log('variant ItemId:', variant.ItemId);
                    console.log('variant InventoryDimensionId:', variant.InventoryDimensionId);
                    console.log('variant Size:', variant.Size);
                    console.log('variant Price:', variant.Price);
                    console.log('variant DistinctProductVariantId:', variant.DistinctProductVariantId);
                    console.log('variant ProductNumber:', variant.ProductNumber);
                });
            });


            /* Creating a customer example */
            var myCart;
            var myCustomer;
            var newCustomer;
            var myCartId;
            var myShippingAddress;

            myCustomer = {
                    FirstName: "James",
                    LastName: "Nesbett",
                    Language: "en-us",
                    Email: "user@example.com"
                };

            newCustomer = await createCustomerAsync(myContext, myCustomer);

            console.log('customer details:', newCustomer);

            /*=====================================================================================
            * Alternative ways of creating and fetching customer information.
            const dataServiceReq1 = await createCreateInput(customer1);
            console.log('createCreateInput return:', dataServiceReq1);

            const newCustomer1 = await executeAction(dataServiceReq1, myContext);
            console.log('newCustomer1 details:', newCustomer1);

            const readCustomerResult = await readAsync(myContext, newCustomer1.AccountNumber);
            console.log('readCustomerResult details: ', readCustomerResult.AccountNumber, 
                                                        readCustomerResult.FirstName,
                                                        readCustomerResult.LastName);
            *=====================================================================================*/


            /* Creating a Cart example code */
            myCartId = newCustomer.AccountNumber + "-" + new Date().getTime();
            console.log('cart_id:', myCartId);

            myShippingAddress = {
                Street: "Upper Crescent",
                StreetNumber: "4-6",
                County: "ROCKINGHAM",
                CountyName: "Rockingham",
                City: "Belfast",
                DistrictName: "",
                State: "NH",
                StateName: "New Hampshire",
                ZipCode: "00212",
                ThreeLetterISORegionName: "USA"
            };

            myCart = { 
                CustomerId: newCustomer.AccountNumber, 
                DeliveryMode: "99",
                //DeliveryModeChargeAmount: 2,
                Id: myCartId,
                RequestedDeliveryDate: "2024-09-05T23:00:00Z",
                CustomerOrderModeValue: 1,
                CartTypeValue: 2,
                ShippingAddress: myShippingAddress
            };

            myCart = await createCartAsync(myContext, myCart);
            console.log('cart details:', myCart);

            var myCartLine =
                [
                    {
                        ItemId: "75001",
                        EntryMethodTypeValue: 3,
                        Description: "Line item",
                        ProductId: 68719552888,
                        Quantity: 1,
                        UnitOfMeasureSymbol: "",
                        CommissionSalesGroup: null,
                        TrackingId: "",
                        CatalogId: 0,
                        deliveryMode: 99,
                        ExtensionProperties: 
                        [ { Key: "FirstName",
                            Value: {
                                     StringValue: "John"
                                   }
                          },
                          { Key: "Surname",
                            Value: {
                                    StringValue: "Smith"
                                   }
                          },
                          { Key: "YearOfDeath",
                            Value: {
                                IntegerValue: 2010
                                   }
                          }
                        ],
                        ShippingAddress: myShippingAddress
                    }
                ];

            console.log('my cart : ',myCartLine)

            /* Adding lines to Cart */

            myCart = await addCartLinesAsync(myContext, myCartId, myCartLine, myCart.Version);
            console.log('cart with cart line added:', myCart);
            console.log('cart version: ',myCart.Version )

            myCart = await addCartLinesAsync(myContext, myCartId, myCartLine, myCart.Version);
            console.log('cart with cart line added:', myCart);

            /* Removing a line from the Cart */
            var cartLineIdToRemove =  myCart.CartLines[1].LineId
            console.log("Cart Line to remove: ", cartLineIdToRemove);

            myCart = await removeCartLinesAsync(myContext, myCartId, [cartLineIdToRemove]);

            console.log('removed cart line:', myCart);

            /* Reading a line from the Cart */
            myCart = await readAsync(myContext, myCartId);
            console.log('Cart readAsync: ', myCart);

            myCart.CartLines?.forEach(function (cartLine) {
                cartLine.ExtensionProperties.forEach(function (extProp) {
                    console.log('CartLine ExtProp Key:', extProp.Key);
                    console.log('CartLine ExtProp Value:', extProp.Value);
                });
            });


            // Set up a TenderLine for payment recording
            var myCartTenderLine = [
                    {
                    TenderLineId: "",
                    Currency: "USD",
                    TenderTypeId: "1",
                    SignatureData: null,
                    Amount: myCart.TotalAmount,
                    IsPolicyBypassed: false,
                    ExtensionProperties: [ 
                        { Key: "paymentId",
                            Value: {
                                StringValue: "ABC123"
                        }
                     }]
                }
            ];

            console.log('myCartTenderLine : ', myCartTenderLine);

            // Tender line is now added as part of checkout
            //myCart = await addTenderLineAsync(myContext, myCartId, myCartTenderLine, myCart.Version);
            //console.log('cart with tender line added:', myCart);

            const mySalesOrder = await checkoutAsync(myContext, myCartId, "test@example.com", null, null, myCartTenderLine, myCart.Version, 0);
            console.log('Sales Order added:', mySalesOrder);

            console.log('Sales Order created successfully');

            /* Investigating how to fetch Order History for a customer */

            /* Method 1 */
            const orderHistory = await getOrderHistoryAsync(myContext, mySalesOrder.CustomerId);
            console.log('orderHistory :', JSON.stringify(orderHistory));

            /* Method 2 */
            const orderShipmentsHistory = await getOrderShipmentsHistoryAsync(myContext, mySalesOrder.CustomerId);
            console.log('orderShipmentsHistory :', JSON.stringify(orderShipmentsHistory));

        } catch (error) {
            console.error('Error :', JSON.stringify(error));
        }
    }
}

module.exports = CommerceController;
