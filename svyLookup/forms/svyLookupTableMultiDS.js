/**
 * Flag if keylistener has been added
 *
 * @private
 * @type {Boolean}
 * @properties={typeid:35,uuid:"A24A87FE-FFB5-46E1-B869-CAB47FEAB6D7",variableType:-4}
 */
var keyListenerReady = false;

/**
 * Overrides creation hook and adds columns
 * @protected
 * @param {JSForm} jsForm
 * @override
 * @properties={typeid:24,uuid:"1DAC279D-64EE-402D-9801-73A998B021B4"}
 */
function onCreateInstance(jsForm) {
	// table component
	var table = jsForm.getWebComponent(elements.table.getName());
	
	// add columns
	/** @type {Array<servoyextra-table.column>} */
	var columns = table.getJSONProperty('columns');

	var fields = [{ dataprovider: 'display' },
		]

	for (var i = 0; i < fields.length; i++) {
		var field = fields[i];
		/** @type {servoyextra-table.column} */
		var column = { };
		column.dataprovider = field.dataprovider;		
		columns.push(column);
	}
	
	table.setJSONProperty('columns', columns);
	table.setJSONProperty('rowStyleClassDataprovider', 'rec_type');	
}

/**
 * Handle focus gained event of the search element. Adds the listener if not added
 * @private
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"3140D5C1-6BB9-4EEC-9B5D-24143D027778"}
 * @AllowToRunInFind
 */
function onFocusGainedSearch(event) {
	if (!keyListenerReady) {
		plugins.keyListener.addKeyListener(elements.searchText, onKey);
		keyListenerReady = true;
	}
}

/**
 * Callback method for when form is shown.
 * Focuses first field and adds shortcuts
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"4D6F3D0D-1B25-43F3-BD4F-BDBB7B26787B"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) {
	keyListenerReady = false;
	elements.searchText.requestFocus(true);
	plugins.window.createShortcut('ESC',dismiss,controller.getName());
}

/**
 * @private
 * handles the keyboard shortcut ENTER and calls select event
 * @properties={typeid:24,uuid:"479174F2-8A95-40E1-938D-1CC40CC0B4CF"}
 */
function onEnter() {
	onSelect();
}

/**
 * Handles the key listener callback event
 *
 * @private
 * @param {String} value
 * @param {Number} keyCode
 * @param {Number} altKeyCode
 *
 * @properties={typeid:24,uuid:"DF0B5C6F-03A1-4251-BABD-8367C0CB2976"}
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
 * @private
 *
 * @properties={typeid:24,uuid:"2187BFEA-18E9-4DE1-8510-BC643D2DF290"}
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
 * @private
 *
 * @param {Number} foundsetindex
 * @param {Number} [columnindex]
 * @param {JSRecord} [record]
 * @param {JSEvent} [event]
 *
 * @properties={typeid:24,uuid:"65D064BB-6D4B-4F60-ACA9-AAFF4F60B197"}
 */
function onCellClick(foundsetindex, columnindex, record, event) {
	onSelect();
}
