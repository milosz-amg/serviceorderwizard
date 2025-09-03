sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("com.mr.serviceorderwizard.controller.CreateOrder", {
        onInit: function () {
            // Initialization logic for CreateOrder wizard
        },

        onSaveOrder: function () {
            var oView = this.getView();
            var firstName = oView.byId("firstNameInput").getValue();
            var lastName = oView.byId("lastNameInput").getValue();

            sap.m.MessageToast.show("kkk");
        }
    });
});
