/**
 * Callback method for when form is shown.
 * 
 * Focuses first field and adds shortcuts
 * 
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 * 
 * @override 
 *
 * @AllowToRunInFind
 *
 * @properties={typeid:24,uuid:"EE1C7C3D-79F5-4DD0-A5E8-B620B4D5B032"}
 */
function onShow(firstShow, event) {
	_super.onShow(firstShow, event);

	if (firstShow) {
		if (elements.table.columns) {
			elements.table.removeAllColumns();
		}

		for (var i = 0; i < lookup.getFieldCount(); i++) {
			var field = lookup.getField(i);
			if (!field.isVisible()) continue;
			createFieldInstance(field);
		}
	}

	elements.searchText.requestFocus(true);
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
 * @override 
 *
 * @properties={typeid:24,uuid:"D9952CAE-2591-4E80-9F01-2F652434CFBE"}
 */
function onKey(value, event, keyCode, altKey, ctrlKey, shiftKey, capsLock) {
	// handle down arrow
	if (keyCode == java.awt.event.KeyEvent.VK_DOWN) {
		elements.table.requestFocus(1)
		return;
	}

	_super.onKey(value, event, keyCode, altKey, ctrlKey, shiftKey, capsLock);
}

/**
 * Handles the action event of the search field
 * Runs search, refocuses on search field
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @AllowToRunInFind
 *
 * @properties={typeid:24,uuid:"641363E9-2510-4BE3-A46F-EB88116E40F3"}
 */
function onActionSearch(event) {
	search(searchText);
	elements.searchText.requestFocus();
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
 * @properties={typeid:24,uuid:"B484C148-1C11-4DD4-A3B3-8EF5813BC87D"}
 */
function onCellDoubleClick(foundsetindex, columnindex, record, event) {
	onSelect();
}

/**
 * @param {scopes.svyLookup.LookupField} field
 *
 * @return {CustomType<aggrid-groupingtable.column>}
 * 
 * @protected 
 * 
 * @override
 *
 * @properties={typeid:24,uuid:"19E8A78B-BB80-492F-878C-58F7D4665CF8"}
 */
function createFieldInstance(field) {
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
	return column;
}
