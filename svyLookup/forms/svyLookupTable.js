/**
 * Overrides creation hook and adds columns
 * @protected
 * @param {JSForm} jsForm
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @override
 * @properties={typeid:24,uuid:"F75AE81F-95F9-4372-A830-6F069A34DEAE"}
 */
function onCreateInstance(jsForm, lookupObj) {

	// table component
	var table = jsForm.getWebComponent(elements.table.getName());

	// addd columns
	/** @type {Array<servoyextra-table.column>} */
	var columns = table.getJSONProperty('columns');
	for (var i = 0; i < lookupObj.getFieldCount(); i++) {
		var field = lookupObj.getField(i);
		if (!field.isVisible()) continue;

		/** @type {servoyextra-table.column} */
		var column = { };
		column.dataprovider = field.getDataProvider();
		column.headerText = field.getTitleText();
		column.valuelist = field.getValueListName();
		column.format = field.getFormat();
		columns.push(column);
	}
	table.setJSONProperty('columns', columns);
}

/**
 * Handle focus gained event of the search element. Adds the listener if not added
 * @protected
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"13A82384-3F37-4342-A489-1A4E7D1F719E"}
 * @AllowToRunInFind
 */
function onFocusGainedSearch(event) { }

/**
 * Callback method for when form is shown.
 * Focuses first field and adds shortcuts
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"0EB82C64-97A9-4B59-909D-629CA8A9305D"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) {
	elements.searchText.requestFocus(true);
	plugins.window.createShortcut('ENTER', onEnter, controller.getName());
	plugins.window.createShortcut('ESC', dismiss, controller.getName());

}

/**
 * @private
 * handles the keyboard shortcut ENTER and calls select event
 * @properties={typeid:24,uuid:"9AEF797A-8906-4A0B-B6AB-CAC5BB93C161"}
 */
function onEnter() {
	onSelect();
}

/**
 * Handles the key listener callback event
 *
 * @protected
 * @param {String} value
 * @param {Number} keyCode
 * @param {Number} altKeyCode
 *
 * @properties={typeid:24,uuid:"3FE98DB9-C152-41AF-8B4B-15A7AE6FA121"}
 */
function onKey(value, keyCode, altKeyCode) {
	// handle down arrow
	if (keyCode == java.awt.event.KeyEvent.VK_DOWN) {
		elements.table.requestFocus();
		return;
	}

	// run search
	search(value);
}

/**
 * Handles the action event of the search field
 * Runs search, refocuses on search field
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"DAE25971-6B04-4212-AE61-AC2759604286"}
 * @AllowToRunInFind
 */
function onActionSearch(event) {
	search(searchText);
	elements.searchText.requestFocus();
}

/**
 * Called when the mouse is clicked on a row/cell (foundset and column indexes are given) or.
 * when the ENTER key is used then only the selected foundset index is given
 * Use the record to exactly match where the user clicked on
 *
 * @protected
 *
 * @param {Number} foundsetindex
 * @param {Number} [columnindex]
 * @param {JSRecord} [record]
 * @param {JSEvent} [event]
 *
 * @properties={typeid:24,uuid:"3A235A62-9AD6-4D7F-9F59-285B549AF54F"}
 */
function onCellClick(foundsetindex, columnindex, record, event) {
	onSelect();
}

/**
 * Callback method when form is (re)loaded.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"B89A05EB-44BB-4BE1-9C2C-2A64B08C2CE1"}
 */
function onLoad(event) {
	plugins.keyListener.addKeyListener('keylistener', onKey, true);	
}

/**
 * Handle hide window.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"A9C99572-C7CB-42B6-AD93-4B653B7D7E9A"}
 */
function onHide(event) {
	return true
}
