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
        /**
         * Inicjalizuje kontroler i ustawia model danych
         * @public
         */
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

        /**
         * Pobiera dane zleceń z serwera i aktualizuje model widoku
         * @public
         */
        fetchOrderData: function () {
            var oViewModel = this.getView().getModel();

            // Set loading state
            oViewModel.setProperty("/statusMessage", "Pobieranie danych z serwera...");
            oViewModel.setProperty("/messageType", "Information");
            oViewModel.setProperty("/showMessage", true);
            oViewModel.setProperty("/orders", []);
            oViewModel.setProperty("/ordersCount", 0);

            // Use serviceOrderModel to fetch raw data
            serviceOrderModel.fetchRawOrderData()
                .then(function (sResponseText) {
                    this._handleSuccessResponse(sResponseText, oViewModel);
                }.bind(this))
                .catch(function (oError) {
                    this._handleErrorResponse(oError, oViewModel);
                }.bind(this));
        },

        /**
         * Obsługuje odpowiedź z serwera w przypadku sukcesu
         * @param {string} sResponseText - Odpowiedź z serwera w formacie tekstowym
         * @param {sap.ui.model.json.JSONModel} oViewModel - Model widoku do zaktualizowania
         * @private
         */
        _handleSuccessResponse: function (sResponseText, oViewModel) {
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

        /**
         * Obsługuje odpowiedź z serwera w przypadku błędu
         * @param {object} oError - Obiekt błędu zawierający informacje o problemie
         * @param {sap.ui.model.json.JSONModel} oViewModel - Model widoku do zaktualizowania
         * @private
         */
        _handleErrorResponse: function (oError, oViewModel) {
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

        /**
         * Odświeża dane zleceń poprzez ponowne pobranie ich z serwera
         * @public
         */
        onRefresh: function () {
            MessageToast.show("Odświeżanie danych...");
            this.fetchOrderData();
        },

        /**
         * Wyświetla szczegóły wybranego zlecenia w oknie dialogowym
         * @param {sap.ui.base.Event} oEvent - Zdarzenie zawierające informacje o klikniętym elemencie
         * @public
         */
        onShowDetails: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oOrder = oContext.getObject();

            // string dla szczegółów
            var sDetailsText = "";

            // Format 
            for (var sKey in oOrder) {
                if (oOrder.hasOwnProperty(sKey) && sKey !== "__metadata") {
                    var sValue = oOrder[sKey];
                    var sDisplayKey = this._formatFieldName(sKey);

                    if (sValue !== null && sValue !== undefined && sValue !== "") {
                        // Format date 
                        if (sKey.toLowerCase().includes("date") && typeof sValue === "string" && sValue.length === 8) {
                            sValue = this._formatDateString(sValue);
                        }

                        // Format time 
                        if (sKey.toLowerCase().includes("time") && typeof sValue === "string" && sValue.length === 4) {
                            sValue = this._formatTimeString(sValue);
                        }

                        sDetailsText += sDisplayKey + ": " + sValue + "\n";
                    }
                }
            }

            // Display message box
            MessageBox.information(sDetailsText, {
                title: "Szczegóły zlecenia: " + (oOrder.OrderId || "Brak"),
                contentWidth: "500px"
            });
        },

        /**
         * Publiczny formater daty do użycia w widoku
         * @param {string} sDate - Data w formacie YYYYMMDD
         * @returns {string} Sformatowana data w formacie DD.MM.YYYY
         * @public
         */
        formatDate: function (sDate) {
            return this._formatDateString(sDate);
        },

        /**
         * Formatuje datę z postaci RRRRMMDD do DD.MM.RRRR
         * @param {string} sDate - Data w formacie RRRRMMDD
         * @returns {string} Sformatowana data w formacie DD.MM.RRRR
         * @private
         */

        _formatDateString: function (sDate) {
            if (sDate && sDate.length === 8) {
                return sDate.substring(6, 8) + "." + sDate.substring(4, 6) + "." + sDate.substring(0, 4);
            }
            return sDate;
        },

        /**
         * Formatuje ciąg znaków reprezentujący czas z formatu HHMM na HH:MM
         * @param {string} sTime - Czas w formacie HHMM
         * @returns {string} Sformatowany czas w formacie HH:MM
         * @private
         */
        _formatTimeString: function (sTime) {
            if (sTime && sTime.length === 4) {
                return sTime.substring(0, 2) + ":" + sTime.substring(2, 4);
            }
            return sTime;
        },


        /**
         * Formatuje techniczne nazwy pól na przyjazne dla użytkownika
         * @param {string} sFieldName - Oryginalna, techniczna nazwa pola
         * @returns {string} Sformatowana, przyjazna dla użytkownika nazwa pola
         * @private
         */
        _formatFieldName: function (sFieldName) {
            var oFieldNameMap = {
                "OrderId": "ID",
                "Firstname": "Imię",
                "Lastname": "Nazwisko",
                "Phonenumber": "Numer telefonu",
                "Addressfirstline": "Adres linia 1",
                "Addresssecondline": "Adres linia 2",
                "Addresscity": "Miasto",
                "Addresszipcode": "Kod pocztowy",
                "Devicetype": "Typ urządzenia",
                "Devicemodel": "Model urządzenia",
                "Faultdescription": "Opis usterki",
                "Visitdate": "Data wizyty",
                "Visittime": "Godzina wizyty",
                "Status": "Status zlecenia",
            };

            return oFieldNameMap[sFieldName];
        },


    });
});
