sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/mr/serviceorderwizard/model/serviceOrderModel",
    "com/mr/serviceorderwizard/formatter"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, serviceOrderModel, formatter) {
    "use strict";

    return Controller.extend("com.mr.serviceorderwizard.controller.Orders", {
        // Expose formatter to the view
        formatter: formatter,
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

            // Use serviceOrderModel to fetch data
            serviceOrderModel.fetchOrderData()
                .then(function (aOrders) {
                    this._handleSuccessResponse(aOrders, oViewModel);
                }.bind(this))
                .catch(function (oError) {
                    this._handleErrorResponse(oError, oViewModel);
                }.bind(this));
        },

        /**
         * Obsługuje odpowiedź z serwera w przypadku sukcesu
         * @param {Array} aOrders - Tablica zleceń otrzymana z serwera
         * @param {sap.ui.model.json.JSONModel} oViewModel - Model widoku do zaktualizowania
         * @private
         */
        _handleSuccessResponse: function (aOrders, oViewModel) {
            // Debug: Log first order to see actual field names
            if (aOrders.length > 0) {
                console.log("First order structure:", aOrders[0]);
                console.log("Available fields:", Object.keys(aOrders[0]));
            }

            // Update model with parsed data
            oViewModel.setProperty("/orders", aOrders);
            oViewModel.setProperty("/ordersCount", aOrders.length);
            oViewModel.setProperty("/responseText", JSON.stringify(aOrders, null, 2));
            oViewModel.setProperty("/statusMessage",
                "Dane pobrane pomyślnie. Znaleziono " + aOrders.length + " zleceń.");
            oViewModel.setProperty("/messageType", "Success");

            MessageToast.show("Pobrano " + aOrders.length + " zleceń z serwera");
        },

        /**
         * Obsługuje odpowiedź z serwera w przypadku błędu
         * @param {object} oError - Obiekt błędu OData zawierający informacje o problemie
         * @param {sap.ui.model.json.JSONModel} oViewModel - Model widoku do zaktualizowania
         * @private
         */
        _handleErrorResponse: function (oError, oViewModel) {
            console.error("Błąd podczas pobierania danych:", oError);
            
            var sErrorMessage = "Błąd podczas pobierania danych";
            var sDetailedError = "=== BŁĄD PODCZAS POBIERANIA DANYCH ===\n\n";
            
            // OData błędy mają inną strukturę niż XMLHttpRequest błędy
            if (oError.response && oError.response.statusCode) {
                sErrorMessage += ": " + oError.response.statusCode + " - " + (oError.response.statusText || "Nieznany błąd");
                sDetailedError += "Status HTTP: " + oError.response.statusCode + "\n" +
                    "Status Text: " + (oError.response.statusText || "Brak opisu") + "\n";
            } else if (oError.message) {
                sErrorMessage += ": " + oError.message;
                sDetailedError += "Wiadomość błędu: " + oError.message + "\n";
            }
            
            sDetailedError += "URL: /sap/opu/odata/SAP/ZMR_ORDER_SRV_SRV/orderSet\n\n";
            
            if (oError.response && oError.response.body) {
                sDetailedError += "Szczegóły odpowiedzi:\n" + oError.response.body;
            } else {
                sDetailedError += "Brak szczegółowych informacji o błędzie";
            }

            oViewModel.setProperty("/statusMessage", sErrorMessage);
            oViewModel.setProperty("/messageType", "Error");
            oViewModel.setProperty("/responseText", sDetailedError);
            oViewModel.setProperty("/orders", []);
            oViewModel.setProperty("/ordersCount", 0);

            var sDisplayMessage = "Nie udało się pobrać danych z serwera.";
            if (oError.response && oError.response.statusCode) {
                sDisplayMessage += "\n\nStatus: " + oError.response.statusCode;
            }
            
            MessageBox.error(sDisplayMessage, {
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

        /**
         * Obsługuje żądanie usunięcia zlecenia
         * @param {sap.ui.base.Event} oEvent - Zdarzenie kliknięcia przycisku usunięcia
         * @public
         */
        onDeleteOrder: function (oEvent) {
            console.log("onDeleteOrder wywołane");
            
            // Pobieramy przycisk i jego kontekst bindingu (tak samo jak w onShowDetails)
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            
            console.log("Przycisk:", oButton);
            console.log("Kontekst bindingu:", oContext);
            
            if (!oContext) {
                MessageBox.error("Nie można pobrać kontekstu danych zlecenia.");
                return;
            }
            
            var oOrder = oContext.getObject();
            console.log("Dane zlecenia:", oOrder);
            
            if (!oOrder || !oOrder.OrderId) {
                MessageBox.error("Nie można zidentyfikować ID zlecenia.");
                return;
            }
            
            var sOrderId = oOrder.OrderId;
            console.log("ID zlecenia do usunięcia:", sOrderId);
            
            var oViewModel = this.getView().getModel();
            
            // Wyświetlamy dialog potwierdzenia
            MessageBox.confirm(
                "Czy na pewno chcesz usunąć zlecenie nr " + sOrderId + "?", {
                    title: "Potwierdzenie usunięcia",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.NO,
                    onClose: function(sAction) {
                        if (sAction === MessageBox.Action.YES) {
                            console.log("Użytkownik potwierdził usunięcie zlecenia:", sOrderId);
                            
                            // Pokazujemy wskaźnik ładowania
                            oViewModel.setProperty("/statusMessage", "Usuwanie zlecenia nr " + sOrderId + "...");
                            oViewModel.setProperty("/messageType", "Warning");
                            oViewModel.setProperty("/showMessage", true);
                            
                            // Tworzymy model OData
                            var oODataModel = serviceOrderModel.createServiceOrderModel();
                            
                            // Wywołujemy metodę usuwania
                            serviceOrderModel.deleteServiceOrder(sOrderId, oODataModel)
                                .then(function(oResult) {
                                    console.log("Pomyślnie usunięto zlecenie:", oResult);
                                    
                                    // Obsługa sukcesu
                                    MessageToast.show("Usunięto zlecenie nr " + sOrderId);
                                    
                                    // Aktualizujemy model widoku - usuwamy zlecenie z listy
                                    var aOrders = oViewModel.getProperty("/orders");
                                    var aUpdatedOrders = aOrders.filter(function(oItem) {
                                        return oItem.OrderId !== sOrderId;
                                    });
                                    
                                    oViewModel.setProperty("/orders", aUpdatedOrders);
                                    oViewModel.setProperty("/ordersCount", aUpdatedOrders.length);
                                    oViewModel.setProperty("/statusMessage", 
                                        "Usunięto zlecenie nr " + sOrderId + ". Pozostało " + aUpdatedOrders.length + " zleceń.");
                                    oViewModel.setProperty("/messageType", "Success");
                                })
                                .catch(function(oError) {
                                    console.error("Błąd podczas usuwania zlecenia:", oError);
                                    
                                    var sErrorMessage = "Nie udało się usunąć zlecenia nr " + sOrderId;
                                    if (oError.message) {
                                        sErrorMessage += ": " + oError.message;
                                    }
                                    
                                    MessageBox.error(sErrorMessage, {
                                        title: "Błąd usuwania"
                                    });
                                    
                                    oViewModel.setProperty("/statusMessage", "Błąd podczas usuwania zlecenia: " + sErrorMessage);
                                    oViewModel.setProperty("/messageType", "Error");
                                });
                        } else {
                            console.log("Użytkownik anulował usuwanie zlecenia");
                        }
                    }.bind(this)
                }
            );
        }

    });

});
