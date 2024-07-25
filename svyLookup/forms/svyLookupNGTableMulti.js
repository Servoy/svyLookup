/**
 * Overrides creation hook and adds columns
 * @protected
 * @param {JSForm} jsForm
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @override
 * @properties={typeid:24,uuid:"A2690E86-C7BB-4BB3-89B7-4D4882CF93C5"}
 */
function onCreateInstance(jsForm, lookupObj) {
	var jsDataSourceNode = solutionModel.getDataSourceNode(lookupObj.getDataSource());

	if (!jsDataSourceNode.getCalculation("svy_lookup_selected")) {
		jsDataSourceNode.newCalculation("function svy_lookup_selected() {}", JSColumn.TEXT);
	}
	// NG Grid styleClassDataprovider does not work with null value. Therefore using empty string for unselected values.
	if (!jsDataSourceNode.getCalculation("svy_lookup_selected_ngstyleclass")) {
		jsDataSourceNode.newCalculation("function svy_lookup_selected_ngstyleclass() { return svy_lookup_selected === 'true' ? svy_lookup_selected : ' '}", JSColumn.TEXT);
	}
}

/**
 * Callback method for when form is shown.
 * Focuses first field and adds shortcuts
 * 
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"75139F3B-225D-4D7F-92B8-AC9F80CB3BEF"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) {
	_super.onShow(firstShow, event);
	
	if (firstShow) {
		elements.table.myFoundset.foundset.multiSelect = true;
		var checkColumn = elements.table.getColumn(0);
		checkColumn.styleClassDataprovider = 'svy_lookup_selected_ngstyleclass';
		
		for (var i = 0; i < getLookup().getFieldCount(); i++) {
			var field = getLookup().getField(i);
			if (!field.isVisible()) continue;
			createFieldInstance(field);
		}
	}
	
	if(elements.searchText.visible) {
		elements.searchText.requestFocus(true);
	}
}

/**
 * @param {JSEvent} event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"E4BECB7D-1A26-4B39-9740-B974C11134D2"}
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
 * @properties={typeid:24,uuid:"9FC19609-A628-4DB9-BCF5-D56F602D3DFF"}
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
 * @properties={typeid:24,uuid:"78D8037A-49C1-4FA1-BC16-1773F0570982"}
 * @AllowToRunInFind
 */
function onActionSearch(event) {
	search(searchText);
	if(elements.searchText.visible) {
		elements.searchText.requestFocus();
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
 * @properties={typeid:24,uuid:"9F9E9FD4-A3A9-4FDB-9342-93CAB7CF729F"}
 */
function onHide(event) {
	if (confirmSelection !== false) {
		onSelect();
	}
	return _super.onHide(event);
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
 * @properties={typeid:24,uuid:"077D4A6D-A383-47CF-9542-BCA0C097E3B1"}
 */
function onCellDoubleClick(foundsetindex, columnindex, record, event) {
	var actualRecord = elements.table.myFoundset.foundset.getRecord(foundsetindex);
	selectRecord(actualRecord);
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
 * @properties={typeid:24,uuid:"6F9D9117-156C-411A-8D5F-0E200A378829"}
 */
function onCellClick(foundsetindex, columnindex, record, event) {
	// confirm selection at change. Dismissed only by explicit cancel
	confirmSelection = true;
	
	if (columnindex === 0) {
		var actualRecord = foundset.getRecord(foundsetindex);
		toggleRecordSelection(actualRecord);
	}
}

/**
 * @param {JSEvent} event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"C84C2A19-E359-4DAF-8248-145B5C1D9A1D"}
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
 * @properties={typeid:24,uuid:"4CCAEE03-9FF6-475F-8AD1-C3F0E1DD7A5A"}
 */
function onDeselectAll(event) {
	// confirm selection at change. Dismissed only by explicit cancel
	confirmSelection = true;
	deselectAllRecords();
}


/**
 * @protected 
 * @param {scopes.svyLookup.LookupField} field
 *
 * @return {CustomType<aggrid-groupingtable.column>}
 * @override
 *
 * @properties={typeid:24,uuid:"1F64E2CF-3E86-4DF8-8A0C-28E5166F0635"}
 */
function createFieldInstance(field) {
	var column = elements.table.newColumn(field.getDataProvider());
	column.headerTitle = field.getTitleText();
	column.valuelist = field.getValueListName();
	column.format = field.getFormat();
	column.styleClass = field.getStyleClass();
	column.styleClassDataprovider = field.getStyleClassDataprovider();
	column.width = field.getWidthAsInteger();
	column.minWidth = field.getWidthAsInteger();
	column.showAs = field.getShowAs();
	column.autoResize = field.getAutoResize();
	column.id = (field.getDataProvider()|| field.getStyleClassDataprovider())
	column.headerStyleClass = field.getHeaderStyleClass();
	column.enableResize = field.getFieldResizable();
	column.enableRowGroup = false;
	column.columnDef = {
		suppressMenu: true
	}
	return column;
}
