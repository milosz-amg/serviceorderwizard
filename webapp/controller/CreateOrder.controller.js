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

            // Collect all data from wizard
            var oOrderData = {
                firstName: oView.byId("firstNameInput").getValue(),
                lastName: oView.byId("lastNameInput").getValue(),
                phoneNumber: oView.byId("phoneNumberInput").getValue(),
                addressFirstLine: oView.byId("addressFirstLineInput").getValue(),
                addressSecondLine: oView.byId("addressSecondLineInput").getValue(),
                addressZipCode: oView.byId("addressZipCodeInput").getValue(),
                addressCity: oView.byId("addressCityInput").getValue(),
                deviceType: oView.byId("deviceTypeInput").getValue(),
                deviceModel: oView.byId("deviceModelInput").getValue(),
                deviceSerialNumber: oView.byId("deviceSerialNumberInput").getValue(),
                faultDescription: oView.byId("faultDescInput").getValue(),
                visitDate: oView.byId("visitDateInput").getValue(),
                visitTime: oView.byId("visitTimeInput").getValue()
            };

            // Create summary text
            var sSummary = "Dane osobowe:\n" +
                "Imię: " + oOrderData.firstName + "\n" +
                "Nazwisko: " + oOrderData.lastName + "\n" +
                "Telefon: " + oOrderData.phoneNumber + "\n" +
                "Adres: " + oOrderData.addressFirstLine + " " + oOrderData.addressSecondLine + ", " +
                oOrderData.addressZipCode + " " + oOrderData.addressCity + "\n\n" +
                "Urządzenie:\n" +
                "Typ: " + oOrderData.deviceType + "\n" +
                "Model: " + oOrderData.deviceModel + "\n" +
                "Numer seryjny: " + oOrderData.deviceSerialNumber + "\n" +
                "Opis usterki: " + oOrderData.faultDescription + "\n\n" +
                "Wizyta:\n" +
                "Data: " + oOrderData.visitDate + "\n" +
                "Godzina: " + oOrderData.visitTime;

            // Update summary text
            oView.byId("summaryText").setText(sSummary);
        },

        onSubmitOrder: function () {
            var oView = this.getView();

            // Collect all data from wizard steps
            var oOrderData = {
                firstName: oView.byId("firstNameInput").getValue(),
                lastName: oView.byId("lastNameInput").getValue(),
                phoneNumber: oView.byId("phoneNumberInput").getValue(),
                addressFirstLine: oView.byId("addressFirstLineInput").getValue(),
                addressSecondLine: oView.byId("addressSecondLineInput").getValue(),
                addressZipCode: oView.byId("addressZipCodeInput").getValue(),
                addressCity: oView.byId("addressCityInput").getValue(),
                deviceType: oView.byId("deviceTypeInput").getValue(),
                deviceModel: oView.byId("deviceModelInput").getValue(),
                deviceSerialNumber: oView.byId("deviceSerialNumberInput").getValue(),
                faultDescription: oView.byId("faultDescInput").getValue(),
                visitDate: oView.byId("visitDateInput").getValue(),
                visitTime: oView.byId("visitTimeInput").getValue(),
                status: "New"
            };

            // Save data using OData V4 model
            this._saveOrderData(oOrderData);
        },

        _saveOrderData: function (oOrderData) {
            var oModel = this.getView().getModel("orderModel");

            // Use service order model layer to create service order
            serviceOrderModel.createServiceOrder(oOrderData, oModel).then(function (oContext) {
                sap.m.MessageToast.show("Zamówienie zostało pomyślnie złożone!");
                // Optionally navigate back to home or reset wizard
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");
            }.bind(this)).catch(function (oError) {
                sap.m.MessageToast.show("Błąd podczas składania zamówienia: " + oError.message);
            });
        }
    });
});
