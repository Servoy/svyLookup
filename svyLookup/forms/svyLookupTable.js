/**
 * @private 
 * @type {Boolean}
 * @properties={typeid:35,uuid:"93EFAD65-2890-4398-9396-BA06E9C6B530",variableType:-4}
 */
var keyListenerReady = false;

/**
 * @protected  
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @return {JSForm}
 * @override 
 * @properties={typeid:24,uuid:"F75AE81F-95F9-4372-A830-6F069A34DEAE"}
 */
function getInstance(lookupObj){
	var form = _super.getInstance(lookupObj);

	var table = form.getWebComponent(elements.table.getName());

	/** @type {Array<servoyextra-table.column>} */
	var columns = table.getJSONProperty('columns');
	for (var i = 0; i < lookupObj.getFieldCount(); i++) {
		var field = lookupObj.getField(i);
		/** @type {servoyextra-table.column} */
		var column = {};
		column.dataprovider = field.getDataProvider();
		column.headerText = field.getTitleText();
		columns.push(column);
	}
	table.setJSONProperty('columns',columns);
	
	return form;
}

/**
 * TODO generated, please specify type and doc for the params
 * @param lookupObj
 * @return {RuntimeForm<svyLookupTable>}
 * @properties={typeid:24,uuid:"D9BA8BCD-8896-42BC-83A5-AF3CE4DFBAA4"}
 */
function newInstance(lookupObj){
	var form = _super.newInstance(lookupObj);
//	/** @type {servoyextra-table.column} */
//	var column = form.elements.table.newColumn('productname');
//	column.headerText = 'Product';
	return form;
}

/**
 * @properties={typeid:24,uuid:"8E277481-B302-47FE-8B4E-0C31CF5FC097"}
 * @AllowToRunInFind
 */
function testNewInstance(){
	var lookupObj = scopes.svyLookup.createLookup(datasources.db.example_data.products.getDataSource());
	lookupObj.addProvider('productname').setTitleText('Product');
	var runtimeForm = newInstance(lookupObj);
	runtimeForm.foundset.loadAllRecords();
	application.output(runtimeForm.controller.getName());
	application.showForm(runtimeForm);
//	runtimeForm.controller.recreateUI();
//	application.updateUI(500);
}
/**
 * Handle focus gained event of the element.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"13A82384-3F37-4342-A489-1A4E7D1F719E"}
 * @AllowToRunInFind
 */
function onFocusGainedSearch(event) {
	if(!keyListenerReady){
		plugins.keyListener.addKeyListener(elements.searchText,onKey);
		keyListenerReady = true;
	}
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"0EB82C64-97A9-4B59-909D-629CA8A9305D"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) {
	keyListenerReady = false;
	elements.searchText.requestFocus(true);
	plugins.window.createShortcut('ENTER',onEnter,controller.getName());
	plugins.window.createShortcut('ESC',dismiss,controller.getName());
}
/**
 * @properties={typeid:24,uuid:"9AEF797A-8906-4A0B-B6AB-CAC5BB93C161"}
 */
function onEnter(){
	onSelect();
}

/**
 * @private 
 * @param {String} value
 * @param {Number} keyCode
 * @param {Number} altKeyCode
 *
 * @properties={typeid:24,uuid:"3FE98DB9-C152-41AF-8B4B-15A7AE6FA121"}
 */
function onKey(value, keyCode, altKeyCode){
	if(keyCode == 40){
		elements.table.requestFocus();
		return;
	}
	search(value);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"DAE25971-6B04-4212-AE61-AC2759604286"}
 * @AllowToRunInFind
 */
function onActionSearch(event) {
	search(searchText);
	elements.searchText.requestFocus();
	if(foundset.getSize() == 1){
		onSelect();
	}
}
/**
 * Called when the mouse is clicked on a row/cell (foundset and column indexes are given) or.
 * when the ENTER key is used then only the selected foundset index is given
 * Use the record to exactly match where the user clicked on
 *
 * @param {Number} foundsetindex
 * @param {Number} [columnindex]
 * @param {JSRecord} [record]
 * @param {JSEvent} [event]
 *
 * @private
 *
 * @properties={typeid:24,uuid:"3A235A62-9AD6-4D7F-9F59-285B549AF54F"}
 */
function onCellClick(foundsetindex, columnindex, record, event) {
	onSelect();
}
