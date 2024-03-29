/**
 * @param {JSEvent} event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"379EC9E6-AB8B-4393-94DE-77C4CFCBF71D"}
 */
function onSelectAll(event) {
	// confirm selection at change. Dismissed only by explicit cancel
	confirmSelection = true;
	selectAllRecords();
}

/**
 * @param {JSEvent} event
 * @protected
 *
 * @properties={typeid:24,uuid:"457DDE15-213F-4BA3-AFA4-B2EE5417CDE6"}
 */
function onDeselectAll(event) {
	// confirm selection at change. Dismissed only by explicit cancel
	confirmSelection = true;
	deselectAllRecords();
}

/**
 * Overrides creation hook and adds columns
 * @protected
 * @param {JSForm} jsForm
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @override
 * @properties={typeid:24,uuid:"35008230-4442-49C7-B131-7636B1B0086F"}
 */
function onCreateInstance(jsForm, lookupObj) {

	setupDataSource(lookupObj.getDataSource());

	// table component
	var table = jsForm.findWebComponent(elements.table.getName());

	// addd columns
	/** @type {Array<CustomType<servoyextra-table.column>>} */
	var columns = table.getJSONProperty('columns');
	
	var columnSelection = columns[0];
	columnSelection.styleClassDataprovider = "svy_lookup_selected";
	
	for (var i = 0; i < lookupObj.getFieldCount(); i++) {
		var field = lookupObj.getField(i);
		if (!field.isVisible()) continue;
		
		/** @type {CustomType<servoyextra-table.column>} */
		var column = createFieldInstance(field);
		columns.push(column);
	}
	table.setJSONProperty('columns', columns);
}

/**
 * @param {scopes.svyLookup.LookupField} lookupFieldObj
 * @return {CustomType<servoyextra-table.column>}
 * @protected
 * @override 
 *
 * @properties={typeid:24,uuid:"D82A1AFC-E688-4DE3-BD02-CEF0D726574E"}
 */
function createFieldInstance(lookupFieldObj) {
	/** @type {CustomType<servoyextra-table.column>} */
	var column = {};
	column.dataprovider = lookupFieldObj.getDataProvider();
	column.headerText = lookupFieldObj.getTitleText();
	column.valuelist = lookupFieldObj.getValueListName();
	column.format = lookupFieldObj.getFormat();
	column.styleClass = lookupFieldObj.getStyleClass();
	column.styleClassDataprovider = lookupFieldObj.getStyleClassDataprovider();
	column.width = lookupFieldObj.getWidth();
	column.showAs = lookupFieldObj.getShowAs();
	if (column.width != "auto") {
		column.autoResize = false;
	}
	return column;
}

/**
 * Callback method for when form is shown.
 * Focuses first field and adds shortcuts
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 * @override 
 *
 * @properties={typeid:24,uuid:"91F6E73C-C166-4DB1-A5E6-5CCFA98584F1"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) {
	_super.onShow(firstShow, event);
	if (elements.searchText.visible) {
		elements.searchText.requestFocus(true);
	}
}

/**
 * Handles the key listener callback event
 * 
 * @protected 
 * @override 
 * 
 * @param {String} value
 * @param {JSEvent} event
 * @param {Number} keyCode
 * @param {Number} altKey
 * @param {Number} ctrlKey
 * @param {Number} shiftKey
 * @param {Number} capsLock
 *
 * @properties={typeid:24,uuid:"D1AC782C-E0AF-4625-BBBA-2AF96C646B22"}
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
 * @protected
 *
 * @properties={typeid:24,uuid:"18991F70-7B68-4758-8537-4826B373C9EC"}
 * @AllowToRunInFind
 */
function onActionSearch(event) {
	search(searchText);
	if(elements.searchText.visible) {
		elements.searchText.requestFocus();
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
 * @properties={typeid:24,uuid:"59B4ABE9-09E5-4B6E-97E3-61E51657FF31"}
 */
function onCellClick(foundsetindex, columnindex, record, event) {
	// confirm selection at change. Dismissed only by explicit cancel
	confirmSelection = true;
	
	var actualRecord = foundset.getRecord(foundsetindex);
	toggleRecordSelection(actualRecord);
}

/**
 * @param {JSEvent} event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"699F9BA4-D0C3-4C45-8812-96B8796C45A3"}
 */
function onClose(event) {
	dismiss();
}

/**
 * @param {String} dataSourceName
 * @private 
 *
 * @properties={typeid:24,uuid:"EC0D94E7-9628-4A8D-B217-3B3809B53C4E"}
 */
function setupDataSource(dataSourceName) {
	var jsDataSourceNode = solutionModel.getDataSourceNode(dataSourceName);

	if (!jsDataSourceNode.getCalculation("svy_lookup_selected")) {
		jsDataSourceNode.newCalculation("function svy_lookup_selected() {}", JSColumn.TEXT);
	}
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
 * @properties={typeid:24,uuid:"2C64734A-241C-4289-A33A-7C1F19BBB548"}
 */
function onHide(event) {
	// return selected items
	onSelect();
	return _super.onHide(event);
}
