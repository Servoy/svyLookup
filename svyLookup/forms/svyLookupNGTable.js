/**
 * Flag if keylistener has been added
 *
 * @protected
 * @type {Boolean}
 * @properties={typeid:35,uuid:"A08FACCE-3541-417A-87A1-9CBEFEDE3C17",variableType:-4}
 */
var keyListenerReady = false;

/**
 * Overrides creation hook and adds columns
 * @protected
 * @param {JSForm} jsForm
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @override
 * @properties={typeid:24,uuid:"D3E09F60-9795-4887-ADA3-048AC0E96584"}
 */
function onCreateInstance(jsForm, lookupObj) {
	
}

/**
 * Handle focus gained event of the search element. Adds the listener if not added
 * @protected
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"82F2767D-02BC-44F6-881D-478D95FFFB27"}
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
 * @properties={typeid:24,uuid:"27ACDC79-66C6-4E3B-856B-A66195C572B7"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) {
	if (firstShow) {
		if (elements.table.columns) {
			elements.table.removeAllColumns();
		}		

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
 * @properties={typeid:24,uuid:"ABB70676-E140-40A5-9738-6029BEC55097"}
 */
function onEnter() {
	onSelect();
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
 * @properties={typeid:24,uuid:"F934927E-8A4F-40D2-B0DC-4A56A8C85DEE"}
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
 * @properties={typeid:24,uuid:"264A65AC-9A97-4C5F-A24C-C664A59BED15"}
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
 * @properties={typeid:24,uuid:"17C40F4E-2CDF-4A55-B79B-1DCEEFC8F54F"}
 */
function onHide(event) {
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
 * @properties={typeid:24,uuid:"C3F56684-5F49-4DB3-8D39-71833F2BDDB5"}
 */
function onCellDoubleClick(foundsetindex, columnindex, record, event) {
	onSelect();
}
