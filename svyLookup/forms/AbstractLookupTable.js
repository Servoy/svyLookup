/**
 * Flag if keylistener has been added
 *
 * @protected
 * @type {Boolean}
 * @properties={typeid:35,uuid:"01EC2AEB-0C33-46EC-9320-0D1D899F1505",variableType:-4}
 */
var keyListenerReady = false;

/**
 * @return {RuntimeComponent} return the runtime table component used to display the search result set
 * @protected 
 * @properties={typeid:24,uuid:"AD68126C-F946-43C6-B1F7-D1AA471A7A99"}
 */
function getRuntimeTable() {
	throw scopes.svyExceptions.AbstractMethodInvocationException("Abstact method not implemented");
}

/**
 * @return {RuntimeComponent} return the runtime field component used as search box
 * @protected 
 * @properties={typeid:24,uuid:"F3175917-7B33-4465-A716-6F508CE11D28"}
 */
function getRuntimeField() {
	throw scopes.svyExceptions.AbstractMethodInvocationException("Abstact method not implemented");
}

/**
 * Overrides creation hook and adds columns
 * @protected
 * @param {JSForm} jsForm
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @override
 * @properties={typeid:24,uuid:"E84559B6-7487-4D56-8503-E8CF9814669C"}
 */
function onCreateInstance(jsForm, lookupObj) {

	var tableComponent = getRuntimeTable();
	var tableName = tableComponent.getName()
	// table component

	if (tableName) {
		var table = jsForm.getWebComponent(tableName);

		// addd columns
		/** @type {Array<servoyextra-table.column>} */
		var columns = table.getJSONProperty('columns');
		for (var i = 0; i < lookupObj.getFieldCount(); i++) {
			var field = lookupObj.getField(i);
			if (!field.isVisible()) continue;

			/** @type {servoyextra-table.column} */
			var column = onCreateFieldInstance(field)
			columns.push(column);
		}
		table.setJSONProperty('columns', columns);
	} else {
		log.error("Init svyLookup form failed: cannot find table component '" + tableName + "' in form provider " + controller.getName());
	}
}

/**
 * @return {servoyextra-table.column}
 * @param {scopes.svyLookup.LookupField} lookupFieldObj
 * @protected
 * @override
 *
 * @properties={typeid:24,uuid:"23627E63-6078-460E-AFF8-8EC419AF97B1"}
 */
function onCreateFieldInstance(lookupFieldObj) {
	/** @type {servoyextra-table.column} */
	var column = { };
	column.dataprovider = lookupFieldObj.getDataProvider();
	column.headerText = lookupFieldObj.getTitleText();
	column.valuelist = lookupFieldObj.getValueListName();
	column.format = lookupFieldObj.getFormat();
	column.styleClass = lookupFieldObj.getStyleClass();
	column.styleClassDataprovider = lookupFieldObj.getStyleClassDataprovider();
	column.width = lookupFieldObj.getWidth();
	return column;
}

/**
 * Handle focus gained event of the search element. Adds the listener if not added
 * @protected
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"A3ABCCCF-498A-4EBC-8955-51D45346CFF2"}
 * @AllowToRunInFind
 */
function onFocusGainedSearch(event) {
	var searchTextComponent = getRuntimeField();
	if (searchTextComponent && !keyListenerReady) {
		plugins.keyListener.addKeyListener(searchTextComponent, onKey);
		keyListenerReady = true;
	}
}

/**
 * Callback method for when form is shown.
 * Focuses first field and adds shortcuts
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"7DB3D7CB-83EC-482D-9F68-0952DACD4DB0"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) {
	keyListenerReady = false;
	var searchTextComponent = getRuntimeField();
	if (searchTextComponent) {
		searchTextComponent.requestFocus(true);
	}
	plugins.window.createShortcut('ENTER', onEnter, controller.getName());
	plugins.window.createShortcut('ESC', cancel, controller.getName());
}

/**
 * @private
 * handles the keyboard shortcut ENTER and calls select event
 * @properties={typeid:24,uuid:"331ED494-E2B3-4DE6-9ABC-3E33E13A2C1D"}
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
 * @properties={typeid:24,uuid:"EB26B45A-CF91-422E-A9F8-6BB4CC4C0F14"}
 */
function onKey(value, keyCode, altKeyCode) {

	// handle down arrow
	if (keyCode == java.awt.event.KeyEvent.VK_DOWN) {
		var tableComponent = getRuntimeTable();
		if (tableComponent) {
			tableComponent.requestFocus();
		}
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
 * @properties={typeid:24,uuid:"CA8D0999-2963-40AA-9AAA-79414E2410F9"}
 * @AllowToRunInFind
 */
function onActionSearch(event) {
	search(searchText);
	var searchTextComponent = getRuntimeField();
	if (searchTextComponent) {
		searchTextComponent.requestFocus();
	}
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
 * @properties={typeid:24,uuid:"568EAFF1-66B6-477F-9411-ECF94329856A"}
 */
function onCellClick(foundsetindex, columnindex, record, event) {
	onSelect();
}
