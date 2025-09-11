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
                    deviceModel: "",
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

        validatePersonalDataName: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel("orderData");
            var bValid = true;
            // Pola do walidacji
            var oFirstNameInput = oView.byId("firstNameInput");

            if (!oFirstNameInput.getValue().trim() || oFirstNameInput.getValue().trim().length < 3) {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Error);
                oFirstNameInput.setValueStateText("Imię musi mieć co najmniej 3 znaki");
                bValid = false;
            } else {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Success);
                oModel.setProperty("/personalData/firstName", oFirstNameInput.getValue().trim());
            }
            return bValid;
        },

        validatePersonalDataLastName: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel("orderData");
            var bValid = true;
            // Pola do walidacji
            var oLastNameInput = oView.byId("lastNameInput");

            if (!oLastNameInput.getValue().trim() || oLastNameInput.getValue().trim().length < 2) {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Error);
                oLastNameInput.setValueStateText("Nazwisko musi mieć co najmniej 2 znaki");
                bValid = false;
            } else {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Success);
                oModel.setProperty("/personalData/lastName", oLastNameInput.getValue().trim());
            }
            return bValid;
        },

        validatePersonalDataPhoneNumber: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel("orderData");
            var bValid = true;

            var oPhoneNumberInput = oView.byId("phoneNumberInput");
            var sPhoneNumber = oPhoneNumberInput.getValue().trim();
            //TODO: nr telefonu z myślnikami, spacjami
            var oPhoneRegex = /^(?:\+\d{2}[ -]?)?(?:\d{9}|\d{3}(?:[ -]\d{3}){2})$/;

            if (!sPhoneNumber || !oPhoneRegex.test(sPhoneNumber)) {
                oPhoneNumberInput.setValueState(sap.ui.core.ValueState.Error);
                oPhoneNumberInput.setValueStateText("Numer telefonu może zawierać tylko cyfry, znak '+' i spacje");
                bValid = false;
            } else {
                oPhoneNumberInput.setValueState(sap.ui.core.ValueState.Success);
                oModel.setProperty("/personalData/phoneNumber", sPhoneNumber);
            }

            return bValid;
        },

        validatePersonalDataZipCode: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel("orderData");
            var bValid = true;

            var oZipCodeInput = oView.byId("addressZipCodeInput");
            var sZipCode = oZipCodeInput.getValue().trim();
            //TODO: Regex dla formatów: 00000, 00 000, 00-000
            var oZipCodeRegex = /^\d{5}$|^\d{2} \d{3}$|^\d{2}-\d{3}$/;

            if (!sZipCode || !oZipCodeRegex.test(sZipCode)) {
                oZipCodeInput.setValueState(sap.ui.core.ValueState.Error);
                oZipCodeInput.setValueStateText("Wpisz poprawny kod pocztowy (5 cyfr)");
                bValid = false;
            } else {
                oZipCodeInput.setValueState(sap.ui.core.ValueState.Success);
                oModel.setProperty("/personalData/addressZipCode", sZipCode);
            }
            return bValid;
        },

        validatePersonalDataCity: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel("orderData");
            var bValid = true;
            var oCityInput = oView.byId("addressCityInput");
            //TODO: regex dla liter, spacji, myślników
            var oCityRegex = /^\p{L}+(?:[ \p{L}'’\.]*\p{L}+)*(?:\s*-\s*\p{L}+(?:[ \p{L}'’\.]*\p{L}+)*)*$/u;

            if (!oCityInput.getValue().trim() || !oCityRegex.test(oCityInput.getValue().trim())) {
                oCityInput.setValueState(sap.ui.core.ValueState.Error);
                oCityInput.setValueStateText("Miasto jest wymagane");
                bValid = false;
            } else {
                oCityInput.setValueState(sap.ui.core.ValueState.Success);
                oModel.setProperty("/personalData/addressCity", oCityInput.getValue().trim());
            }
            return bValid;
        },

        validatePersonalData: function () {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepPersonalData");
            var oModel = this.getView().getModel("orderData");
            var bValid = true;


            if (this.byId("firstNameInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("lastNameInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("phoneNumberInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("addressZipCodeInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("addressCityInput").getValueState() != sap.ui.core.ValueState.Success
            ) {
                sap.m.MessageToast.show("Uzupełnij wymagane pola lub popraw błędy w formularzu przed zatwierdzeniem danych.");
                bValid = false;
                return bValid;
            }

            // Aktualizacja adresów (nie są wymagane, więc tylko aktualizacja modelu)
            oModel.setProperty("/personalData/addressFirstLine", oView.byId("addressFirstLineInput").getValue().trim());
            oModel.setProperty("/personalData/addressSecondLine", oView.byId("addressSecondLineInput").getValue().trim());

            // Ustaw stan kroku w zależności od wyników walidacji
            if (bValid) {
                oWizard.validateStep(oStep);
                sap.m.MessageToast.show("Dane osobowe zostały pomyślnie zweryfikowane!");


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
            var sSelectedDeviceType = oEvent.getParameter("value");
            var oDeviceModelComboBox = oView.byId("deviceModelInput");

            // Wyczyść wszystkie opcje
            oDeviceModelComboBox.setValue("");
            oDeviceModelComboBox.removeAllItems();

            if (sSelectedDeviceType === "Konsola") {
                //TODO: dodac pobranie z backendu
                oDeviceModelComboBox.addItem(new sap.ui.core.Item({
                    key: "PlayStation5",
                    text: "PlayStation 5"
                }));
                oDeviceModelComboBox.addItem(new sap.ui.core.Item({
                    key: "PlayStation4",
                    text: "PlayStation 4"
                }));
                oDeviceModelComboBox.addItem(new sap.ui.core.Item({
                    key: "XboxSeriesX",
                    text: "Xbox Series X"
                }));
                oDeviceModelComboBox.addItem(new sap.ui.core.Item({
                    key: "XboxOne",
                    text: "Xbox One"
                }));
                oDeviceModelComboBox.addItem(new sap.ui.core.Item({
                    key: "NintendoSwitch",
                    text: "Nintendo Switch"
                }));
            }

            this.validateFaultDescDeviceType();
        },

        validateFaultDescDeviceType: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel("orderData");
            var bValid = true;

            // Pola do walidacji
            var oDeviceTypeComboBox = oView.byId("deviceTypeComboBox");

            if (!oDeviceTypeComboBox.getValue().trim()) {
                oDeviceTypeComboBox.setValueState(sap.ui.core.ValueState.Error);
                oDeviceTypeComboBox.setValueStateText("Wybierz typ urządzenia");
                bValid = false;
            } else {
                oDeviceTypeComboBox.setValueState(sap.ui.core.ValueState.Success);
                oModel.setProperty("/deviceData/deviceType", oDeviceTypeComboBox.getValue().trim());
            }
            return bValid;
        },

        validateFaultDescDeviceModel: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel("orderData");
            var bValid = true;

            // Pola do walidacji
            var oDeviceModelInput = oView.byId("deviceModelInput");

            if (!oDeviceModelInput.getValue().trim()) {
                oDeviceModelInput.setValueState(sap.ui.core.ValueState.Error);
                oDeviceModelInput.setValueStateText("Model urządzenia jest wymagany");
                bValid = false;
            } else {
                oDeviceModelInput.setValueState(sap.ui.core.ValueState.Success);
                oModel.setProperty("/deviceData/deviceModel", oDeviceModelInput.getValue().trim());
            }
            return bValid;
        },

        validateFaultDesc: function () {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepFaultDesc");
            var oModel = this.getView().getModel("orderData");
            var bValid = true;

            var oDeviceSerialInput = oView.byId("deviceSerialNumberInput");
            var oFaultDescInput = oView.byId("faultDescInput");

            if (this.byId("deviceTypeComboBox").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("deviceModelInput").getValueState() != sap.ui.core.ValueState.Success
            ) {
                sap.m.MessageToast.show("Uzupełnij wymagane pola lub popraw błędy w formularzu przed zatwierdzeniem danych.");
                bValid = false;
                return bValid;

            }

            // Aktualizacja numeru seryjnego i opisu usterki (nie są wymagane)
            oModel.setProperty("/deviceData/deviceSerialNumber", oDeviceSerialInput.getValue().trim());
            oModel.setProperty("/deviceData/faultDescription", oFaultDescInput.getValue().trim());

            // Ustaw stan kroku w zależności od wyników walidacji
            if (bValid) {
                oWizard.validateStep(oStep);
                sap.m.MessageToast.show("Opis usterki został pomyślnie zweryfikowany!");
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
                bDateValid = false;
                oVisitDateInput.setValueState(sap.ui.core.ValueState.Error);
                oVisitDateInput.setValueStateText("Data wizyty jest wymagana");
                bValid = false;
            } else {
                oVisitDateInput.setValueState(sap.ui.core.ValueState.Success);
                oModel.setProperty("/visitData/visitDate", oVisitDate);
                console.log(oVisitDate);
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
                oVisitHourSelect.setValueStateText("Wybierz godzinę wizyty");
                bValid = false;
            } else {
                oVisitHourSelect.setValueState(sap.ui.core.ValueState.Success);
                oModel.setProperty("/visitData/visitTime", oVisitHourSelect.getSelectedItem().getText());
                oModel.setProperty("/visitData/visitTimeKey", oVisitHourSelect.getSelectedKey());
            }

            return bValid;
        },

        validateVisitDate: function () {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepVisitDate");
            var bValid = true;

            if (this.byId("visitDateInput").getValueState() != sap.ui.core.ValueState.Success
                || this.byId("visitHourSelect").getValueState() != sap.ui.core.ValueState.Success
            ) {
                sap.m.MessageToast.show("Uzupełnij wymagane pola lub popraw błędy w formularzu przed zatwierdzeniem danych.");
                bValid = false;
                return bValid;
            }

            if (bValid) {
                oWizard.validateStep(oStep);
                sap.m.MessageToast.show("Termin wizyty został pomyślnie wybrany!");
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
            // Przejdź do ekranu podsumowania

            this.wizardCompletedHandler();
        },

        wizardCompletedHandler: function () {
            // Przejdź do ekranu podsumowania
            this._oNavContainer.to(this.byId("wizardReviewPage"));
        },

        handleWizardSubmit: function () {
            var that = this;
            MessageBox.confirm("Czy na pewno chcesz złożyć zamówienie?", {
                title: "Potwierdzenie zamówienia",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
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
            MessageBox.warning("Czy na pewno chcesz anulować zamówienie?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
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

            // Format date for backend (YYYYMMDD)
            var visitDate = oOrderData.visitDate;
            var formattedDate = "";
            if (visitDate) {
                if (typeof visitDate === "string") {
                    // Konwersja z formatu "DD.MM.YYYY" na "YYYYMMDD"
                    var parts = visitDate.split(".");
                    if (parts.length === 3) {
                        formattedDate = parts[2] + parts[1] + parts[0];
                    }
                } else {
                    // Jeśli to obiekt Date
                    var date = new Date(visitDate);
                    formattedDate = date.getFullYear().toString() +
                        ("0" + (date.getMonth() + 1)).slice(-2) +
                        ("0" + date.getDate()).slice(-2);
                }
            }

            // Format time (HHMM)
            var visitTime = oOrderData.visitTime;
            var formattedTime = "";
            if (visitTime) {
                formattedTime = visitTime.replace(":", "");
            }

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
                Deviceserialnumber: oOrderData.deviceSerialNumber,
                Faultdescription: oOrderData.faultDescription,
                Visitdate: formattedDate,
                Visittime: formattedTime,
                Status: oOrderData.status,
                OrderCreationDate: new Date().toISOString().slice(0, 10).replace(/-/g, "") // Dzisiejsza data w formacie YYYYMMDD
            };

            // Use service order model layer to create service order
            serviceOrderModel.createServiceOrder(oPayload, oModel)
                .then(function (oData) {
                    sap.m.MessageToast.show("Zamówienie zostało pomyślnie złożone!");
                    // Optionally navigate back to home or reset wizard
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteOrders");
                }.bind(this))
                .catch(function (oError) {
                    var sErrorMsg = "Błąd podczas składania zamówienia";
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

        _resetWizard: function () {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");

            // Jeśli jesteśmy na stronie podsumowania, wróćmy najpierw do wizarda
            if (this._oNavContainer && this._oNavContainer.getCurrentPage().getId() === this.byId("wizardReviewPage").getId()) {
                this._oNavContainer.to(this._oWizardContentPage);
            }

            // Resetowanie modelu danych do pustych wartości
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
                    deviceModel: "",
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
