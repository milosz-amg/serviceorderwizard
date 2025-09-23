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

            // var oSmartTable = this.byId("ordersSmartTable");
            // oSmartTable.rebindTable();

            // Podłącz się do zdarzenia routingu
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteOrders").attachPatternMatched(this._onRouteMatched, this);
        },

        /**
         * Obsługuje zdarzenie dopasowania trasy - odświeża dane w tabeli
         * @private
         */
        _onRouteMatched: function () {
            console.log("Route Mched Odświeżanie danych w tabeli Orders");
            this._refreshTableData();
        },

        /**
         * Odświeża dane w tabeli, czekając na inicjalizację jeśli to konieczne
         * @private
         */
        _refreshTableData: function () {
            var oSmartTable = this.byId("ordersSmartTable");
            if (oSmartTable) {
                // Sprawdź czy SmartTable jest zainicjalizowana
                if (oSmartTable.getTable()) {
                    // Tabela jest gotowa, można odświeżyć
                    console.log("SmartTable jest gotowa, odświeżanie danych");
                    oSmartTable.rebindTable();
                } else {
                    // Tabela nie jest jeszcze gotowa, poczekaj na inicjalizację
                    console.log("SmartTable nie jest jeszcze gotowa, czekamy na inicjalizację");
                    oSmartTable.attachInitialised(function () {
                        console.log("SmartTable została zainicjalizowana, odświeżanie danych");
                        oSmartTable.rebindTable();
                    });
                }
            }
        },

        onBeforeRebindTable: function (oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");

            // === STATUS FILTER ===
            var oStatusFilter = this.byId("statusFilter");
            var aSelectedKeys = oStatusFilter ? oStatusFilter.getSelectedKeys() : [];

            if (aSelectedKeys.length > 0) {
                var aStatusFilters = aSelectedKeys.map(function (sKey) {
                    return new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, sKey);
                });
                oBindingParams.filters.push(new sap.ui.model.Filter({
                    filters: aStatusFilters,
                    and: false
                }));
            }

            // === ORDER CREATION DATE RANGE FILTER ===
            var oOrderDateRange = this.byId("orderDateFilter");
            if (oOrderDateRange) {
                var oOrderDateValue = oOrderDateRange.getDateValue();
                var oOrderSecondDateValue = oOrderDateRange.getSecondDateValue();

                // Zamień Date na string DD.MM.YYYY, potem na YYYYMMDD
                var sOrderDateFrom = oOrderDateValue ? formatter.formatDateForBackend(oOrderDateValue instanceof Date ? oOrderDateValue.toLocaleDateString("pl-PL") : oOrderDateValue) : null;
                var sOrderDateTo = oOrderSecondDateValue ? formatter.formatDateForBackend(oOrderSecondDateValue instanceof Date ? oOrderSecondDateValue.toLocaleDateString("pl-PL") : oOrderSecondDateValue) : null;

                if (sOrderDateFrom && sOrderDateTo) {
                    oBindingParams.filters.push(new sap.ui.model.Filter(
                        "OrderCreationDate",
                        sap.ui.model.FilterOperator.BT, // Between
                        sOrderDateFrom,
                        sOrderDateTo
                    ));
                } else if (sOrderDateFrom) {
                    // tylko data od
                    oBindingParams.filters.push(new sap.ui.model.Filter(
                        "OrderCreationDate",
                        sap.ui.model.FilterOperator.GE,
                        sOrderDateFrom
                    ));
                } else if (sOrderDateTo) {
                    // tylko data do
                    oBindingParams.filters.push(new sap.ui.model.Filter(
                        "OrderCreationDate",
                        sap.ui.model.FilterOperator.LE,
                        sOrderDateTo
                    ));
                }
            }

            // === VISIT DATE RANGE FILTER ===
            var oVisitDateRange = this.byId("orderVisitDateFilter");
            if (oVisitDateRange) {
                var oVisitDateValue = oVisitDateRange.getDateValue();
                var oVisitSecondDateValue = oVisitDateRange.getSecondDateValue();

                // Zamień Date na string DD.MM.YYYY, potem na YYYYMMDD
                var sVisitDateFrom = oVisitDateValue ? formatter.formatDateForBackend(oVisitDateValue instanceof Date ? oVisitDateValue.toLocaleDateString("pl-PL") : oVisitDateValue) : null;
                var sVisitDateTo = oVisitSecondDateValue ? formatter.formatDateForBackend(oVisitSecondDateValue instanceof Date ? oVisitSecondDateValue.toLocaleDateString("pl-PL") : oVisitSecondDateValue) : null;

                if (sVisitDateFrom && sVisitDateTo) {
                    oBindingParams.filters.push(new sap.ui.model.Filter(
                        "Visitdate",
                        sap.ui.model.FilterOperator.BT, // Between
                        sVisitDateFrom,
                        sVisitDateTo
                    ));
                } else if (sVisitDateFrom) {
                    // tylko data od
                    oBindingParams.filters.push(new sap.ui.model.Filter(
                        "Visitdate",
                        sap.ui.model.FilterOperator.GE,
                        sVisitDateFrom
                    ));
                } else if (sVisitDateTo) {
                    // tylko data do
                    oBindingParams.filters.push(new sap.ui.model.Filter(
                        "Visitdate",
                        sap.ui.model.FilterOperator.LE,
                        sVisitDateTo
                    ));
                }
            }
        },



        /**
         * Refreshes the table data
         * @public
         */
        onRefreshTable: function (oEvent) {
            var oButton = oEvent.getSource();

            // Wyłącz przycisk
            oButton.setEnabled(false);

            // Twoja logika refresh
            this._doRefreshTable();

            // Włącz z powrotem po 2 sekundach
            setTimeout(function () {
                oButton.setEnabled(true);
            }, 500);
        },

        _doRefreshTable: function () {
            var oSmartTable = this.byId("ordersSmartTable");
            var oSmartFilterBar = this.byId("smartFilterBar");

            if (oSmartTable) {
                // Reset status filter
                var oStatusFilter = this.byId("statusFilter");
                if (oStatusFilter) {
                    oStatusFilter.setSelectedKeys([]);
                }

                // Reset order creation date filter
                var oOrderDateFilter = this.byId("orderDateFilter");
                if (oOrderDateFilter) {
                    oOrderDateFilter.setDateValue(null);
                    oOrderDateFilter.setSecondDateValue(null);
                    oOrderDateFilter.setValue("");
                }

                // Reset visit date filter
                var oVisitDateFilter = this.byId("orderVisitDateFilter");
                if (oVisitDateFilter) {
                    oVisitDateFilter.setDateValue(null);
                    oVisitDateFilter.setSecondDateValue(null);
                    oVisitDateFilter.setValue("");
                }

                // Reset search bar and clear all filters in SmartFilterBar
                if (oSmartFilterBar) {
                    oSmartFilterBar.clear();
                }

                // Get the inner table and clear its binding filters
                var oTable = oSmartTable.getTable();
                if (oTable) {
                    var oBinding = oTable.getBinding("items") || oTable.getBinding("rows");
                    if (oBinding) {
                        oBinding.filter([]);
                    }
                }

                oSmartTable.rebindTable();
            }
        },

        /**
         * Pobiera tekst z modelu i18n
         * @private
         */
        _getText: function (sKey, aArgs) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        onFilterChange: function () {
            var oSmartFilterBar = this.byId("smartFilterBar");
            if (oSmartFilterBar) {
                oSmartFilterBar.triggerSearch();
            }
        },

        /**
         * Wyświetla szczegóły wybranego zlecenia w estetycznym oknie dialogowym z pogrupowanymi danymi
         * Pobiera dane z backendu używając OrderId
         * @param {sap.ui.base.Event} oEvent - Zdarzenie zawierające informacje o klikniętym elemencie
         * @public
         */
        onShowDetails: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext;
            var sOrderId;

            if (oSource.getBindingContext()) {
                // OData binding
                oContext = oSource.getBindingContext();
                var oOrder = oContext.getObject();
                sOrderId = oOrder.OrderId;
            }

            if (!sOrderId) {
                MessageBox.error(this._getText("cannotLoadOrderDataMessage"));
                return;
            }

            // Pobierz pełne dane z backendu
            var oODataModel = this.getView().getModel();
            serviceOrderModel.fetchSingleOrder(sOrderId, oODataModel)
                .then(function (oOrderData) {
                    // Organizujemy dane w kategorie
                    var oFormattedData = this._groupOrderData(oOrderData);

                    // Tworzenie formatowanego dialogu o mniejszej szerokości
                    var oDialog = new sap.m.Dialog({
                        title: this._getText("orderDetailsDialogTitle", [formatter.formatOrderId(oOrderData.OrderId || "")]),
                        contentWidth: "500px",
                        resizable: true,
                        draggable: true,
                        type: sap.m.DialogType.Standard,
                        state: sap.ui.core.ValueState.None,
                        contentHeight: "auto",
                        content: this._createDetailContent(oFormattedData),
                        beginButton: new sap.m.Button({
                            text: this._getText("closeButton"),
                            press: function () {
                                oDialog.close();
                            }
                        }),
                        afterClose: function () {
                            oDialog.destroy();
                        }
                    });

                    // Otwórz dialog
                    oDialog.open();

                }.bind(this))
                .catch(function (oError) {
                    var sErrorMessage = this._getText("orderDetailsLoadError", [sOrderId]);
                    if (oError.message) {
                        sErrorMessage += ": " + oError.message;
                    }
                    MessageBox.error(sErrorMessage);
                }.bind(this));
        },

        /**
         * Grupuje dane zamówienia według kategorii
         * @param {Object} oOrder - Obiekt zawierający dane zamówienia
         * @returns {Object} Pogrupowane dane
         * @private
         */
        _groupOrderData: function (oOrder) {
            // Zdefiniuj grupy i przypisz do nich pola
            return {
                orderInfo: {
                    title: this._getText("orderDataTitle"),
                    fields: [
                        { key: "OrderId", value: oOrder.OrderId, formatter: formatter.formatOrderId },
                        { key: "OrderCreationDate", value: oOrder.OrderCreationDate, formatter: formatter.formatDate },
                        { key: "Status", value: oOrder.Status }
                    ]
                },
                customerInfo: {
                    title: this._getText("clientDataTitle"),
                    fields: [
                        { key: "Firstname", value: oOrder.Firstname },
                        { key: "Lastname", value: oOrder.Lastname },
                        { key: "Phonenumber", value: oOrder.Phonenumber }
                    ]
                },
                addressInfo: {
                    title: this._getText("addressLabel"),
                    fields: [
                        { key: "Addressfirstline", value: oOrder.Addressfirstline },
                        { key: "Addresssecondline", value: oOrder.Addresssecondline },
                        { key: "Addresscity", value: oOrder.Addresscity },
                        { key: "Addresszipcode", value: oOrder.Addresszipcode, formatter: formatter.formatZipCode }
                    ]
                },
                deviceInfo: {
                    title: this._getText("deviceDataTitle"),
                    fields: [
                        { key: "Devicetype", value: oOrder.Devicetype },
                        { key: "Devicemodel", value: oOrder.Devicemodel },
                        { key: "Deviceserialnumber", value: oOrder.Deviceserialnumber },
                        { key: "Faultdescription", value: oOrder.Faultdescription }
                    ]
                },
                visitInfo: {
                    title: this._getText("visitDataTitle"),
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
        _createDetailContent: function (oFormattedData) {
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
                    oGroup.fields.forEach(function (oField) {
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
                                ]
                            }).addStyleClass("sapUiNoMarginTop sapUiNoMarginBottom");

                            oList.addItem(oListItem);
                        }
                    }.bind(this));

                    aContent.push(oList);

                    // Dodaj separator po każdej sekcji (z marginesem)
                    if (Object.keys(oFormattedData).indexOf(sGroupKey) < Object.keys(oFormattedData).length - 1) {
                        // Separator dla sekcji, które nie są ostatnie
                        var oSeparator = new sap.m.HBox({ height: "1px" })
                            .addStyleClass("sapUiTinyMarginTop sapUiTinyMarginBottom sapUiSharedBorderColor");
                        aContent.push(oSeparator);
                    } else {
                        // Dodaj pusty element z marginesem dolnym dla ostatniej sekcji
                        var oBottomMargin = new sap.m.HBox({ height: "8px" })
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
                MessageBox.error(this._getText("cannotIdentifyOrderIdMessage"));
                return;
            }

            var sOrderId = oOrder.OrderId;
            var oODataModel = this.getView().getModel();

            // Wyświetlamy dialog potwierdzenia
            MessageBox.confirm(
                this._getText("orderDeleteConfirmationMessage", [formatter.formatOrderId(sOrderId)]), {
                title: this._getText("orderDeleteConfirmationTitle"),
                actions: [this._getText("yesButton"), this._getText("noButton")],
                emphasizedAction: this._getText("noButton"),
                onClose: function (sAction) {
                    if (sAction === this._getText("yesButton")) {
                        // Pokazujemy wskaźnik ładowania

                        // Użyj metody z serviceOrderModel do usunięcia
                        serviceOrderModel.deleteServiceOrder(sOrderId, oODataModel)
                            .then(() => {
                                MessageToast.show(this._getText("orderDeleteSuccessMessage", [sOrderId]));

                                // Odśwież SmartTable po pomyślnym usunięciu
                                var oSmartTable = this.byId("ordersSmartTable");
                                if (oSmartTable) {
                                    oSmartTable.rebindTable();
                                }

                            })
                            .catch(function (oError) {
                                var sErrorMessage = this._getText("orderDeleteErrorMessage", [sOrderId]);
                                if (oError.message) {
                                    sErrorMessage += ": " + oError.message;
                                }
                                MessageBox.error(sErrorMessage, {
                                    title: this._getText("deletionError")
                                });
                            }.bind(this));
                    }
                }.bind(this)
            }
            );
        },

    });

});