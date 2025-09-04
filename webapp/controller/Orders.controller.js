sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/mr/serviceorderwizard/model/serviceOrderModel"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, serviceOrderModel) {
    "use strict";

    return Controller.extend("com.mr.serviceorderwizard.controller.Orders", {
        onInit: function () {
            // Create a JSON model to hold the orders data
            var oViewModel = new JSONModel({
                orders: [],
                ordersCount: 0,
                responseText: "",
                statusMessage: "Gotowy do pobierania danych",
                messageType: "Information",
                showMessage: true,
                showTable: true,
                showJson: false,
                showDebug: false,
                debugInfo: "",
                isFormatted: true
            });
            this.getView().setModel(oViewModel);
            
            // Automatically fetch data on initialization
            this.fetchOrderData();
        },
        
        fetchOrderData: function() {
            var oViewModel = this.getView().getModel();
            
            // Set loading state
            oViewModel.setProperty("/statusMessage", "Pobieranie danych z serwera...");
            oViewModel.setProperty("/messageType", "Information");
            oViewModel.setProperty("/showMessage", true);
            oViewModel.setProperty("/orders", []);
            oViewModel.setProperty("/ordersCount", 0);
            
            // Use serviceOrderModel to fetch raw data
            serviceOrderModel.fetchRawOrderData()
                .then(function(sResponseText) {
                    this._handleSuccessResponse(sResponseText, oViewModel);
                }.bind(this))
                .catch(function(oError) {
                    this._handleErrorResponse(oError, oViewModel);
                }.bind(this));
        },
        
        _handleSuccessResponse: function(sResponseText, oViewModel) {
            try {
                // Parse JSON response
                var oResponse = JSON.parse(sResponseText);
                var aOrders = [];
                
                // Extract orders from OData response structure
                if (oResponse.d && oResponse.d.results) {
                    aOrders = oResponse.d.results;
                } else if (Array.isArray(oResponse)) {
                    aOrders = oResponse;
                } else if (oResponse.value) {
                    aOrders = oResponse.value;
                }
                
                // Debug: Log first order to see actual field names
                if (aOrders.length > 0) {
                    console.log("First order structure:", aOrders[0]);
                    console.log("Available fields:", Object.keys(aOrders[0]));
                }
                
                // Update model with parsed data
                oViewModel.setProperty("/orders", aOrders);
                oViewModel.setProperty("/ordersCount", aOrders.length);
                oViewModel.setProperty("/responseText", JSON.stringify(oResponse, null, 2));
                oViewModel.setProperty("/statusMessage", 
                    "Dane pobrane pomyślnie. Znaleziono " + aOrders.length + " zleceń.");
                oViewModel.setProperty("/messageType", "Success");
                
                MessageToast.show("Pobrano " + aOrders.length + " zleceń z serwera");
                
            } catch (e) {
                // If not valid JSON, show error
                oViewModel.setProperty("/statusMessage", "Błąd parsowania danych JSON: " + e.message);
                oViewModel.setProperty("/messageType", "Error");
                oViewModel.setProperty("/responseText", sResponseText);
                
                MessageToast.show("Błąd podczas parsowania danych");
            }
        },
        
        _handleErrorResponse: function(oError, oViewModel) {
            var sErrorMessage = "Błąd podczas pobierania danych: " + 
                oError.status + " - " + (oError.statusText || "Nieznany błąd");
            
            var sDetailedError = "=== BŁĄD PODCZAS POBIERANIA DANYCH ===\n\n" +
                "Status HTTP: " + oError.status + "\n" +
                "Status Text: " + (oError.statusText || "Brak opisu") + "\n" +
                "URL: /sap/opu/odata/SAP/ZMR_ORDER_SRV_SRV/orderSet?$format=json\n\n" +
                "Szczegóły odpowiedzi:\n" + 
                (oError.responseText || "Brak szczegółów");
            
            oViewModel.setProperty("/statusMessage", sErrorMessage);
            oViewModel.setProperty("/messageType", "Error");
            oViewModel.setProperty("/responseText", sDetailedError);
            oViewModel.setProperty("/orders", []);
            oViewModel.setProperty("/ordersCount", 0);
            
            MessageBox.error("Nie udało się pobrać danych z serwera.\n\nStatus: " + oError.status, {
                title: "Błąd połączenia"
            });
        },
        
        onRefresh: function() {
            MessageToast.show("Odświeżanie danych...");
            this.fetchOrderData();
        },
        
        onToggleView: function() {
            var oViewModel = this.getView().getModel();
            var bShowTable = oViewModel.getProperty("/showTable");
            var oButton = this.byId("toggleViewButton");
            
            if (bShowTable) {
                // Switch to JSON view
                oViewModel.setProperty("/showTable", false);
                oViewModel.setProperty("/showJson", true);
                oButton.setText("Pokaż tabelę");
                oButton.setIcon("sap-icon://table-view");
            } else {
                // Switch to table view
                oViewModel.setProperty("/showTable", true);
                oViewModel.setProperty("/showJson", false);
                oButton.setText("Pokaż JSON");
                oButton.setIcon("sap-icon://syntax");
            }
        },
        
        onSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];
            
            if (sQuery && sQuery.length > 0) {
                // Create filters for multiple fields
                var oFilter = new Filter({
                    filters: [
                        new Filter("FirstName", FilterOperator.Contains, sQuery),
                        new Filter("LastName", FilterOperator.Contains, sQuery),
                        new Filter("DeviceType", FilterOperator.Contains, sQuery),
                        new Filter("DeviceModel", FilterOperator.Contains, sQuery),
                        new Filter("PhoneNumber", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
                aFilters.push(oFilter);
            }
            
            // Apply filter to binding
            oBinding.filter(aFilters);
        },
        
        onOrderPress: function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oOrder = oContext.getObject();
            
            MessageBox.information(
                "ID: " + (oOrder.OrderId || oOrder.orderId || oOrder.ID || oOrder.Id || "Brak") + "\n" +
                "Klient: " + (oOrder.FirstName || oOrder.firstName || "") + " " + (oOrder.LastName || oOrder.lastName || "") + "\n" +
                "Telefon: " + (oOrder.PhoneNumber || oOrder.phoneNumber || oOrder.Phone || "Brak") + "\n" +
                "Urządzenie: " + (oOrder.DeviceType || oOrder.deviceType || "") + " " + (oOrder.DeviceModel || oOrder.deviceModel || "") + "\n" +
                "Status: " + (oOrder.Status || oOrder.status || "Brak"),
                {
                    title: "Szczegóły zlecenia"
                }
            );
        },
        
        onShowAllFields: function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oOrder = oContext.getObject();
            
            // Create a formatted string with all fields
            var sAllFields = "";
            for (var sKey in oOrder) {
                if (oOrder.hasOwnProperty(sKey)) {
                    sAllFields += sKey + ": " + oOrder[sKey] + "\n";
                }
            }
            
            MessageBox.information(sAllFields, {
                title: "Wszystkie pola rekordu",
                contentWidth: "500px"
            });
        },
        
        onShowDetails: function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oOrder = oContext.getObject();
            
            // Create a formatted text string with all order details
            var sDetailsText = "";
            
            // Format all fields in a nice way
            for (var sKey in oOrder) {
                if (oOrder.hasOwnProperty(sKey)) {
                    var sValue = oOrder[sKey];
                    if (sValue !== null && sValue !== undefined && sValue !== "") {
                        sDetailsText += sKey + ": " + sValue + "\n";
                    }
                }
            }
            
            // Show in a dialog with formatted content
            MessageBox.information(sDetailsText, {
                title: "Szczegóły zlecenia - ID: " + (oOrder.OrderId || oOrder.orderId || oOrder.ID || oOrder.Id || "Brak"),
                contentWidth: "500px"
            });
        }
    });
});
