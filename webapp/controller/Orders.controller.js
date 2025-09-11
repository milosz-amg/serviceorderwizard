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
            // Create OData model and set it as default model (still needed for some operations)
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
            
            // Przygotuj pusty model dla zleceń
            var oOrdersModel = new JSONModel([]);
            this.getView().setModel(oOrdersModel, "orders");
            
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

        // Metoda _bindOrdersCount została usunięta, ponieważ korzystamy teraz z bezpośredniego ustawiania licznika
        // w metodzie _loadAllOrders

        /**
         * Ładuje wszystkie zamówienia z serwera używając metody fetchOrderData z serviceOrderModel
         * @private
         */
        _loadAllOrders: function() {
            var oViewModel = this.getView().getModel("viewModel");
            var oTable = this.byId("ordersTable");
            
            oViewModel.setProperty("/statusMessage", "Ładowanie danych...");
            oViewModel.setProperty("/messageType", "Information");
            
            // Użyj metody fetchOrderData z serviceOrderModel, która zawiera już parametry sortowania
            serviceOrderModel.fetchOrderData()
                .then(function(aOrders) {
                    // Utwórz model JSON z danymi i przypisz go do tabeli
                    var oOrdersModel = new JSONModel(aOrders);
                    
                    // Aktualizuj tabelę bezpośrednio z nowym modelem
                    if (oTable) {
                        oTable.setModel(oOrdersModel, "orders");
                        oTable.bindItems({
                            path: "orders>/",
                            template: oTable.getBindingInfo("items").template
                        });
                    }
                    
                    // Aktualizuj licznik i status
                    oViewModel.setProperty("/ordersCount", aOrders.length);
                    oViewModel.setProperty("/statusMessage", "Dane pobrane pomyślnie. Znaleziono " + aOrders.length + " zleceń.");
                    oViewModel.setProperty("/messageType", "Success");
                })
                .catch(function(oError) {
                    var sErrorMessage = oError.statusText || oError.message || "Nieznany błąd";
                    oViewModel.setProperty("/statusMessage", "Błąd podczas ładowania danych: " + sErrorMessage);
                    oViewModel.setProperty("/messageType", "Error");
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
            var oSource = oEvent.getSource();
            var oContext;
            var oOrder;
            
            // Sprawdź, czy mamy kontekst OData czy JSONModel
            if (oSource.getBindingContext()) {
                // Stary sposób - OData binding
                oContext = oSource.getBindingContext();
                oOrder = oContext.getObject();
            } else if (oSource.getBindingContext("orders")) {
                // Nowy sposób - JSONModel binding
                oContext = oSource.getBindingContext("orders");
                oOrder = oContext.getObject();
            }

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
         * Obsługuje żądanie usunięcia zlecenia używając metody z serviceOrderModel
         * @param {sap.ui.base.Event} oEvent - Zdarzenie kliknięcia przycisku usunięcia
         * @public
         */
        onDeleteOrder: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext;
            var oOrder;
            
            // Sprawdź, czy mamy kontekst OData czy JSONModel
            if (oSource.getBindingContext()) {
                // Stary sposób - OData binding
                oContext = oSource.getBindingContext();
                oOrder = oContext.getObject();
            } else if (oSource.getBindingContext("orders")) {
                // Nowy sposób - JSONModel binding
                oContext = oSource.getBindingContext("orders");
                oOrder = oContext.getObject();
            }
            
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
                            
                            // Użyj metody z serviceOrderModel do usunięcia
                            serviceOrderModel.deleteServiceOrder(sOrderId, oODataModel)
                                .then(function(oResult) {
                                    MessageToast.show("Usunięto zlecenie nr " + sOrderId);
                                    oViewModel.setProperty("/statusMessage", "Usunięto zlecenie nr " + sOrderId);
                                    oViewModel.setProperty("/messageType", "Success");
                                    
                                    // Odśwież dane po usunięciu
                                    this._loadAllOrders();
                                }.bind(this))
                                .catch(function(oError) {
                                    var sErrorMessage = "Nie udało się usunąć zlecenia nr " + sOrderId;
                                    if (oError.message) {
                                        sErrorMessage += ": " + oError.message;
                                    }
                                    MessageBox.error(sErrorMessage, {
                                        title: "Błąd usuwania"
                                    });
                                    oViewModel.setProperty("/statusMessage", sErrorMessage);
                                    oViewModel.setProperty("/messageType", "Error");
                                });
                        }
                    }.bind(this)
                }
            );
        },

        // Metoda _updateOrdersCount została usunięta, ponieważ użycie metody _loadAllOrders
        // już teraz aktualizuje licznik zleceń

    });

});
