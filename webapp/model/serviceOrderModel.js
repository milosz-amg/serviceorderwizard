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
         * Fetches order data using OData V2 model
         * @returns {Promise} Promise that resolves with orders array
         */
        fetchOrderData: function () {
            return new Promise(function (resolve, reject) {
                var oModel = this.createServiceOrderModel();
                
                console.log("Pobieranie danych przez OData V2 model...");
                
                oModel.read("/orderSet", {
                    urlParameters: {
                        "$orderby": "OrderCreationDate desc, OrderId desc"
                    },
                    success: function(oData, response) {
                        console.log("Pomyślnie pobrano dane:", oData);
                        // OData V2 zwraca dane w strukturze { results: [...] }
                        var aOrders = oData.results || [];
                        resolve(aOrders);
                    },
                    error: function(oError) {
                        console.error("Błąd podczas pobierania danych przez OData:", oError);
                        reject(oError);
                    }
                });
            }.bind(this));
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
                
                console.log("Usuwanie zlecenia o ID:", sOrderId);
                
                // Construct the path for the order to delete - używamy tylko ścieżki relative do service root
                var sPath = "/orderSet(OrderId='" + sOrderId + "')";
                
                console.log("Ścieżka usuwania:", sPath);
                
                // Send DELETE request
                oModel.remove(sPath, {
                    success: function(oData, oResponse) {
                        console.log("Usunięto pomyślnie zlecenie:", sOrderId);
                        resolve({
                            success: true,
                            orderId: sOrderId,
                            message: "Zlecenie " + sOrderId + " zostało pomyślnie usunięte"
                        });
                    },
                    error: function(oError) {
                        console.error("Błąd podczas usuwania zlecenia:", oError);
                        reject({
                            success: false,
                            orderId: sOrderId,
                            error: oError,
                            message: "Nie udało się usunąć zlecenia " + sOrderId
                        });
                    }
                });
            });
        },
    };
});
