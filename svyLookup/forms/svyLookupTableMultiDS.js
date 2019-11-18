/**
 * Overrides creation hook and adds columns
 * 
 * @protected
 * 
 * @param {JSForm} jsForm
 * @param {scopes.svyLookup.Lookup} lookupObj
 * 
 * @override
 * @properties={typeid:24,uuid:"1DAC279D-64EE-402D-9801-73A998B021B4"}
 */
function onCreateInstance(jsForm, lookupObj) {
	// table component
	var table = jsForm.getWebComponent(elements.table.getName());
	
	// add columns
	/** @type {Array<CustomType<servoyextra-table.column>>} */
	var columns = table.getJSONProperty('columns');
	
	// TODO, don't you want to use other lookupField properties ?
	var fields = [{ dataprovider: 'display' },
		]

	for (var i = 0; i < fields.length; i++) {
		var field = fields[i];
		/** @type {CustomType<servoyextra-table.column>} */
		var column = { };
		column.dataprovider = field.dataprovider;		
		columns.push(column);
	}
	
	table.setJSONProperty('columns', columns);
	table.setJSONProperty('rowStyleClassDataprovider', 'rec_type');	
}

/**
 * Callback method for when form is shown.
 * Focuses first field and adds shortcuts
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 * 
 * @override 
 *
 * @properties={typeid:24,uuid:"4D6F3D0D-1B25-43F3-BD4F-BDBB7B26787B"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) {
	_super.onShow(firstShow, event);
	elements.searchText.requestFocus(true);
}

/**
 * Handles the key listener callback event
 * 
 * @param {String} value
 * @param {JSEvent} event
 * @param {Number} keyCode
 * @param {Number} altKey
 * @param {Number} ctrlKey
 * @param {Number} shiftKey
 * @param {Number} capsLock
 *
 * @protected 
 * 
 * @override 
 * 
 * @properties={typeid:24,uuid:"6E0203BE-7D8B-47A8-ADB9-FA2070C20180"}
 */
function onKey(value, event, keyCode, altKey, ctrlKey, shiftKey, capsLock) {
	// handle down arrow
	if (keyCode == java.awt.event.KeyEvent.VK_DOWN) {
		elements.table.requestFocus();
		return;
	}

	_super.onKey(value, event, keyCode, altKey, ctrlKey, shiftKey, capsLock);
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