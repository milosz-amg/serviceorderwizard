sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/mr/serviceorderwizard/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.mr.serviceorderwizard.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // TODO: ustawić język aplikacji
            // sap.ui.getCore().getConfiguration().setLanguage("pl");

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

            // globalny model dla widoków
            var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMR_ORDER_SRV_SRV/");
            this.setModel(oModel);


        }
    });
});