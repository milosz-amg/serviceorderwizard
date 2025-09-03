sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/mr/serviceorderwizard/model/models",
    "com/mr/serviceorderwizard/model/serviceOrderModel"
], function (Controller, models, serviceOrderModel) {
    "use strict";

    return Controller.extend("com.mr.serviceorderwizard.controller.CreateOrder", {
        onInit: function () {
            // Initialize OData V4 model using the service order model layer
            this._initODataModel();
        },

        _initODataModel: function () {
            // Create OData V4 model for service orders using service order model layer
            var oModel = serviceOrderModel.createServiceOrderModel();
            this.getView().setModel(oModel, "orderModel");
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

        onWizardStepActivate: function (oEvent) {
            var oWizardStep = oEvent.getSource();
            if (oWizardStep.getId().indexOf("stepSummary") !== -1) {
                this._displaySummary();
            }
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
