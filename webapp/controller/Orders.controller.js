sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/mr/serviceorderwizard/model/serviceOrderModel"
], function (Controller, JSONModel, MessageToast, MessageBox, serviceOrderModel) {
    "use strict";

    return Controller.extend("com.mr.serviceorderwizard.controller.Orders", {
        onInit: function () {
            // Create a JSON model to hold the response data
            var oViewModel = new JSONModel({
                responseText: "",
                statusMessage: "Gotowy do pobierania danych",
                isFormatted: true
            });
            this.getView().setModel(oViewModel);
            
            // Automatically fetch data on initialization
            this.fetchOrderData();
        },
        
        fetchOrderData: function() {
            var oViewModel = this.getView().getModel();
            
            // Set loading state
            oViewModel.setProperty("/responseText", "Pobieranie danych z serwera...");
            oViewModel.setProperty("/statusMessage", "Łączenie z serwerem OData...");
            
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
                // Parse and format JSON response
                var oResponse = JSON.parse(sResponseText);
                var sFormattedResponse = JSON.stringify(oResponse, null, 2);
                
                oViewModel.setProperty("/responseText", sFormattedResponse);
                oViewModel.setProperty("/statusMessage", 
                    "Dane pobrane pomyślnie. Znaleziono " + 
                    (oResponse.d && oResponse.d.results ? oResponse.d.results.length : "nieznana liczba") + 
                    " rekordów.");
                oViewModel.setProperty("/isFormatted", true);
                
                MessageToast.show("Dane zostały pomyślnie pobrane z serwera");
                
            } catch (e) {
                // If not valid JSON, display as raw text
                oViewModel.setProperty("/responseText", sResponseText);
                oViewModel.setProperty("/statusMessage", "Dane pobrane (format niestandardowy)");
                oViewModel.setProperty("/isFormatted", false);
                
                MessageToast.show("Dane pobrane w formacie tekstowym");
            }
        },
        
        _handleErrorResponse: function(oError, oViewModel) {
            var sErrorMessage = "=== BŁĄD PODCZAS POBIERANIA DANYCH ===\n\n" +
                "Status HTTP: " + oError.status + "\n" +
                "Status Text: " + (oError.statusText || "Brak opisu") + "\n" +
                "URL: /sap/opu/odata/SAP/ZMR_ORDER_SRV_SRV/orderSet?$format=json\n\n" +
                "Szczegóły odpowiedzi:\n" + 
                (oError.responseText || "Brak szczegółów");
            
            oViewModel.setProperty("/responseText", sErrorMessage);
            oViewModel.setProperty("/statusMessage", "Błąd: " + oError.status + " - " + oError.statusText);
            
            MessageBox.error("Nie udało się pobrać danych z serwera.\n\nStatus: " + oError.status, {
                title: "Błąd połączenia"
            });
        },
        
        onRefresh: function() {
            MessageToast.show("Odświeżanie danych...");
            this.fetchOrderData();
        },
        
        onToggleFormat: function() {
            var oViewModel = this.getView().getModel();
            var sCurrentText = oViewModel.getProperty("/responseText");
            var bIsFormatted = oViewModel.getProperty("/isFormatted");
            
            if (!sCurrentText || sCurrentText.includes("BŁĄD") || sCurrentText.includes("Pobieranie")) {
                MessageToast.show("Brak danych do formatowania");
                return;
            }
            
            try {
                if (bIsFormatted) {
                    // Convert to minified JSON
                    var oData = JSON.parse(sCurrentText);
                    var sMinified = JSON.stringify(oData);
                    oViewModel.setProperty("/responseText", sMinified);
                    oViewModel.setProperty("/isFormatted", false);
                    MessageToast.show("Przełączono na format skompresowany");
                } else {
                    // Convert to formatted JSON
                    var oData = JSON.parse(sCurrentText);
                    var sFormatted = JSON.stringify(oData, null, 2);
                    oViewModel.setProperty("/responseText", sFormatted);
                    oViewModel.setProperty("/isFormatted", true);
                    MessageToast.show("Przełączono na format sformatowany");
                }
            } catch (e) {
                MessageToast.show("Nie można sformatować danych - nieprawidłowy format JSON");
            }
        }
    });
});
