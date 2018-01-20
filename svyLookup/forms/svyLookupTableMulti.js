/**
 * @param {JSEvent} event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"379EC9E6-AB8B-4393-94DE-77C4CFCBF71D"}
 */
function onSelectAll(event) {
	selectAllRecords();	
}

/**
 * @param {JSEvent} event
 * @protected
 *
 * @properties={typeid:24,uuid:"457DDE15-213F-4BA3-AFA4-B2EE5417CDE6"}
 */
function onDeselectAll(event) {
	deselectAllRecords();
}

/**
 * Flag if keylistener has been added
 *
 * @protected
 * @type {Boolean}
 * @properties={typeid:35,uuid:"030B4D62-EA69-486D-B065-CF20878966E3",variableType:-4}
 */
var keyListenerReady = false;

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
	/** @type {Array<servoyextra-table.column>} */
	var columns = table.getJSONProperty('columns');
	
	var columnSelection = columns[0];
	columnSelection.styleClassDataprovider = "svy_lookup_selected";
	
	for (var i = 0; i < lookupObj.getFieldCount(); i++) {
		var field = lookupObj.getField(i);
		if (!field.isVisible()) continue;

		/** @type {servoyextra-table.column} */
		var column = { };
		column.dataprovider = field.getDataProvider();
		column.headerText = field.getTitleText();
		column.valuelist = field.getValueListName();
		column.format = field.getFormat();
		column.styleClass = field.getStyleClass();
		column.styleClassDataprovider = field.getStyleClassDataprovider();
		columns.push(column);
	}
	table.setJSONProperty('columns', columns);
}

/**
 * Handle focus gained event of the search element. Adds the listener if not added
 * @protected
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"C4C58A66-748A-4406-8F4A-082C9AF13EB9"}
 * @AllowToRunInFind
 */
function onFocusGainedSearch(event) {
	if (!keyListenerReady) {
		application.output("addKeyListener")
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
 * @protected
 *
 * @properties={typeid:24,uuid:"91F6E73C-C166-4DB1-A5E6-5CCFA98584F1"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) {
	keyListenerReady = false;
	elements.searchText.requestFocus(true);
	plugins.window.createShortcut('ENTER', onEnter, elements.searchText.getName());
	plugins.window.createShortcut('ESC', dismiss, controller.getName());
	
	// TODO set the inital values ?
	if (searchText) {
		// TODO make sure values are selected
	} else {
		// remove the inital values
	}
	
}

/**
 * @private
 * handles the keyboard shortcut ENTER and calls select event
 * @properties={typeid:24,uuid:"790DFE4C-EDCD-4744-8C72-544D4B0BBE29"}
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
 * @properties={typeid:24,uuid:"79382901-AE01-454F-A685-F2ECD7A9723A"}
 */
function onKey(value, keyCode, altKeyCode) {

//	application.output("onKey")
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
 * @properties={typeid:24,uuid:"18991F70-7B68-4758-8537-4826B373C9EC"}
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
 * @properties={typeid:24,uuid:"59B4ABE9-09E5-4B6E-97E3-61E51657FF31"}
 */
function onCellClick(foundsetindex, columnindex, record, event) {
	if (foundset['svy_lookup_selected']) {
		foundset['svy_lookup_selected'] = null;
	} else {
		foundset['svy_lookup_selected'] = "true";
	}	
}

/**
 * @param {JSEvent} event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"699F9BA4-D0C3-4C45-8812-96B8796C45A3"}
 */
function onClose(event) {
	onSelect();
}


/**
 * @properties={typeid:24,uuid:"6EF609DB-150A-4C1E-A0C2-BDBD8AB7A3AB"}
 */
function onSelect() {
	// dismiss popup
	dismiss();
	
	// get records by lookup values
	var lookupDataprovider = lookup.getLookupDataprovider();
	var records = getSvyLookupSelectedRecords();
	var lookupValues = [];
	if (records && lookupDataprovider) {
		for (var i = 0; i < records.length; i++) {
			lookupValues.push(records[i][lookupDataprovider]);
		}
	}
	
	// invoke callback
	if (selectHandler) {
		selectHandler.call(this, records, lookup.getParams(), lookupValues, lookupDataprovider);
	}
	
	// return the value. May be used by a modal dialog
	if (lookupValues && lookupValues.length) {
		return lookupValues;
	} else {
		return records;
	}
	
}

/**
 * @param {String} dataSourceName
 * @private 
 *
 * @properties={typeid:24,uuid:"EC0D94E7-9628-4A8D-B217-3B3809B53C4E"}
 */
function setupDataSource(dataSourceName) {
	// TODO this should not be here
	if (dataSourceName && dataSourceName.indexOf("mem:") != 0 && dataSourceName.indexOf("db:") != 0 ) {
		dataSourceName = "mem:" + dataSourceName;
	}

	var jDS = solutionModel.getDataSourceNode(dataSourceName);

	if (!jDS.getCalculation("svy_lookup_selected")) {
		jDS.newCalculation("function svy_lookup_selected() {}", JSColumn.TEXT);
	}

	// TODO better be a form method since is used only in svyLooup
	if (!jDS.getMethod("getSvyLookupSelectedRecords")) {
		var methodCode = "function getSvyLookupSelectedRecords() {\
				var result = [];\
				for (var index = 1; index <= getSize(); index++) {\
					var record = getRecord(index);\
					if (record.svy_lookup_selected) result.push(record);\
				}\
				return result;\
			}"

		jDS.newMethod(methodCode);
	}
}


/**
 * WARNING: loops over all the foundset can be very expensive
 * @protected 
 * 
 * @return {Array<JSRecord>}
 * @properties={typeid:24,uuid:"FCF69282-8B96-4DFB-9C5D-04F32A246CA1"}
 */
function getSvyLookupSelectedRecords() {
	var fs = foundset.duplicateFoundSet();
	fs.loadAllRecords();
	var result = [];
	for (var index = 1; index <= fs.getSize(); index++) {
		var record = fs.getRecord(index);
		if (record['svy_lookup_selected']) result.push(record);
	}
	return result;
}

/**
 * WARNING: loops over all the foundset, can be very expensive
 * @protected 
 * @properties={typeid:24,uuid:"6BF83414-0287-4156-A45A-480E41FA2AC7"}
 */
function selectAllRecords() {
	var fs = foundset.duplicateFoundSet();
	fs.loadAllRecords();
	var result = [];
	for (var index = 1; index <= fs.getSize(); index++) {
		var record = fs.getRecord(index);
		record.svy_lookup_selected = "true";
	}
	return result;
}

/**
 * WARNING: loop over all the foundset, can be very expensive
 * @protected 
 * @properties={typeid:24,uuid:"C431A15B-170E-468B-89D4-29FA04BA5EC5"}
 */
function deselectAllRecords() {
	var fs = foundset.duplicateFoundSet();
	fs.loadAllRecords();
	var result = [];
	
	for (var index = 1; index <= fs.getSize(); index++) {
		var record = fs.getRecord(index);
		record.svy_lookup_selected = null;
	}
	return result;
}