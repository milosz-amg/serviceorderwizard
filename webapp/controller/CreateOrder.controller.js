sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/mr/serviceorderwizard/model/models",
    "com/mr/serviceorderwizard/model/serviceOrderModel",
    "sap/m/MessageBox",
    "com/mr/serviceorderwizard/formatter"
], function (Controller, models, serviceOrderModel, MessageBox, formatter) {
    "use strict";

    return Controller.extend("com.mr.serviceorderwizard.controller.CreateOrder", {
        formatter: formatter,
        onInit: function () {
            this._initODataModel();

            // Inicjalizacja pustego modelu dla danych zamówienia
            var oOrderModel = new sap.ui.model.json.JSONModel({
                personalData: {
                    firstName: "",
                    lastName: "",
                    phoneNumber: "",
                    addressFirstLine: "",
                    addressSecondLine: "",
                    addressZipCode: "",
                    addressCity: ""
                },
                deviceData: {
                    deviceType: "",
                    deviceTypeKey: "",
                    deviceModel: "",
                    deviceModelKey: "",
                    deviceSerialNumber: "",
                    faultDescription: ""
                },
                visitData: {
                    visitDate: null,
                    visitTime: "",
                    visitTimeKey: ""
                },
                status: "New"
            });

            this.getView().setModel(oOrderModel, "orderData");

            // Załaduj typy urządzeń z serwera
            this._loadDeviceTypes();

            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");

            // Zapisz referencje do elementów nawigacyjnych
            this._oNavContainer = this.byId("wizardNavContainer");
            this._oWizardContentPage = this.byId("wizardContentPage");

            // Po wyrenderowaniu widoku zresetuj wizard i zablokuj pierwszy krok
            this.getView().addEventDelegate({
                onAfterShow: function () {
                    // Reset wszystkich danych i stanu wizarda
                    this._resetWizard();

                    // Zablokuj pierwszy krok
                    var oStep = oView.byId("stepPersonalData");
                    if (oWizard && oStep) {
                        oWizard.invalidateStep(oStep);
                    }
                }.bind(this)  // Ważne: bind(this) aby mieć dostęp do metod kontrolera
            });
        },


        _initODataModel: function () {
            // Create OData model
            var oModel = serviceOrderModel.createServiceOrderModel();
            this.getView().setModel(oModel, "orderModel");
        },

        _getText: function (sKey, aArgs) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        /**
         * Ładuje typy urządzeń z serwera OData
         * @private
         */
        _loadDeviceTypes: function () {
            serviceOrderModel.fetchDeviceTypes()
                .then(function (aDeviceTypes) {
                    // Utwórz model JSON z typami urządzeń
                    var oDeviceTypesModel = new sap.ui.model.json.JSONModel(aDeviceTypes);
                    this.getView().setModel(oDeviceTypesModel, "deviceTypes");
                }.bind(this))
                .catch(function (oError) {
                    console.error(this._getText("deviceTypesLoadError"));
                    sap.m.MessageBox.error(this._getText("deviceTypesLoadError"));
                }.bind(this));
        },

        _loadDeviceModels: function (deviceTypeId) {
            var oView = this.getView();
            var oDeviceModelComboBox = oView.byId("deviceModelInput");

            // Pokaż loading indicator
            oDeviceModelComboBox.setBusy(true);

            serviceOrderModel.fetchDeviceModelsByType(deviceTypeId)
                .then(function (aDeviceModels) {

                    // Utwórz model JSON z modelami urządzeń
                    var oDeviceModelsModel = new sap.ui.model.json.JSONModel(aDeviceModels);
                    oView.setModel(oDeviceModelsModel, "deviceModels");

                    // Usuń loading indicator
                    oDeviceModelComboBox.setBusy(false);

                    // Dodaj items do ComboBox
                    oDeviceModelComboBox.removeAllItems();
                    aDeviceModels.forEach(function (oModel) {
                        oDeviceModelComboBox.addItem(new sap.ui.core.Item({
                            key: oModel.Id,
                            text: oModel.ModelName
                        }));
                    });

                }.bind(this))
                .catch(function (oError) {
                    console.error("Error loading device models:", oError);
                    oDeviceModelComboBox.setBusy(false);

                });
        },

        validatePersonalDataName: function () {
            var oView = this.getView();
            var bValid = true;
            // Pola do walidacji
            var oFirstNameInput = oView.byId("firstNameInput");

            if (!oFirstNameInput.getValue().trim() || oFirstNameInput.getValue().trim().length < 3) {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Error);
                oFirstNameInput.setValueStateText(this._getText("firstNameValidationError"));
                bValid = false;
            } else {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Success);
            }
            return bValid;
        },

        validatePersonalDataLastName: function () {
            var oView = this.getView();
            var bValid = true;
            // Pola do walidacji
            var oLastNameInput = oView.byId("lastNameInput");

            if (!oLastNameInput.getValue().trim() || oLastNameInput.getValue().trim().length < 2) {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Error);
                oLastNameInput.setValueStateText(this._getText("lastNameValidationError"));
                bValid = false;
            } else {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Success);
            }
            return bValid;
        },

        validatePersonalDataPhoneNumber: function () {
            var oView = this.getView();
            var bValid = true;

            var oPhoneNumberInput = oView.byId("phoneNumberInput");
            var sPhoneNumber = oPhoneNumberInput.getValue().trim();
            var oPhoneRegex = /^(?:\+\d{2}[ -]?)?(?:\d{9}|\d{3}(?:[ -]\d{3}){2})$/;

            if (!sPhoneNumber || !oPhoneRegex.test(sPhoneNumber)) {
                oPhoneNumberInput.setValueState(sap.ui.core.ValueState.Error);
                oPhoneNumberInput.setValueStateText(this._getText("phoneNumberValidationError"));
                bValid = false;
            } else {
                oPhoneNumberInput.setValueState(sap.ui.core.ValueState.Success);
            }

            return bValid;
        },

        validatePersonalDataZipCode: function () {
            var oView = this.getView();
            var bValid = true;

            var oZipCodeInput = oView.byId("addressZipCodeInput");
            var sZipCode = oZipCodeInput.getValue().trim();
            var oZipCodeRegex = /^\d{5}$|^\d{2} \d{3}$|^\d{2}-\d{3}$/;

            if (!sZipCode || !oZipCodeRegex.test(sZipCode)) {
                oZipCodeInput.setValueState(sap.ui.core.ValueState.Error);
                oZipCodeInput.setValueStateText(this._getText("zipCodeValidationError"));
                bValid = false;
            } else {
                oZipCodeInput.setValueState(sap.ui.core.ValueState.Success);
            }
            return bValid;
        },

        validatePersonalDataCity: function () {
            var oView = this.getView();
            var bValid = true;
            var oCityInput = oView.byId("addressCityInput");
            var oCityRegex = /^\p{L}+(?:[ \p{L}'’\.]*\p{L}+)*(?:\s*-\s*\p{L}+(?:[ \p{L}'’\.]*\p{L}+)*)*$/u;

            if (!oCityInput.getValue().trim() || !oCityRegex.test(oCityInput.getValue().trim())) {
                oCityInput.setValueState(sap.ui.core.ValueState.Error);
                oCityInput.setValueStateText(this._getText("cityValidationError"));
                bValid = false;
            } else {
                oCityInput.setValueState(sap.ui.core.ValueState.Success);
            }
            return bValid;
        },

        validatePersonalData: function (bSilent) {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepPersonalData");
            var bValid = true;


            if (this.byId("firstNameInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("lastNameInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("phoneNumberInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("addressZipCodeInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("addressCityInput").getValueState() != sap.ui.core.ValueState.Success
            ) {
                if (!bSilent) {
                    sap.m.MessageToast.show(this._getText("validationErrorMessage"));
                }
                bValid = false;
                return bValid;
            }

            // Ustaw stan kroku w zależności od wyników walidacji
            if (bValid) {
                oWizard.validateStep(oStep);
                if (!bSilent) {
                    sap.m.MessageToast.show(this._getText("personalDataValidationSuccess"));
                }


                var oValidateButton = oView.byId("validatePersonalButton");
                if (oValidateButton) {
                    oValidateButton.setVisible(false);
                }
            } else {
                oWizard.invalidateStep(oStep);
            }

            return bValid;
        },
        onDeviceTypeChange: function (oEvent) {
            var oView = this.getView();
            var oDeviceTypeComboBox = oView.byId("deviceTypeComboBox");
            var oDeviceModelComboBox = oView.byId("deviceModelInput");

            // Pobierz ID wybranego typu urządzenia
            var sSelectedDeviceTypeId = oEvent.getParameter("selectedKey") ||
                oDeviceTypeComboBox.getSelectedKey() ||
                oEvent.getSource().getSelectedKey();

            // Wyczyść wszystkie opcje modeli tylko jeśli wybrano typ z listy
            oDeviceModelComboBox.setValue("");
            oDeviceModelComboBox.removeAllItems();

            // Dynamicznie załaduj modele urządzeń tylko dla wybranego typu z bazy danych
            if (sSelectedDeviceTypeId) {
                this._loadDeviceModels(sSelectedDeviceTypeId);
            } else {
                console.log("Użytkownik wpisał własny typ urządzenia:", oDeviceTypeComboBox.getValue());
            }

            this.validateFaultDescDeviceType();
        },

        validateFaultDescDeviceType: function () {
            var oView = this.getView();
            var bValid = true;

            // Pola do walidacji
            var oDeviceTypeComboBox = oView.byId("deviceTypeComboBox");
            var sValue = oDeviceTypeComboBox.getValue();

            // Akceptuj jeśli jest wybrana opcja z listy lub wpisana niepusta wartość
            if (!oDeviceTypeComboBox.getSelectedKey() && (!sValue || sValue.trim() === "")) {
                oDeviceTypeComboBox.setValueState(sap.ui.core.ValueState.Error);
                oDeviceTypeComboBox.setValueStateText(this._getText("deviceTypeValidationError"));
                bValid = false;
            } else {
                oDeviceTypeComboBox.setValueState(sap.ui.core.ValueState.Success);
                // set property potrzebne do wartosci wpisanych z ręki
                if (!oDeviceTypeComboBox.getSelectedKey() && sValue) {
                    var oModel = this.getView().getModel("orderData");
                    oModel.setProperty("/deviceData/deviceType", sValue.trim());
                    oModel.setProperty("/deviceData/deviceTypeKey", ""); // klucz pusty dla wartości niestandardowej
                }
            }
            return bValid;
        },

        validateFaultDescDeviceModel: function () {
            var oView = this.getView();
            var bValid = true;

            // Pola do walidacji
            var oDeviceModelInput = oView.byId("deviceModelInput");
            var sValue = oDeviceModelInput.getValue();

            // Akceptuj jeśli jest wybrana opcja z listy lub wpisana niepusta wartość
            if (!oDeviceModelInput.getSelectedKey() && (!sValue || sValue.trim() === "")) {
                oDeviceModelInput.setValueState(sap.ui.core.ValueState.Error);
                oDeviceModelInput.setValueStateText(this._getText("deviceModelValidationError"));
                bValid = false;
            } else {
                oDeviceModelInput.setValueState(sap.ui.core.ValueState.Success);
                //wartosc reczna setProperty
                if (!oDeviceModelInput.getSelectedKey() && sValue) {
                    var oModel = this.getView().getModel("orderData");
                    oModel.setProperty("/deviceData/deviceModel", sValue.trim());
                    oModel.setProperty("/deviceData/deviceModelKey", ""); // czyszczenie klucza
                }
            }
            return bValid;
        },

        validateFaultDesc: function (bSilent) {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepFaultDesc");
            var bValid = true;

            if (this.byId("deviceTypeComboBox").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("deviceModelInput").getValueState() != sap.ui.core.ValueState.Success
            ) {
                if (!bSilent) {
                    sap.m.MessageToast.show(this._getText("validationErrorMessage"));
                }
                bValid = false;
                return bValid;

            }

            // Ustaw stan kroku w zależności od wyników walidacji
            if (bValid) {
                oWizard.validateStep(oStep);
                var oValidateButton = oView.byId("validateDeviceButton");
                if (oValidateButton) {
                    oValidateButton.setVisible(false);
                }
            } else {
                oWizard.invalidateStep(oStep);
            }

            return bValid;
        },


        validateVisitDateDate: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel("orderData");
            var oVisitDateInput = oView.byId("visitDateInput");
            var bValid = true;
            var oVisitDate = oVisitDateInput.getDateValue();

            // Walidacja daty wizyty
            if (!oVisitDate) {
                oVisitDateInput.setValueState(sap.ui.core.ValueState.Error);
                oVisitDateInput.setValueStateText(this._getText("visitDateValidationError"));
                bValid = false;
            } else {
                oVisitDateInput.setValueState(sap.ui.core.ValueState.Success);
                // setProperty - datepicker czasami się buguje
                oModel.setProperty("/visitData/visitDate", oVisitDate);
                console.log("Data wizyty ustawiona:", oVisitDate);
            }
            return bValid;
        },

        validateVisitDateHour: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel("orderData");
            var oVisitHourSelect = oView.byId("visitHourSelect");
            var bValid = true;

            if (!oVisitHourSelect.getSelectedKey()) {
                bValid = false;
                oVisitHourSelect.setValueState(sap.ui.core.ValueState.Error);
                oVisitHourSelect.setValueStateText(this._getText("visitTimeValidationError"));
                bValid = false;
            } else {
                oVisitHourSelect.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizuj nazwę czasu na podstawie wybranej opcji
                var oSelectedItem = oVisitHourSelect.getSelectedItem();
                if (oSelectedItem) {
                    oModel.setProperty("/visitData/visitTime", oSelectedItem.getText());
                }
            }

            return bValid;
        },

        validateVisitDate: function (bSilent) {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepVisitDate");
            var bValid = true;

            if (this.byId("visitDateInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("visitHourSelect").getValueState() != sap.ui.core.ValueState.Success
            ) {
                if (!bSilent) {
                    sap.m.MessageToast.show(this._getText("validationErrorMessage"));
                }
                bValid = false;
                return bValid;
            }

            if (bValid) {
                oWizard.validateStep(oStep);
                if (!bSilent) {
                    sap.m.MessageToast.show(this._getText("visitDateValidationSuccess"));
                }
                var oValidateButton = oView.byId("validateVisitButton");
                if (oValidateButton) {
                    oValidateButton.setVisible(false);
                }
            } else {
                oWizard.invalidateStep(oStep);
            }

            return bValid;
        },

        onSubmitOrder: function () {
            // Przed zatwierdzeniem ponownie zwaliduj wszystkie kroki
            if (this._validateAllSteps()) {
                // Wszystkie kroki są prawidłowe - przejdź do ekranu podsumowania
                this.wizardCompletedHandler();
            } else {
                // któryś z kroków jest nieprawidłowy, pokaż komunikat
                sap.m.MessageBox.error(this._getText("dataValidationError"), {
                    title: this._getText("dataValidationErrorTitle")
                });
            }
        },

        /**
         * Waliduje ponownie wszystkie kroki formularza
         * @returns {boolean} true jeśli wszystkie kroki są prawidłowe, false w przeciwnym razie
         * @private
         */
        _validateAllSteps: function () {
            // Najpierw uruchom walidację wszystkich poszczególnych pól
            // this._validateAllFields();

            // Następnie sprawdź ogólną walidację każdego kroku (silent = true, aby nie pokazywać MessageToast)
            var bStep1Valid = this.validatePersonalData(true);
            var bStep2Valid = this.validateFaultDesc(true);
            var bStep3Valid = this.validateVisitDate(true);

            // Zwróć true tylko jeśli wszystkie kroki są prawidłowe
            return bStep1Valid && bStep2Valid && bStep3Valid;
        },

        wizardCompletedHandler: function () {
            // Przejdź do ekranu podsumowania
            this._oNavContainer.to(this.byId("wizardReviewPage"));
        },

        handleWizardSubmit: function () {
            var that = this;
            MessageBox.confirm(this._getText("orderConfirmationMessage"), {
                title: this._getText("orderConfirmationTitle"),
                actions: [this._getText("yesButton"), this._getText("noButton")],
                emphasizedAction: this._getText("yesButton"),
                onClose: function (oAction) {
                    if (oAction === that._getText("yesButton")) {
                        var oModel = that.getView().getModel("orderData");
                        var oData = oModel.getData();

                        // Pobranie danych z modelu
                        var oOrderData = {
                            firstName: oData.personalData.firstName,
                            lastName: oData.personalData.lastName,
                            phoneNumber: oData.personalData.phoneNumber,
                            addressFirstLine: oData.personalData.addressFirstLine,
                            addressSecondLine: oData.personalData.addressSecondLine || "",
                            addressZipCode: oData.personalData.addressZipCode,
                            addressCity: oData.personalData.addressCity,
                            deviceType: oData.deviceData.deviceType,
                            deviceModel: oData.deviceData.deviceModel,
                            deviceSerialNumber: oData.deviceData.deviceSerialNumber || "",
                            faultDescription: oData.deviceData.faultDescription,
                            visitDate: oData.visitData.visitDate ?
                                oData.visitData.visitDate.toLocaleDateString() : "",
                            visitTime: oData.visitData.visitTime,
                            status: oData.status
                        };

                        // Zapis z użyciem OData V2 model
                        that._saveOrderData(oOrderData);
                    }
                }
            });
        },

        handleWizardCancel: function () {
            var that = this;
            MessageBox.confirm(this._getText("orderCancelConfirmationMessage"), {
                actions: [this._getText("yesButton"), this._getText("noButton")],
                title: this._getText("orderCancelConfirmationTitle"),
                emphasizedAction: this._getText("noButton"),
                onClose: function (oAction) {
                    if (oAction === that._getText("yesButton")) {
                        that._resetWizard();
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                        oRouter.navTo("RouteHome");
                    }
                }
            });
        },

        backToWizardContent: function () {
            this._oNavContainer.backToPage(this._oWizardContentPage.getId());
        },

        _saveOrderData: function (oOrderData) {
            var oModel = this.getView().getModel("orderModel");

            var formattedDate = this.formatter.formatDateForBackend(oOrderData.visitDate);
            var formattedTime = this.formatter.formatTimeForBackend(oOrderData.visitTime);

            // Mapuj dane do formatu wymaganego przez backend
            var oPayload = {
                Firstname: oOrderData.firstName,
                Lastname: oOrderData.lastName,
                Phonenumber: oOrderData.phoneNumber,
                Addressfirstline: oOrderData.addressFirstLine,
                Addresssecondline: oOrderData.addressSecondLine,
                Addresszipcode: oOrderData.addressZipCode,
                Addresscity: oOrderData.addressCity,
                Devicetype: oOrderData.deviceType,
                Devicemodel: oOrderData.deviceModel,
                Deviceserialnumber: oOrderData.deviceSerialNumber,
                Faultdescription: oOrderData.faultDescription,
                Visitdate: formattedDate,
                Visittime: formattedTime,
                Status: oOrderData.status,
                OrderCreationDate: new Date().toISOString().slice(0, 10).replace(/-/g, "") // Dzisiejsza data w formacie YYYYMMDD
            };

            // Use service order model layer to create service order
            serviceOrderModel.createServiceOrder(oPayload, oModel)
                .then(() => {
                    sap.m.MessageToast.show(this._getText("orderSubmitSuccess"));
                    // Optionally navigate back to home or reset wizard
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteOrders");
                })
                .catch((oError) => {
                    var sErrorMsg = this._getText("orderCreationError");
                    if (oError.message) {
                        sErrorMsg += ": " + oError.message;
                    } else if (oError.responseText) {
                        sErrorMsg += ": " + oError.responseText;
                    }
                    sap.m.MessageBox.error(sErrorMsg);
                    console.error("Order creation error:", oError);
                });
        },

        // Funkcje edycji kroków
        editStepOne: function () {
            this._handleNavigationToStep(0);
        },

        editStepTwo: function () {
            this._handleNavigationToStep(1);
        },

        editStepThree: function () {
            this._handleNavigationToStep(2);
        },

        _handleNavigationToStep: function (iStepNumber) {
            var fnAfterNavigate = function () {
                this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
                this.byId("createOrderWizard").goToStep(this.byId("createOrderWizard").getSteps()[iStepNumber]);
            }.bind(this);

            this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
            this.backToWizardContent();
        },

        /**
         * Pobiera listę kontrolek z przywiązaniem do modelu orderData
         * @param {sap.ui.core.mvc.View} oView - Widok zawierający kontrolki
         * @returns {Array} Lista kontrolek z przywiązaniem
         * @private
         */
        _getBindedControls: function (oView) {
            var aControls = [];

            // Funkcja rekurencyjna do przeszukiwania kontrolek
            function findBindings(oControl) {
                if (!oControl) {
                    return;
                }

                // Sprawdź czy kontrolka ma przywiązania do modelu orderData
                var aBindingInfos = oControl.getBindingInfo ? Object.keys(oControl.getBindingInfo() || {}) : [];
                if (aBindingInfos.length > 0) {
                    var bHasOrderDataBinding = false;

                    aBindingInfos.forEach(function (sProperty) {
                        var oBinding = oControl.getBindingInfo(sProperty);
                        if (oBinding && oBinding.parts) {
                            oBinding.parts.forEach(function (oPart) {
                                if (oPart.model === "orderData") {
                                    bHasOrderDataBinding = true;
                                }
                            });
                        }
                    });

                    if (bHasOrderDataBinding) {
                        aControls.push({
                            control: oControl,
                            bindings: aBindingInfos
                        });
                    }
                }

                // Rekurencyjnie sprawdź zagnieżdżone kontrolki
                if (oControl.getContent) {
                    var aContent = oControl.getContent() || [];
                    aContent.forEach(findBindings);
                }

                if (oControl.getItems) {
                    var aItems = oControl.getItems() || [];
                    aItems.forEach(findBindings);
                }

                if (oControl.getPages) {
                    var aPages = oControl.getPages() || [];
                    aPages.forEach(findBindings);
                }

                if (oControl.getSections) {
                    var aSections = oControl.getSections() || [];
                    aSections.forEach(findBindings);
                }
            }

            findBindings(oView);
            return aControls;
        },

        /**
         * Odwiązuje przywiązania modelu od kontrolek
         * @param {Array} aControls - Lista kontrolek do odwiązania
         * @private
         */
        _unbindControls: function (aControls) {
            aControls.forEach(function (oControlInfo) {
                var oControl = oControlInfo.control;
                var aBindings = oControlInfo.bindings;

                aBindings.forEach(function (sProperty) {
                    // Zachowaj informacje o przywiązaniu przed odwiązaniem
                    var oBindingInfo = oControl.getBindingInfo(sProperty);
                    oControl._savedBindingInfo = oControl._savedBindingInfo || {};
                    oControl._savedBindingInfo[sProperty] = oBindingInfo;

                    oControl.unbindProperty(sProperty);
                });
            });
        },

        /**
         * Ponownie przywiązuje kontrolki do modelu
         * @param {Array} aControls - Lista kontrolek do przywiązania
         * @param {sap.ui.model.json.JSONModel} oModel - Model do przywiązania
         * @private
         */
        _rebindControls: function (aControls, oModel) {
            aControls.forEach(function (oControlInfo) {
                var oControl = oControlInfo.control;

                if (oControl._savedBindingInfo) {
                    Object.keys(oControl._savedBindingInfo).forEach(function (sProperty) {
                        var oBindingInfo = oControl._savedBindingInfo[sProperty];

                        // Odtwórz przywiązanie z zachowanych informacji
                        oControl.bindProperty(sProperty, oBindingInfo);
                    });

                    // Wyczyść zapisane informacje o przywiązaniach
                    delete oControl._savedBindingInfo;
                }
            });
        },

        _resetWizard: function () {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");

            // Jeśli jesteśmy na stronie podsumowania, wróćmy najpierw do wizarda
            if (this._oNavContainer && this._oNavContainer.getCurrentPage().getId() === this.byId("wizardReviewPage").getId()) {
                this._oNavContainer.to(this._oWizardContentPage);
            }

            // Pobierz istniejący model
            var oOrderModel = oView.getModel("orderData");

            // Tymczasowo odbinduj model aby przyspieszyć reset i uniknąć niepotrzebnych aktualizacji UI
            var aControls = this._getBindedControls(oView);
            this._unbindControls(aControls);

            // Utwórz nowy pusty model z taką samą strukturą jak początkowy
            var oInitModel = new sap.ui.model.json.JSONModel({
                personalData: {},
                deviceData: {},
                visitData: {},
                status: "New"
            });

            // Ustaw dane z nowego modelu na istniejący, zachowując strukturę
            oOrderModel.setData(oInitModel.getData());

            // Odśwież model aby zmiany zostały zarejestrowane
            oOrderModel.refresh(true);

            // Ponownie przywiąż kontrolki do modelu
            this._rebindControls(aControls, oOrderModel);

            // Przywróć widoczność przycisków walidacyjnych dla każdego kroku
            var oValidatePersonalButton = oView.byId("validatePersonalButton");
            var oValidateDeviceButton = oView.byId("validateDeviceButton");
            var oValidateVisitButton = oView.byId("validateVisitButton");

            if (oValidatePersonalButton) {
                oValidatePersonalButton.setVisible(true);
            }

            if (oValidateDeviceButton) {
                oValidateDeviceButton.setVisible(true);
            }

            if (oValidateVisitButton) {
                oValidateVisitButton.setVisible(true);
            }

            // Reset all input fields
            oView.findAggregatedObjects(true, function (oControl) {
                if (oControl.isA("sap.m.Input")) {
                    oControl.setValue("");
                    // Usuń stan walidacji
                    oControl.setValueState(sap.ui.core.ValueState.None);
                    oControl.setValueStateText("");
                } else if (oControl.isA("sap.m.ComboBox")) {
                    oControl.setSelectedKey("");
                    oControl.setValueState(sap.ui.core.ValueState.None);
                    oControl.setValueStateText("");
                } else if (oControl.isA("sap.m.DatePicker")) {
                    oControl.setDateValue(null);
                    oControl.setValueState(sap.ui.core.ValueState.None);
                    oControl.setValueStateText("");
                } else if (oControl.isA("sap.m.Select")) {
                    oControl.setSelectedKey("");
                    oControl.setValueState(sap.ui.core.ValueState.None);
                    oControl.setValueStateText("");
                } else if (oControl.isA("sap.m.TextArea")) {
                    oControl.setValue("");
                    oControl.setValueState(sap.ui.core.ValueState.None);
                    oControl.setValueStateText("");
                }
            });

            // Reset wizard steps
            if (oWizard && oWizard.getSteps && oWizard.getSteps().length > 0) {
                oWizard.discardProgress(oWizard.getSteps()[0]);

                // Oznacz wszystkie kroki jako nieprawidłowe
                oWizard.getSteps().forEach(function (oStep) {
                    oWizard.invalidateStep(oStep);
                });

                // Upewnij się, że jesteśmy na pierwszym kroku
                oWizard.goToStep(oWizard.getSteps()[0]);
            }

            // Wyczyść tekst podsumowania, jeśli istnieje
            var oSummaryText = oView.byId("summaryText");
            if (oSummaryText) {
                oSummaryText.setText("");
            }
        }
    });
});
