/**
 * Flag if keylistener has been added
 *
 * @protected
 * @type {Boolean}
 * @properties={typeid:35,uuid:"72249731-3541-4842-B0FF-918E87583956",variableType:-4}
 */
var keyListenerReady = false;

/**
 * @type {Array<JSRecord>}
 * @private 
 *
 * @properties={typeid:35,uuid:"49115B9D-29DA-4617-AA44-57A6DEB151A4",variableType:-4}
 */
var checkedRecords = [];

/**
 * Overrides creation hook and adds columns
 * @protected
 * @param {JSForm} jsForm
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @override
 * @properties={typeid:24,uuid:"C938A9BA-6C99-4BA2-A537-3D671867DB9C"}
 */
function onCreateInstance(jsForm, lookupObj) {
	var jsDataSourceNode = solutionModel.getDataSourceNode(lookupObj.getDataSource());

	if (!jsDataSourceNode.getCalculation("svy_lookup_selected")) {
		jsDataSourceNode.newCalculation("function svy_lookup_selected() { return 'icon-selection' }", JSColumn.TEXT);
	}
}

/**
 * Handle focus gained event of the search element. Adds the listener if not added
 * @protected
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"3734A7DD-A586-4AED-A644-CA3FBF0FBF18"}
 * @AllowToRunInFind
 */
function onFocusGainedSearch(event) {
	if (!keyListenerReady) {
		plugins.keyListener.addKeyListener("data-svylookup-search", onKey, true);
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
 * @properties={typeid:24,uuid:"703F7901-3070-4EE4-9EF5-B93C946FDC6B"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) {
	if (firstShow) {
		var checkColumn = elements.table.getColumn(0);
		checkColumn.styleClassDataprovider = 'svy_lookup_selected';
		
		for (var i = 0; i < lookup.getFieldCount(); i++) {
			var field = lookup.getField(i);
			if (!field.isVisible()) continue;

			var column = elements.table.newColumn(field.getDataProvider());
			column.headerTitle = field.getTitleText();
			column.valuelist = field.getValueListName();
			column.format = field.getFormat();
			column.styleClass = field.getStyleClass();
			column.styleClassDataprovider = field.getStyleClassDataprovider();
			column.width = field.getWidthAsInteger();
			column.minWidth = field.getWidthAsInteger()
			column.columnDef = {
				suppressMenu: true
			}
		}
	}
	
	keyListenerReady = false;
	elements.searchText.requestFocus(true);
	plugins.window.createShortcut('ENTER', onEnter, controller.getName());
	plugins.window.createShortcut('ESC', cancel, controller.getName());
}

/**
 * @private
 * handles the keyboard shortcut ENTER and calls select event
 * @properties={typeid:24,uuid:"720A6AF2-5042-4768-B6AD-983242E834ED"}
 */
function onEnter() {
	onSelect();
}

/**
 * @param {JSEvent} event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"913FA200-38ED-48CA-B7F0-47CAFE05AA34"}
 */
function onClose(event) {
	dismiss();
}

/**
 * Handles the key listener callback event
 *
 * @protected
 * @param {String} value
 * @param {JSEvent} event
 * @param {Number} keyCode
 * @param {Number} altKey
 * @param {Number} ctrlKey
 * @param {Number} shiftKey
 * @param {Number} capsLock
 *
 * @properties={typeid:24,uuid:"82DF142B-2D25-4B7B-94A7-5B22A2EAA34B"}
 */
function onKey(value, event, keyCode, altKey, ctrlKey, shiftKey, capsLock) {
	// handle down arrow
	if (keyCode == java.awt.event.KeyEvent.VK_DOWN) {
		elements.table.requestFocus(1)
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
 * @properties={typeid:24,uuid:"69A2457A-6B5C-41E5-AA57-56D1A7B32222"}
 * @AllowToRunInFind
 */
function onActionSearch(event) {
	search(searchText);
	elements.searchText.requestFocus();
}

/**
 * Handle hide window.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"95C33A3B-B820-4E68-A6EA-640FBD4BC7E0"}
 */
function onHide(event) {
	onSelect();
	plugins.keyListener.removeKeyListener("data-svylookup-search");
	return true
}

/**
 * Called when the mouse is clicked on a row/cell (foundset and column indexes are given).
 * the foundsetindex is always -1 when there are grouped rows
 * the record is not an actual JSRecord but an object having the dataprovider values of the clicked record
 *
 * @param {Number} foundsetindex
 * @param {Number} [columnindex]
 * @param {object} [record]
 * @param {JSEvent} [event]
 *
 * @private
 *
 * @properties={typeid:24,uuid:"8FB3198A-9AB8-462D-90AD-DCB39AC52181"}
 */
function onCellDoubleClick(foundsetindex, columnindex, record, event) {
	onSelect();
}

/**
 * Called when the mouse is clicked on a row/cell (foundset and column indexes are given).
 * the foundsetindex is always -1 when there are grouped rows
 * the record is not an actual JSRecord but an object having the dataprovider values of the clicked record
 *
 * @param {Number} foundsetindex
 * @param {Number} [columnindex]
 * @param {object} [record]
 * @param {JSEvent} [event]
 *
 * @private
 *
 * @properties={typeid:24,uuid:"3D5BFDAD-BD9B-4B10-BB43-61814B49C2F9"}
 */
function onCellClick(foundsetindex, columnindex, record, event) {
	// confirm selection at change. Dismissed only by explicit cancel
	confirmSelection = true;
	
	if (columnindex === 0) {
		var actualRecord = foundset.getRecord(foundsetindex);
		if (actualRecord['svy_lookup_selected'] === "icon-selection true") {
			actualRecord['svy_lookup_selected'] = 'icon-selection';
			checkedRecords.splice(checkedRecords.indexOf(actualRecord), 1);
		} else {
			actualRecord['svy_lookup_selected'] = 'icon-selection true';
			checkedRecords.push(actualRecord);
		}
	}
}

/**
 * @return {Array<JSRecord>}
 * @override
 * @protected
 *
 * @properties={typeid:24,uuid:"5D510CEF-69DB-40F4-8C7D-CBD71730FAE9"}
 */
function getSvyLookupSelectedRecords() {
	if (checkedRecords && checkedRecords.length > 0) {
		for (var c = 0; c < checkedRecords.length; c++) {
			var checkedRecord = checkedRecords[c];
			checkedRecord['svy_lookup_selected'] = 'icon-selection';
		}
	}
	return checkedRecords;
}

