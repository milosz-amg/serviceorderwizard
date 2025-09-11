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
         * Inicjalizuje kontroler i ustawia model OData
         * @public
         */
        onInit: function () {
            // Create OData model and set it as default model
            var oODataModel = serviceOrderModel.createServiceOrderModel();
            this.getView().setModel(oODataModel);
            
            // Create a view model for UI state (messages, counters, etc.)
            var oViewModel = new JSONModel({
                statusMessage: "Gotowy do pobierania danych",
                messageType: "Information",
                showMessage: true,
                ordersCount: 0
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Bind orders count to OData model
            this._bindOrdersCount();
            
            // Rejestruj zdarzenie routingu, aby odświeżać dane przy każdym wejściu na tę stronę
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteOrders").attachPatternMatched(this._onRouteMatched, this);
        },
        
        /**
         * Obsługuje dopasowanie wzorca trasy - używane do odświeżania danych przy nawigacji
         * @private
         */
        _onRouteMatched: function() {
            // Odśwież dane za każdym razem, gdy użytkownik wchodzi na tę stronę
            this._loadAllOrders();
        },
        
        /**
         * Wykonuje się przed renderowaniem widoku
         * @public 
         */
        onBeforeRendering: function() {
            // Załaduj dane podczas pierwszego renderowania widoku
            if (!this._initialDataLoaded) {
                this._loadAllOrders();
                this._initialDataLoaded = true;
            }
        },

        /**
         * Binds orders count to OData model changes
         * @private
         */
        _bindOrdersCount: function () {
            var oODataModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("viewModel");
            
            // Listen to data changes to update counter
            oODataModel.attachRequestCompleted(function () {
                var aOrders = oODataModel.getProperty("/orderSet");
                if (aOrders) {
                    oViewModel.setProperty("/ordersCount", aOrders.length);
                    oViewModel.setProperty("/statusMessage", "Dane pobrane pomyślnie. Znaleziono " + aOrders.length + " zleceń.");
                    oViewModel.setProperty("/messageType", "Success");
                }
            });
            
            oODataModel.attachRequestFailed(function (oEvent) {
                var oError = oEvent.getParameter("response");
                oViewModel.setProperty("/statusMessage", "Błąd podczas pobierania danych: " + (oError.statusText || "Nieznany błąd"));
                oViewModel.setProperty("/messageType", "Error");
                oViewModel.setProperty("/ordersCount", 0);
            });
        },

        /**
         * Ładuje wszystkie zamówienia z serwera
         * @private
         */
        _loadAllOrders: function() {
            var oODataModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("viewModel");
            
            oViewModel.setProperty("/statusMessage", "Ładowanie danych...");
            oViewModel.setProperty("/messageType", "Information");
            
            // Wyczyść wszystkie buforowane dane
            oODataModel.refresh(true);
            
            // Pobierz dane od nowa
            oODataModel.read("/orderSet", {
                success: function(oData) {
                    if (oData && oData.results) {
                        var aOrders = oData.results;
                        // Aktualizuj licznik i status
                        oViewModel.setProperty("/ordersCount", aOrders.length);
                        oViewModel.setProperty("/statusMessage", "Dane pobrane pomyślnie. Znaleziono " + aOrders.length + " zleceń.");
                        oViewModel.setProperty("/messageType", "Success");
                    } else {
                        oViewModel.setProperty("/ordersCount", 0);
                        oViewModel.setProperty("/statusMessage", "Dane pobrane pomyślnie. Nie znaleziono żadnych zleceń.");
                        oViewModel.setProperty("/messageType", "Success");
                    }
                },
                error: function(oError) {
                    var sErrorMessage = oError.statusText || oError.message || "Nieznany błąd";
                    oViewModel.setProperty("/statusMessage", "Błąd podczas ładowania danych: " + sErrorMessage);
                    oViewModel.setProperty("/messageType", "Error");
                }
            });
        },

        /**
         * Odświeża dane poprzez odświeżenie modelu OData
         * @public
         */
        onRefresh: function () {
            var oViewModel = this.getView().getModel("viewModel");
            
            oViewModel.setProperty("/statusMessage", "Odświeżanie danych...");
            oViewModel.setProperty("/messageType", "Information");
            
            MessageToast.show("Odświeżanie danych...");
            
            // Użyj wspólnej metody do ładowania danych
            this._loadAllOrders();
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

            // Format each field
            for (var sKey in oOrder) {
                if (oOrder.hasOwnProperty(sKey) && sKey !== "__metadata") {
                    var sValue = oOrder[sKey];
                    var sDisplayKey = this._formatFieldName(sKey);

                    if (sValue !== null && sValue !== undefined && sValue !== "") {
                        // Use formatter for dates
                        if (sKey.toLowerCase().includes("date") && sValue) {
                            sValue = formatter.formatDate(sValue);
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
                "OrderCreationDate": "Data złożenia"
            };

            return oFieldNameMap[sFieldName] || sFieldName;
        },

        /**
         * Obsługuje żądanie usunięcia zlecenia przez OData model
         * @param {sap.ui.base.Event} oEvent - Zdarzenie kliknięcia przycisku usunięcia
         * @public
         */
        onDeleteOrder: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            
            if (!oContext) {
                MessageBox.error("Nie można pobrać kontekstu danych zlecenia.");
                return;
            }
            
            var oOrder = oContext.getObject();
            if (!oOrder || !oOrder.OrderId) {
                MessageBox.error("Nie można zidentyfikować ID zlecenia.");
                return;
            }
            
            var sOrderId = oOrder.OrderId;
            var oODataModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("viewModel");
            
            // Wyświetlamy dialog potwierdzenia
            MessageBox.confirm(
                "Czy na pewno chcesz usunąć zlecenie nr " + sOrderId + "?", {
                    title: "Potwierdzenie usunięcia",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.NO,
                    onClose: function(sAction) {
                        if (sAction === MessageBox.Action.YES) {
                            // Pokazujemy wskaźnik ładowania
                            oViewModel.setProperty("/statusMessage", "Usuwanie zlecenia nr " + sOrderId + "...");
                            oViewModel.setProperty("/messageType", "Warning");
                            
                            // Usuwamy przez OData model - to automatycznie zaktualizuje binding
                            var sPath = oContext.getPath();
                            oODataModel.remove(sPath, {
                                success: function() {
                                    MessageToast.show("Usunięto zlecenie nr " + sOrderId);
                                    oViewModel.setProperty("/statusMessage", "Usunięto zlecenie nr " + sOrderId);
                                    oViewModel.setProperty("/messageType", "Success");
                                    
                                    // Odśwież licznik po usunięciu
                                    this._updateOrdersCount();
                                }.bind(this),
                                error: function(oError) {
                                    var sErrorMessage = "Nie udało się usunąć zlecenia nr " + sOrderId;
                                    MessageBox.error(sErrorMessage, {
                                        title: "Błąd usuwania"
                                    });
                                    oViewModel.setProperty("/statusMessage", sErrorMessage);
                                    oViewModel.setProperty("/messageType", "Error");
                                }
                            });
                        }
                    }.bind(this)
                }
            );
        },

        /**
         * Aktualizuje licznik zleceń na podstawie aktualnego stanu modelu OData
         * Wykonuje zapytanie do serwera aby mieć pewność, że dane są aktualne
         * @private
         */
        _updateOrdersCount: function() {
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/statusMessage", "Usuwanie zlecenia...");
            
            // Użyj wspólnej metody do odświeżenia wszystkich danych
            this._loadAllOrders();
        }

    });

});
