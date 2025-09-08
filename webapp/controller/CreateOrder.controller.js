sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/mr/serviceorderwizard/model/models",
    "com/mr/serviceorderwizard/model/serviceOrderModel"
], function (Controller, models, serviceOrderModel) {
    "use strict";

    return Controller.extend("com.mr.serviceorderwizard.controller.CreateOrder", {
        onInit: function () {
            this._initODataModel();

            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");

            // Po wyrenderowaniu widoku zablokuj pierwszy krok
            this.getView().addEventDelegate({
                onAfterShow: function () {
                    var oStep = oView.byId("stepPersonalData");
                    if (oWizard && oStep) {
                        oWizard.invalidateStep(oStep);
                    }
                }
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

            // 1. Walidacja pustych pól
            if (!this.validateRequiredEmptyStep(oStep)) {
                return; // jeśli coś puste → zakończ
            }

            // 3. Sprawdź poprawność kodu pocztowego (tylko 5 cyfr)
            var oZipCodeInput = oView.byId("addressZipCodeInput");
            var sZipCode = oZipCodeInput.getValue().trim();
            var oZipCodeRegex = /^\d{5}$/; // Regex dla dokładnie 5 cyfr

            if (!oZipCodeRegex.test(sZipCode)) {
                oWizard.invalidateStep(oStep);
                return;
            }

            // 4. Jeśli wszystko jest OK, zatwierdź krok
            oWizard.validateStep(oStep);
            sap.m.MessageToast.show("Dane osobowe zostały pomyślnie zweryfikowane!");
        },

        validateFaultDesc: function () {
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepFaultDesc");

            // 1. Walidacja pustych pól
            if (!this.validateRequiredEmptyStep(oStep)) {
                return; // jeśli coś puste → zakończ
            }

            oWizard.validateStep(oStep);
        },
        validateVisitDate: function(){
            var oView = this.getView();
            var oWizard = oView.byId("createOrderWizard");
            var oStep = oView.byId("stepVisitDate");

            // 1. Walidacja pustych pól
            if (!this.validateRequiredEmptyStep(oStep)) {
                return; // jeśli coś puste → zakończ
            }

            oWizard.validateStep(oStep);
        },

        _displaySummary: function () {
            var oView = this.getView();
            
            // Pobierz ComboBox i Select w poprawny sposób
            var oDeviceTypeComboBox = oView.byId("deviceTypeComboBox");
            var oVisitHourSelect = oView.byId("visitHourSelect");
            
            // Collect all data from wizard
            var oOrderData = {
                firstName: oView.byId("firstNameInput").getValue(),
                lastName: oView.byId("lastNameInput").getValue(),
                phoneNumber: oView.byId("phoneNumberInput").getValue(),
                addressFirstLine: oView.byId("addressFirstLineInput").getValue(),
                addressSecondLine: oView.byId("addressSecondLineInput").getValue() || "",
                addressZipCode: oView.byId("addressZipCodeInput").getValue(),
                addressCity: oView.byId("addressCityInput").getValue(),
                deviceType: oDeviceTypeComboBox.getSelectedItem() ? oDeviceTypeComboBox.getSelectedItem().getText() : "",
                deviceModel: oView.byId("deviceModelInput").getValue(),
                deviceSerialNumber: oView.byId("deviceSerialNumberInput").getValue() || "",
                faultDescription: oView.byId("faultDescInput").getValue(),
                visitDate: oView.byId("visitDateInput").getDateValue() ? 
                    oView.byId("visitDateInput").getDateValue().toLocaleDateString() : "",
                visitTime: oVisitHourSelect.getSelectedItem() ? oVisitHourSelect.getSelectedItem().getText() : ""
            };
            
            // Dodaj log dla debugowania
            console.log("Dane zamówienia:", oOrderData);

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
            var oView = this.getView();
            
            // Pobierz ComboBox i Select w poprawny sposób
            var oDeviceTypeComboBox = oView.byId("deviceTypeComboBox");
            var oVisitHourSelect = oView.byId("visitHourSelect");

            // Collect all data from wizard steps
            var oOrderData = {
                firstName: oView.byId("firstNameInput").getValue(),
                lastName: oView.byId("lastNameInput").getValue(),
                phoneNumber: oView.byId("phoneNumberInput").getValue(),
                addressFirstLine: oView.byId("addressFirstLineInput").getValue(),
                addressSecondLine: oView.byId("addressSecondLineInput").getValue() || "",
                addressZipCode: oView.byId("addressZipCodeInput").getValue(),
                addressCity: oView.byId("addressCityInput").getValue(),
                deviceType: oDeviceTypeComboBox.getSelectedItem() ? oDeviceTypeComboBox.getSelectedItem().getText() : "",
                deviceModel: oView.byId("deviceModelInput").getValue(),
                deviceSerialNumber: oView.byId("deviceSerialNumberInput").getValue() || "",
                faultDescription: oView.byId("faultDescInput").getValue(),
                visitDate: oView.byId("visitDateInput").getDateValue() ? 
                    oView.byId("visitDateInput").getDateValue().toLocaleDateString() : "",
                visitTime: oVisitHourSelect.getSelectedItem() ? oVisitHourSelect.getSelectedItem().getText() : "",
                status: "New"
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
        }
    });
});
