/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["com/mr/serviceorderwizard/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
