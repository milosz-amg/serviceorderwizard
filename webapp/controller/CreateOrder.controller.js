sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/mr/serviceorderwizard/model/models",
    "com/mr/serviceorderwizard/model/serviceOrderModel"
], function (Controller, models, serviceOrderModel) {
    "use strict";

    return Controller.extend("com.mr.serviceorderwizard.controller.CreateOrder", {
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
                    visitTime: ""
                },
                status: "New"
            });
            
            this.getView().setModel(oOrderModel, "orderData");

            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");

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
            // Create OData V4 model for service orders using service order model layer
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

        validateRequiredEmptyStep: function (vStep) {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep;

            if (typeof vStep === "string") {
                oStep = oView.byId(vStep);
            } else {
                oStep = vStep;
            }

            if (!oStep) return false;

            // znajdź wszystkie wymagane inputy w tym stepie
            var aRequiredInputs = oStep.findAggregatedObjects(true, function (oControl) {
                return oControl.isA("sap.m.Input") && oControl.getRequired();
            });

            // sprawdź, czy wszystkie mają wartość
            var bAllFilled = aRequiredInputs.every(function (oInput) {
                return oInput.getValue().trim().length > 0;
            });

            // ustaw stan kroku w Wizard
            if (bAllFilled) {
                oWizard.validateStep(oStep);
            } else {
                oWizard.invalidateStep(oStep);
            }

            return bAllFilled;
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
            if (!oFirstNameInput.getValue().trim()) {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Error);
                oFirstNameInput.setValueStateText("Imię jest wymagane");
                bValid = false;
            } else {
                oFirstNameInput.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/personalData/firstName", oFirstNameInput.getValue().trim());
            }
            
            // Walidacja nazwiska
            if (!oLastNameInput.getValue().trim()) {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Error);
                oLastNameInput.setValueStateText("Nazwisko jest wymagane");
                bValid = false;
            } else {
                oLastNameInput.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/personalData/lastName", oLastNameInput.getValue().trim());
            }
            
            // Walidacja numeru telefonu
            if (!oPhoneNumberInput.getValue().trim()) {
                oPhoneNumberInput.setValueState(sap.ui.core.ValueState.Error);
                oPhoneNumberInput.setValueStateText("Numer telefonu jest wymagany");
                bValid = false;
            } else {
                oPhoneNumberInput.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/personalData/phoneNumber", oPhoneNumberInput.getValue().trim());
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
            } else {
                oWizard.invalidateStep(oStep);
            }
            
            return bValid;
        },
        validateVisitDate: function(){
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepVisitDate");
            var oModel = this.getView().getModel("orderData");
            var bValid = true;
            
            // Pola do walidacji
            var oVisitDateInput = oView.byId("visitDateInput");
            var oVisitHourSelect = oView.byId("visitHourSelect");
            
            // Walidacja daty wizyty
            if (!oVisitDateInput.getDateValue()) {
                oVisitDateInput.setValueState(sap.ui.core.ValueState.Error);
                oVisitDateInput.setValueStateText("Data wizyty jest wymagana");
                bValid = false;
            } else {
                // Sprawdź czy data nie jest z przeszłości
                var oToday = new Date();
                oToday.setHours(0, 0, 0, 0); // Ustaw na początek dnia
                
                if (oVisitDateInput.getDateValue() < oToday) {
                    oVisitDateInput.setValueState(sap.ui.core.ValueState.Error);
                    oVisitDateInput.setValueStateText("Data wizyty nie może być z przeszłości");
                    bValid = false;
                } else {
                    oVisitDateInput.setValueState(sap.ui.core.ValueState.Success);
                    // Aktualizacja modelu
                    oModel.setProperty("/visitData/visitDate", oVisitDateInput.getDateValue());
                }
            }
            
            // Walidacja godziny wizyty
            if (!oVisitHourSelect.getSelectedKey()) {
                oVisitHourSelect.setValueState(sap.ui.core.ValueState.Error);
                oVisitHourSelect.setValueStateText("Wybierz godzinę wizyty");
                bValid = false;
            } else {
                oVisitHourSelect.setValueState(sap.ui.core.ValueState.Success);
                // Aktualizacja modelu
                oModel.setProperty("/visitData/visitTime", oVisitHourSelect.getSelectedItem().getText());
            }
            
            // Ustaw stan kroku w zależności od wyników walidacji
            if (bValid) {
                oWizard.validateStep(oStep);
            } else {
                oWizard.invalidateStep(oStep);
            }
            
            return bValid;
        },

        _displaySummary: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel("orderData");
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
                visitTime: oData.visitData.visitTime
            };
            
            // Log dla debugowania
            console.log("Dane zamówienia z modelu:", oOrderData);

            // Create summary text
            var sSummary = "Dane osobowe:\n" +
                "Imię: " + oOrderData.firstName + "\n" +
                "Nazwisko: " + oOrderData.lastName + "\n" +
                "Telefon: " + oOrderData.phoneNumber + "\n" +
                "Adres: " + oOrderData.addressFirstLine + 
                (oOrderData.addressSecondLine ? " " + oOrderData.addressSecondLine : "") + ", " +
                oOrderData.addressZipCode + " " + oOrderData.addressCity + "\n\n" +
                "Urządzenie:\n" +
                "Typ: " + oOrderData.deviceType + "\n" +
                "Model: " + oOrderData.deviceModel + "\n" +
                "Numer seryjny: " + (oOrderData.deviceSerialNumber || "Nie podano") + "\n" +
                "Opis usterki: " + oOrderData.faultDescription + "\n\n" +
                "Wizyta:\n" +
                "Data: " + oOrderData.visitDate + "\n" +
                "Godzina: " + oOrderData.visitTime;

            // Update summary text
            oView.byId("summaryText").setText(sSummary);
        },

        onSubmitOrder: function () {
            var oModel = this.getView().getModel("orderData");
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

            // Save data using OData V4 model
            this._saveOrderData(oOrderData);
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

        onSummaryStepActivate: function (oEvent) {
            var oStep = oEvent.getSource();

            // Check if the activated step is the summary step
            if (oStep.getId().includes("stepSummary")) {
                this._displaySummary();
            }
        },

        onStepActivate: function (oEvent) {
            var oWizard = this.byId("createOrderWizard");
            var oStep = oEvent.getSource();

            // Sprawdź, który krok jest aktywny i wykonaj odpowiednią walidację
            switch (oStep.getId()) {
                case this.createId("stepPersonalData"):
                    this._validatePersonalData();
                    break;
                case this.createId("stepFaultDesc"):
                    this._validateFaultDesc();
                    break;
                case this.createId("stepVisitDate"):
                    this._validateVisitDate();
                    break;
                default:
                    break;
            }
        },

        _validatePersonalData: function () {
            var oWizard = this.byId("createOrderWizard");
            var bValid = true;

            // Sprawdź wymagane pola
            if (!this.byId("firstNameInput").getValue()) bValid = false;
            if (!this.byId("lastNameInput").getValue()) bValid = false;
            if (!this.byId("phoneNumberInput").getValue()) bValid = false;

            // Oznacz krok jako poprawny lub niepoprawny
            if (bValid) {
                oWizard.validateStep(this.byId("stepPersonalData"));
            } else {
                oWizard.invalidateStep(this.byId("stepPersonalData"));
            }
        },

        _validateFaultDesc: function () {
            var oWizard = this.byId("createOrderWizard");
            var bValid = true;

            // Sprawdź wymagane pola
            if (!this.byId("deviceTypeComboBox").getSelectedKey()) bValid = false;
            if (!this.byId("deviceModelInput").getValue()) bValid = false;

            // Oznacz krok jako poprawny lub niepoprawny
            if (bValid) {
                oWizard.validateStep(this.byId("stepFaultDesc"));
            } else {
                oWizard.invalidateStep(this.byId("stepFaultDesc"));
            }
        },

        _validateVisitDate: function () {
            var oWizard = this.byId("createOrderWizard");
            var bValid = true;

            // Sprawdź wymagane pola
            if (!this.byId("visitDateInput").getDateValue()) bValid = false;
            if (!this.byId("visitHourSelect").getSelectedKey()) bValid = false;

            // Oznacz krok jako poprawny lub niepoprawny
            if (bValid) {
                oWizard.validateStep(this.byId("stepVisitDate"));
            } else {
                oWizard.invalidateStep(this.byId("stepVisitDate"));
            }
        },

        _resetWizard: function () {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            
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
                    visitTime: ""
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
                oWizard.getSteps().forEach(function(oStep) {
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
