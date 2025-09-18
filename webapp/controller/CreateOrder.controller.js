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
                        // oWizard.invalidateStep(oStep);
                    }
                }.bind(this)  // Ważne: bind(this) aby mieć dostęp do metod kontrolera
            });
        },


        _initODataModel: function () {
            // Create OData model
            var oModel = serviceOrderModel.createServiceOrderModel();
            this.getView().setModel(oModel, "orderModel");
        },

        /**
         * Pobiera tekst z modelu i18n
         * @private
         */
        _getText: function (sKey, aArgs) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        validatePersonalDataName: function () {
            var oView = this.getView();
            var bValid = true;
            // Pola do walidacji
            var oFirstNameInput = oView.byId("firstNameInput");
            var sFirstName = oFirstNameInput.getValue().trim();

            // Sprawdź czy pole jest puste
            if (!sFirstName) {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Error);
                oFirstNameInput.setValueStateText(this._getText("firstNameEmptyError"));
                bValid = false;
            }
            // Sprawdź czy imię jest za krótkie
            else if (sFirstName.length < 3) {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Error);
                oFirstNameInput.setValueStateText(this._getText("firstNameTooShortError"));
                bValid = false;
            }
            // Sprawdź format - tylko litery, spacje, apostrofy i kropki
            else if (!/^[\p{L}\s''.]+$/u.test(sFirstName)) {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Error);
                oFirstNameInput.setValueStateText(this._getText("firstNameInvalidFormatError"));
                bValid = false;
            }
            else {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Success);
            }

            return bValid;
        },

        validatePersonalDataLastName: function () {
            var oView = this.getView();
            var bValid = true;
            // Pola do walidacji
            var oLastNameInput = oView.byId("lastNameInput");
            var sLastName = oLastNameInput.getValue().trim();

            // Sprawdź czy pole jest puste
            if (!sLastName) {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Error);
                oLastNameInput.setValueStateText(this._getText("lastNameEmptyError"));
                bValid = false;
            }
            // Sprawdź czy nazwisko jest za krótkie
            else if (sLastName.length < 2) {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Error);
                oLastNameInput.setValueStateText(this._getText("lastNameTooShortError"));
                bValid = false;
            }
            // Sprawdź format - tylko litery, spacje, apostrofy, kropki i myślniki
            else if (!/^[\p{L}\s''.'-]+$/u.test(sLastName)) {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Error);
                oLastNameInput.setValueStateText(this._getText("lastNameInvalidFormatError"));
                bValid = false;
            }
            else {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Success);
            }

            return bValid;
        },

        validatePersonalDataPhoneNumber: function () {
            var oView = this.getView();
            var bValid = true;

            var oPhoneNumberInput = oView.byId("phoneNumberInput");
            var sPhoneNumber = oPhoneNumberInput.getValue().trim();
            var oPhoneRegex = /^\+\d{1,3}\s\d{3}\s\d{3}\s\d{3}$/;

            // Sprawdź czy pole jest puste
            if (!sPhoneNumber) {
                oPhoneNumberInput.setValueState(sap.ui.core.ValueState.Error);
                oPhoneNumberInput.setValueStateText(this._getText("phoneNumberEmptyError"));
                bValid = false;
            }
            // Sprawdź format numeru telefonu
            else if (!oPhoneRegex.test(sPhoneNumber)) {
                oPhoneNumberInput.setValueState(sap.ui.core.ValueState.Error);
                oPhoneNumberInput.setValueStateText(this._getText("phoneNumberInvalidFormatError"));
                bValid = false;
            }
            else {
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

            // Sprawdź czy pole jest puste
            if (!sZipCode) {
                oZipCodeInput.setValueState(sap.ui.core.ValueState.Error);
                oZipCodeInput.setValueStateText(this._getText("zipCodeEmptyError"));
                bValid = false;
            }
            // Sprawdź format kodu pocztowego
            else if (!oZipCodeRegex.test(sZipCode)) {
                oZipCodeInput.setValueState(sap.ui.core.ValueState.Error);
                oZipCodeInput.setValueStateText(this._getText("zipCodeInvalidFormatError"));
                bValid = false;
            }
            else {
                oZipCodeInput.setValueState(sap.ui.core.ValueState.Success);
            }

            return bValid;
        },

        validatePersonalDataCity: function () {
            var oView = this.getView();
            var bValid = true;
            var oCityInput = oView.byId("addressCityInput");
            var sCity = oCityInput.getValue().trim();
            // Regex: co najmniej 2 litery, może zawierać spacje i myślniki
            var oCityRegex = /^[A-Za-z]{2,}(?:[\s-]?[A-Za-z]+)*$/;

            if (!sCity) {
                oCityInput.setValueState(sap.ui.core.ValueState.Error);
                oCityInput.setValueStateText(this._getText("cityEmptyError"));
                bValid = false;
            }
            else if (sCity.length < 2) {
                oCityInput.setValueState(sap.ui.core.ValueState.Error);
                oCityInput.setValueStateText(this._getText("cityTooShortError"));
                bValid = false;
            }
            else if (!oCityRegex.test(sCity)) {
                oCityInput.setValueState(sap.ui.core.ValueState.Error);
                oCityInput.setValueStateText(this._getText("cityInvalidFormatError"));
                bValid = false;
            }
            else {
                oCityInput.setValueState(sap.ui.core.ValueState.Success);
            }

            return bValid;
        },

        validatePersonalData: function (bLoud) {
            var oView = this.getView();
            var oStep = oView.byId("stepPersonalData");
            var bValid = true;
            console.log("Validating personal data...");


            if (this.byId("firstNameInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("lastNameInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("phoneNumberInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("addressZipCodeInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("addressCityInput").getValueState() != sap.ui.core.ValueState.Success
            ) {
                if (bLoud) {
                    sap.m.MessageToast.show(this._getText("validationErrorMessage"));
                }
                oStep.setNextStep(this.byId("stepPersonalData"));
                bValid = false;
                return bValid;
            }

            if (bValid) {
                oStep.setNextStep(this.byId("stepFaultDesc"));
                if (bLoud) {
                    sap.m.MessageToast.show(this._getText("personalDataValidationSuccess"));
                }
            }

            return bValid;
        },

        onDeviceTypeChange: function (oEvent) {
            var oView = this.getView();
            var oDeviceTypeComboBox = oView.byId("deviceTypeComboBox");
            var oDeviceModelComboBox = oView.byId("deviceModelInput");
            var oBinding = oDeviceModelComboBox.getBinding("items");

            oDeviceModelComboBox.setValue("");
            oDeviceModelComboBox.setSelectedKey("");
            oDeviceModelComboBox.setValueState(sap.ui.core.ValueState.None);

            // ID wybranego typu urządzenia
            var sSelectedDeviceTypeId = oDeviceTypeComboBox.getSelectedKey();

            if (sSelectedDeviceTypeId) {
                // ustaw filtr po DeviceTypeId
                var oFilter = new sap.ui.model.Filter("DeviceTypeId", sap.ui.model.FilterOperator.EQ, sSelectedDeviceTypeId);
                oBinding.filter([oFilter]);

                // busy indicator na czas ładowania
                oDeviceModelComboBox.setBusy(true);
                oBinding.attachEventOnce("dataReceived", function () {
                    oDeviceModelComboBox.setBusy(false);
                });

            } else {
                console.log("Użytkownik wpisał własny typ urządzenia:", oDeviceTypeComboBox.getValue());
                var oModel = this.getView().getModel("orderData");
                oModel.setProperty("/deviceData/deviceTypeKey", ""); // klucz pusty dla wartości urzytkownika
            }

            this.validateFaultDescDeviceType();
        },


        onDeviceModelChange: function () {
            this.validateFaultDescDeviceModel();
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
                    oModel.setProperty("/deviceData/deviceModelKey", ""); // klucz pusty dla wartości niestandardowej
                }
            }
            return bValid;
        },

        validateFaultDesc: function (bLoud) {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepFaultDesc");
            var bValid = true;

            if (this.byId("deviceTypeComboBox").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("deviceModelInput").getValueState() != sap.ui.core.ValueState.Success
            ) {
                if (bLoud) {
                    sap.m.MessageToast.show(this._getText("validationFaultDescErrorMessage"));
                }
                oStep.setNextStep(this.byId("stepFaultDesc"));
                bValid = false;
                return bValid;

            }
            else {
                oStep.setNextStep(this.byId("stepVisitDate"));
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

        validateVisitDate: function (bLoud) {
            var oView = this.getView();
            var oStep = oView.byId("stepVisitDate");
            var bValid = true;

            if (this.byId("visitDateInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("visitHourSelect").getValueState() != sap.ui.core.ValueState.Success
            ) {
                if (bLoud) {
                    sap.m.MessageToast.show(this._getText("validationErrorMessage"));
                }
                oStep.setNextStep(this.byId("stepVisitDate"));
                bValid = false;
                return bValid;
            }

            return bValid;
        },

        // onSubmitOrder: function () {
        //     // Przed zatwierdzeniem ponownie zwaliduj wszystkie kroki

        //     bFormValid = this._validateAllSteps();
        //     console.log(bFormValid);
        //     if (bFormValid) {
        //         // Wszystkie kroki są prawidłowe - przejdź do ekranu podsumowania
        //         this.wizardCompletedHandler();

        //     } else {
        //         // któryś z kroków jest nieprawidłowy, pokaż komunikat
        //         sap.m.MessageBox.error(this._getText("dataValidationError"), {
        //             title: this._getText("dataValidationErrorTitle")

        //         });
        //     }
        // },

        // /**
        //  * Waliduje ponownie wszystkie kroki formularza
        //  * @returns {boolean} true jeśli wszystkie kroki są prawidłowe, false w przeciwnym razie
        //  * @private
        //  */
        // _validateAllSteps: function () {
        //     var bStep1Valid = this.validatePersonalData(false);
        //     var bStep2Valid = this.validateFaultDesc(false);
        //     var bStep3Valid = this.validateVisitDate(false);

        //     // Zwróć true tylko jeśli wszystkie kroki są prawidłowe
        //     return [bStep1Valid, bStep2Valid, bStep3Valid];
        //     // return false; // tymczasowo wyłączone do testów
        // },

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
                        console.log("User confirmed order submission.");
                        console.log("all fields validation");

                        // validate all fields one more time
                        if (that.byId("visitDateInput").getValueState() != sap.ui.core.ValueState.Success
                            || that.byId("visitHourSelect").getValueState() != sap.ui.core.ValueState.Success
                            || that.byId("deviceTypeComboBox").getValueState() != sap.ui.core.ValueState.Success
                            || that.byId("deviceModelInput").getValueState() != sap.ui.core.ValueState.Success
                            || that.byId("firstNameInput").getValueState() != sap.ui.core.ValueState.Success
                            || that.byId("lastNameInput").getValueState() != sap.ui.core.ValueState.Success
                            || that.byId("phoneNumberInput").getValueState() != sap.ui.core.ValueState.Success
                            || that.byId("addressZipCodeInput").getValueState() != sap.ui.core.ValueState.Success
                            || that.byId("addressCityInput").getValueState() != sap.ui.core.ValueState.Success
                        ) {
                            console.log("Validation failed");
                            sap.m.MessageToast.show(that._getText("validationErrorMessage"));
                        } else {
                            console.log("Validation succeeded");
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
                OrderCreationDate: this.formatter.formatJSDateForBackend() // today YYYYMMDD
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
                } else if (oControl.isA("sap.m.MaskInput")) {
                    oControl.setValue("");
                    oControl.setValueState(sap.ui.core.ValueState.None);
                    oControl.setValueStateText("");
                }
            });

            // Reset wizard steps
            if (oWizard && oWizard.getSteps && oWizard.getSteps().length > 0) {
                oWizard.discardProgress(oWizard.getSteps()[0]);

                // Upewnij się, że jesteśmy na pierwszym kroku
                oWizard.goToStep(oWizard.getSteps()[0]);
            }

        }
    });
});
