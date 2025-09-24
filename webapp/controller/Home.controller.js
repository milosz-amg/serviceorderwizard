sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.mr.serviceorderwizard.controller.Home", {
        /**
         * Initializes the Home controller
         * @public
         */
        onInit() {
        },

        /**
         * Handles navigation to the create order view
         * @public
         */
        onNavToCreateOrder: function() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteCreateOrder");
        },

        /**
         * Handles navigation to the orders list view
         * @public
         */
        onNavToOrders: function() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteOrders");
        }
    });
});