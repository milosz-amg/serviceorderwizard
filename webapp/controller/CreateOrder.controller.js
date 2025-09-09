sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/mr/serviceorderwizard/model/models",
    "com/mr/serviceorderwizard/model/serviceOrderModel",
    "sap/m/MessageBox"
], function (Controller, models, serviceOrderModel, MessageBox) {
    "use strict";

    return Controller.extend("com.mr.serviceorderwizard.controller.CreateOrder", {
        formatDate: function (oDate) {
            if (!oDate) {
                return "";
            }

            if (typeof oDate === "string") {
                return oDate;
            }

            return oDate.toLocaleDateString();
        },
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

        _setStepInvalid: function (sStepId) {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId(sStepId);

            if (oStep) {
                oWizard.invalidateStep(oStep);
            }
        },

        _setStepValid: function (sStepId) {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId(sStepId);

            if (oStep) {
                oWizard.validateStep(oStep);
            }
        },

        validatePersonalData: function () {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepPersonalData");
            var oModel = this.getView().getModel("orderData");
            var bValid = true;

            // Pola do walidacji
            var oFirstNameInput = oView.byId("firstNameInput");
            var oLastNameInput = oView.byId("lastNameInput");
            var oPhoneNumberInput = oView.byId("phoneNumberInput");
            var oZipCodeInput = oView.byId("addressZipCodeInput");
            var oCityInput = oView.byId("addressCityInput");
            var oFirstLineInput = oView.byId("addressFirstLineInput");

            // Walidacja imienia
            if (!oFirstNameInput.getValue().trim() || oFirstNameInput.getValue().trim().length < 3) {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Error);
                oFirstNameInput.setValueStateText("Imię musi mieć co najmniej 3 znaki");
                bValid = false;
            } else {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/personalData/firstName", oFirstNameInput.getValue().trim());
            }

            // Walidacja nazwiska
            if (!oLastNameInput.getValue().trim() || oLastNameInput.getValue().trim().length < 2) {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Error);
                oLastNameInput.setValueStateText("Nazwisko musi mieć co najmniej 2 znaki");
                bValid = false;
            } else {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/personalData/lastName", oLastNameInput.getValue().trim());
            }

            // Walidacja numeru telefonu
            var sPhoneNumber = oPhoneNumberInput.getValue().trim();
            var oPhoneRegex = /^[+\d\s]+$/; // RegEx: cyfry, + i spacje

            if (!sPhoneNumber || !oPhoneRegex.test(sPhoneNumber)) {
                oPhoneNumberInput.setValueState(sap.ui.core.ValueState.Error);
                oPhoneNumberInput.setValueStateText("Numer telefonu może zawierać tylko cyfry, znak '+' i spacje");
                bValid = false;
            } else {
                oPhoneNumberInput.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/personalData/phoneNumber", sPhoneNumber);
            }

            // Walidacja kodu pocztowego (tylko 5 cyfr)
            var sZipCode = oZipCodeInput.getValue().trim();
            var oZipCodeRegex = /^\d{5}$/; // Regex dla dokładnie 5 cyfr

            if (!sZipCode || !oZipCodeRegex.test(sZipCode)) {
                oZipCodeInput.setValueState(sap.ui.core.ValueState.Error);
                oZipCodeInput.setValueStateText("Wpisz poprawny kod pocztowy (5 cyfr)");
                bValid = false;
            } else {
                oZipCodeInput.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/personalData/addressZipCode", sZipCode);
            }

            // Walidacja miasta
            if (!oCityInput.getValue().trim()) {
                oCityInput.setValueState(sap.ui.core.ValueState.Error);
                oCityInput.setValueStateText("Miasto jest wymagane");
                bValid = false;
            } else {
                oCityInput.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/personalData/addressCity", oCityInput.getValue().trim());
            }

            // Aktualizacja adresów (nie są wymagane, więc tylko aktualizacja modelu)
            oModel.setProperty("/personalData/addressFirstLine", oFirstLineInput.getValue().trim());
            oModel.setProperty("/personalData/addressSecondLine", oView.byId("addressSecondLineInput").getValue().trim());

            // Ustaw stan kroku w zależności od wyników walidacji
            if (bValid) {
                oWizard.validateStep(oStep);
                sap.m.MessageToast.show("Dane osobowe zostały pomyślnie zweryfikowane!");
            } else {
                oWizard.invalidateStep(oStep);
            }

            return bValid;
        },

        validateFaultDesc: function () {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepFaultDesc");
            var oModel = this.getView().getModel("orderData");
            var bValid = true;

            // Pola do walidacji
            var oDeviceTypeComboBox = oView.byId("deviceTypeComboBox");
            var oDeviceModelInput = oView.byId("deviceModelInput");
            var oDeviceSerialInput = oView.byId("deviceSerialNumberInput");
            var oFaultDescInput = oView.byId("faultDescInput");

            // Walidacja typu urządzenia
            if (!oDeviceTypeComboBox.getSelectedKey()) {
                oDeviceTypeComboBox.setValueState(sap.ui.core.ValueState.Error);
                oDeviceTypeComboBox.setValueStateText("Wybierz typ urządzenia");
                bValid = false;
            } else {
                oDeviceTypeComboBox.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/deviceData/deviceType", oDeviceTypeComboBox.getSelectedItem().getText());
            }

            // Walidacja modelu urządzenia
            if (!oDeviceModelInput.getValue().trim()) {
                oDeviceModelInput.setValueState(sap.ui.core.ValueState.Error);
                oDeviceModelInput.setValueStateText("Model urządzenia jest wymagany");
                bValid = false;
            } else {
                oDeviceModelInput.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/deviceData/deviceModel", oDeviceModelInput.getValue().trim());
            }

            // Aktualizacja numeru seryjnego i opisu usterki (nie są wymagane)
            oModel.setProperty("/deviceData/deviceSerialNumber", oDeviceSerialInput.getValue().trim());
            oModel.setProperty("/deviceData/faultDescription", oFaultDescInput.getValue().trim());

            // Ustaw stan kroku w zależności od wyników walidacji
            if (bValid) {
                oWizard.validateStep(oStep);
                sap.m.MessageToast.show("Opis usterki został pomyślnie zweryfikowany!");
            } else {
                oWizard.invalidateStep(oStep);
            }

            return bValid;
        },
        validateVisitDate: function () {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepVisitDate");
            var oModel = this.getView().getModel("orderData");
            var bDateValid = true;
            var bHourValid = true;

            // Pola do walidacji
            var oVisitDateInput = oView.byId("visitDateInput");
            var oVisitHourSelect = oView.byId("visitHourSelect");

            // Pobierz wartości pól
            var oVisitDate = oVisitDateInput.getDateValue();
            var sVisitHourKey = oVisitHourSelect.getSelectedKey();

            // Walidacja daty wizyty
            if (!oVisitDate) {
                bDateValid = false;
                oVisitDateInput.setValueState(sap.ui.core.ValueState.Error);
                oVisitDateInput.setValueStateText("Data wizyty jest wymagana");
            } else {
                oVisitDateInput.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/visitData/visitDate", oVisitDate);
            }

            // Walidacja godziny wizyty
            if (!sVisitHourKey) {
                bHourValid = false;
                oVisitHourSelect.setValueState(sap.ui.core.ValueState.Error);
                oVisitHourSelect.setValueStateText("Wybierz godzinę wizyty");
            } else {
                oVisitHourSelect.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/visitData/visitTime", oVisitHourSelect.getSelectedItem().getText());
                oModel.setProperty("/visitData/visitTimeKey", sVisitHourKey);
            }

            // Ustaw stan kroku w zależności od wyników walidacji
            if (bDateValid && bHourValid) {
                oWizard.validateStep(oStep);
                sap.m.MessageToast.show("Termin wizyty został pomyślnie wybrany!");
            } else {
                oWizard.invalidateStep(oStep);
            }

            return bDateValid && bHourValid;
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
                Status: oOrderData.status
            };

            console.log("Sending payload:", oPayload);

            // Use service order model layer to create service order
            serviceOrderModel.createServiceOrder(oPayload, oModel)
                .then(function (oData) {
                    sap.m.MessageToast.show("Zamówienie zostało pomyślnie złożone!");
                    // Optionally navigate back to home or reset wizard
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteHome");
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

        onStepActivate: function (oEvent) {
            var oWizard = this.byId("createOrderWizard");
            var oStep = oEvent.getSource();

            // Sprawdź, który krok jest aktywny i wykonaj odpowiednią walidację
            switch (oStep.getId()) {
                case this.createId("stepPersonalData"):
                    this.validatePersonalData();
                    break;
                case this.createId("stepFaultDesc"):
                    this.validateFaultDesc();
                    break;
                case this.createId("stepVisitDate"):
                    this.validateVisitDate();
                    break;
                default:
                    break;
            }
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
