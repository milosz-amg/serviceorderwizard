sap.ui.define([
    "sap/ui/model/odata/v2/ODataModel"
], function (ODataModel) {
    "use strict";

    return {
        /**
         * Creates OData V2 model for service orders
         * @returns {sap.ui.model.odata.v2.ODataModel} The OData V2 model for service orders
         */
        createServiceOrderModel: function () {
            var oModel = new ODataModel("/sap/opu/odata/SAP/ZMR_ORDER_SRV_SRV/", {
                json: true,
                useBatch: false
            });
            return oModel;
        },

        /**
         * Creates a new service order using OData V2
         * @param {Object} oOrderData - The order data to create
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - The OData model
         * @returns {Promise} Promise that resolves when order is created
         */
        createServiceOrder: function (oOrderData, oModel) {
            return new Promise(function (resolve, reject) {
                oModel.create("/orderSet", oOrderData, {
                    success: function(oData, oResponse) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        reject(oError);
                    },
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    }
                });
            });
        },

        /**
         * Gets all service orders
         * @param {sap.ui.model.odata.v4.ODataModel} oModel - The OData model
         * @returns {sap.ui.model.odata.v4.Context} List binding context
         */
        getServiceOrders: function (oModel) {
            return oModel.bindList("/orderSet");
        },

        /**
         * Fetches raw order data using XMLHttpRequest
         * @returns {Promise} Promise that resolves with raw response text
         */
        fetchRawOrderData: function () {
            return new Promise(function (resolve, reject) {
                var oRequest = new XMLHttpRequest();
                
                oRequest.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        if (this.status === 200) {
                            resolve(this.responseText);
                        } else {
                            reject({
                                status: this.status,
                                statusText: this.statusText,
                                responseText: this.responseText
                            });
                        }
                    }
                };
                
                var sUrl = "/sap/opu/odata/SAP/ZMR_ORDER_SRV_SRV/orderSet?$format=json";
                
                oRequest.open("GET", sUrl, true);
                oRequest.setRequestHeader("Accept", "application/json");
                oRequest.setRequestHeader("Content-Type", "application/json");
                oRequest.send();
            });
        },
        /**
 * Deletes a service order using OData V2
 * @param {string} sOrderId - The ID of the order to delete
 * @param {sap.ui.model.odata.v2.ODataModel} oModel - The OData model
 * @returns {Promise} Promise that resolves when order is deleted
 */
deleteServiceOrder: function (sOrderId, oModel) {
    return new Promise(function (resolve, reject) {
        // Validate order ID
        if (!sOrderId) {
            reject(new Error("Order ID is required"));
            return;
        }
        
        // Construct the path for the order to delete
        var sPath = "/orderSet(OrderId='" + sOrderId + "')";
        
        // Send DELETE request
        oModel.remove(sPath, {
            success: function(oData) {
                resolve({
                    success: true,
                    orderId: sOrderId,
                    message: "Order " + sOrderId + " successfully deleted"
                });
            },
            error: function(oError) {
                reject({
                    success: false,
                    orderId: sOrderId,
                    error: oError,
                    message: "Failed to delete order " + sOrderId
                });
            }
        });
    });
},
    };
});
