sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/List",
    "sap/m/CustomListItem",
    "sap/m/Title",
    "com/mr/serviceorderwizard/model/serviceOrderModel",
    "com/mr/serviceorderwizard/formatter"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, List, CustomListItem, Title, serviceOrderModel, formatter) {
    "use strict";

    return Controller.extend("com.mr.serviceorderwizard.controller.Orders", {
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
                        oTable.bindRows({
                            path: "orders>/"
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
         * Wyświetla szczegóły wybranego zlecenia w estetycznym oknie dialogowym z pogrupowanymi danymi
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

            if (!oOrder) {
                MessageBox.error("Nie można wczytać danych zlecenia.");
                return;
            }
            
            // Organizujemy dane w kategorie
            var oFormattedData = this._groupOrderData(oOrder);
            
            // Tworzenie formatowanego dialogu o mniejszej szerokości
            var oDialog = new sap.m.Dialog({
                title: "Szczegóły zlecenia: " + formatter.formatOrderId(oOrder.OrderId || ""),
                contentWidth: "500px",
                resizable: true,
                draggable: true,
                type: sap.m.DialogType.Standard,
                state: sap.ui.core.ValueState.None,
                contentHeight: "auto",
                content: this._createDetailContent(oFormattedData),
                beginButton: new sap.m.Button({
                    text: "Zamknij",
                    press: function() {
                        oDialog.close();
                    }
                }),
                afterClose: function() {
                    oDialog.destroy();
                }
            });
            
            // Otwórz dialog
            oDialog.open();
        },
        
        /**
         * Grupuje dane zamówienia według kategorii
         * @param {Object} oOrder - Obiekt zawierający dane zamówienia
         * @returns {Object} Pogrupowane dane
         * @private
         */
        _groupOrderData: function(oOrder) {
            // Zdefiniuj grupy i przypisz do nich pola
            return {
                orderInfo: {
                    title: "Informacje o zamówieniu",
                    fields: [
                        { key: "OrderId", value: oOrder.OrderId, formatter: formatter.formatOrderId },
                        { key: "OrderCreationDate", value: oOrder.OrderCreationDate, formatter: formatter.formatDate },
                        { key: "Status", value: oOrder.Status }
                    ]
                },
                customerInfo: {
                    title: "Dane klienta",
                    fields: [
                        { key: "Firstname", value: oOrder.Firstname },
                        { key: "Lastname", value: oOrder.Lastname },
                        { key: "Phonenumber", value: oOrder.Phonenumber }
                    ]
                },
                addressInfo: {
                    title: "Adres",
                    fields: [
                        { key: "Addressfirstline", value: oOrder.Addressfirstline },
                        { key: "Addresssecondline", value: oOrder.Addresssecondline },
                        { key: "Addresscity", value: oOrder.Addresscity },
                        { key: "Addresszipcode", value: oOrder.Addresszipcode, formatter: formatter.formatZipCode }
                    ]
                },
                deviceInfo: {
                    title: "Urządzenie",
                    fields: [
                        { key: "Devicetype", value: oOrder.Devicetype },
                        { key: "Devicemodel", value: oOrder.Devicemodel },
                        { key: "Deviceserialnumber", value: oOrder.Deviceserialnumber },
                        { key: "Faultdescription", value: oOrder.Faultdescription }
                    ]
                },
                visitInfo: {
                    title: "Wizyta serwisowa",
                    fields: [
                        { key: "Visitdate", value: oOrder.Visitdate, formatter: formatter.formatDate },
                        { key: "Visittime", value: oOrder.Visittime, formatter: formatter.formatTime }
                    ]
                }
            };
        },
        
        /**
         * Tworzy zawartość dialogu szczegółów
         * @param {Object} oFormattedData - Pogrupowane dane zamówienia
         * @returns {sap.m.VBox} Kontener z zawartością
         * @private
         */
        _createDetailContent: function(oFormattedData) {
            var aContent = [];
            
            // Iteracja po grupach
            for (var sGroupKey in oFormattedData) {
                if (oFormattedData.hasOwnProperty(sGroupKey)) {
                    var oGroup = oFormattedData[sGroupKey];
                    
                    // Dodaj nagłówek sekcji bez ikony (mniejsze marginesy)
                    var oSectionHeader = new sap.m.Title({
                        text: oGroup.title,
                        level: "H3",
                        wrapping: true
                    }).addStyleClass("sapUiTinyMarginBottom sapUiTinyMarginTop sapUiTinyMarginBegin");
                    
                    aContent.push(oSectionHeader);
                    
                    // Dodaj listę pól w formacie "Etykieta: Wartość" (z marginesem od lewej strony)
                    var oList = new sap.m.List({
                        showSeparators: sap.m.ListSeparators.None,
                        backgroundDesign: sap.m.BackgroundDesign.Transparent
                    }).addStyleClass("sapUiNoMarginBottom sapUiTinyMarginBegin");
                    
                    // Dodaj pola do listy
                    oGroup.fields.forEach(function(oField) {
                        if (oField.value) {
                            var sDisplayValue = oField.value;
                            if (oField.formatter) {
                                sDisplayValue = oField.formatter(sDisplayValue);
                            }
                            
                            // Tworzenie obiektu z etykietą i wartością w jednej linii (z lepszymi marginesami)
                            var oListItem = new sap.m.CustomListItem({
                                content: [
                                    new sap.m.HBox({
                                        wrap: sap.m.FlexWrap.Wrap,
                                        items: [
                                            new sap.m.Text({
                                                text: formatter.formatFieldName(oField.key) + ": ",
                                                textAlign: "End"
                                            }).addStyleClass("sapUiTinyMarginEnd sapMTextForceBold"),
                                            new sap.m.Text({
                                                text: sDisplayValue
                                            })
                                        ]
                                    }).addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginTop")
                                ],
                                class: "sapUiNoMarginTop sapUiNoMarginBottom"
                            });
                            
                            oList.addItem(oListItem);
                        }
                    }.bind(this));
                    
                    aContent.push(oList);
                    
                    // Dodaj separator po każdej sekcji (z marginesem)
                    if (Object.keys(oFormattedData).indexOf(sGroupKey) < Object.keys(oFormattedData).length - 1) {
                        // Separator dla sekcji, które nie są ostatnie
                        var oSeparator = new sap.m.HBox({height: "1px"})
                            .addStyleClass("sapUiTinyMarginTop sapUiTinyMarginBottom sapUiSharedBorderColor");
                        aContent.push(oSeparator);
                    } else {
                        // Dodaj pusty element z marginesem dolnym dla ostatniej sekcji
                        var oBottomMargin = new sap.m.HBox({height: "8px"})
                            .addStyleClass("sapUiTinyMarginTop");
                        aContent.push(oBottomMargin);
                    }
                }
            }
            
            return new sap.m.VBox({
                items: aContent,
                width: "100%"
            }).addStyleClass("sapUiContentPadding sapUiTinyMarginBegin");
        },

        // Funkcja _formatFieldName została przeniesiona do formattera jako formatFieldName

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

    });

});
