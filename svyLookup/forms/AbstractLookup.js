/**
 * User input for text searching
 *
 * @protected
 * @type {String}
 *
 * @properties={typeid:35,uuid:"B0AD3B94-A4F9-4B2B-BC9C-1E37DBB37ED1"}
 */
var searchText = '';

/**
 * The lookup object used by this lokup form
 *
 * @protected
 * @type {scopes.svyLookup.Lookup}
 * @properties={typeid:35,uuid:"9D520951-639E-419E-BDA0-3083A8DC4D09",variableType:-4}
 */
var lookup = null;

/**
 * Handler for the selection callback
 *
 * @protected
 * @type {function(Array<JSRecord>,Array<String|Date|Number>,scopes.svyLookup.Lookup)}
 * @properties={typeid:35,uuid:"A27AA3DA-D68C-4529-88C0-851F94635F0F",variableType:-4}
 */
var selectHandler = null;

/**
 * @type {JSWindow}
 *
 * @properties={typeid:35,uuid:"34E49A93-ECA1-47ED-BBA4-FDE772865863",variableType:-4}
 */
var window;

/**
 * True is the lookup is dismissed without a selection
 * 
 * @private 
 * @properties={typeid:35,uuid:"7BFADF2C-E772-42FB-8E38-2A8FD286C299",variableType:-4}
 */
var isCancelled = false;

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"CFE7E857-BEFB-4EDA-A0B4-8DCD34693093"}
 */
function onShow(firstShow, event) {
	
	// reset is cancelled;
	isCancelled = false;
}

/**
 * Runs the search. Loads records in the foundset.
 *
 * @protected
 * @properties={typeid:24,uuid:"8FD91534-39A2-428C-9910-49B19E1FF3E5"}
 */
function search(txt) {
	
	// fix search disappear while typing
	searchText = txt;

	// load all records if no input
	if (!txt) {
		foundset.loadAllRecords();
	}

	// create search object
	var simpleSearch = scopes.svySearch.createSimpleSearch(foundset);
	simpleSearch.setSearchText(txt);

	// Add search providers
	for (var i = 0; i < lookup.getFieldCount(); i++) {
		var field = lookup.getField(i);
		// TODO check if dataprovider actually exists
		if (field.isSearchable() && field.getDataProvider()) {
			simpleSearch.addSearchProvider(field.getDataProvider()).setAlias(field.getTitleText());
		}
	}

	// apply search
	simpleSearch.loadRecords(foundset);
}

/**
 * Shows this form as pop-up, returns selection in callback
 *
 * @public
 * @param {function(Array<JSRecord>,Array<String|Date|Number>,scopes.svyLookup.Lookup)} callback The function that is called when selection happens
 * @param {RuntimeComponent} target The component which will be shown
 * @param {Number} [width] The width of the pop-up. Optional. Default is component width
 * @param {Number} [height] The height of the pop-up. Optional. Default is form height.
 * @param {String} [initialValue] Initial value in search. Optional. Default is empty.
 *
 * @properties={typeid:24,uuid:"9952E85A-95AE-454D-8861-5A0AC99B4D89"}
 */
function showPopUp(callback, target, width, height, initialValue) {
	selectHandler = callback;
	var w = !width ? target.getWidth() : width;
	if (initialValue) {
		searchText = initialValue;
		search(searchText);
		foundset.loadAllRecords();
	}
	plugins.window.showFormPopup(target, this, this, 'foobar', w, height);
}

/**
 * @private 
 * Creates a form popup for this form and returns it
 * 
 * @param {function(Array<JSRecord>,Array<String|Date|Number>,scopes.svyLookup.Lookup)} callback The function that is called when selection happens
 * @param {String} [initialValue] Initial value in search. Optional. Default is empty.
 * 
 * @return {plugins.window.FormPopup}
 *
 * @properties={typeid:24,uuid:"5C984EAD-5E26-406F-8624-F04ED865A7FF"}
 */
function createPopUp(callback, initialValue) {
	selectHandler = callback;
	return plugins.window.createFormPopup(this); 
}

/**
 * @public
 * @param {function(Array<JSRecord>,Array<String|Date|Number>,scopes.svyLookup.Lookup)} [callback] The function that is called when selection happens. The callback function is optional for lookups in modal dialog
 * @param {Number} [x]
 * @param {Number} [y]
 * @param {Number} [width] The width of the pop-up. Optional. Default is component width
 * @param {Number} [height] The height of the pop-up. Optional. Default is form height.
 * @param {String} [initialValue] Initial value in search. Optional. Default is empty.
 * 
 * @return {Array<JSRecord>|Array<String|Date|Number>} returns the selected records; if the lookupDataprovider has been set instead it returns the lookupDataprovider values on the selected records
 *
 * @properties={typeid:24,uuid:"ED6B2A5C-5453-453D-B9AE-0824E9B495EF"}
 */
function showModalWindow(callback, x, y, width, height, initialValue) {
	selectHandler = callback;
	if (initialValue) {
		searchText = initialValue;
		search(searchText);
		foundset.loadAllRecords();
	}

	window = application.createWindow(controller.getName(), JSWindow.MODAL_DIALOG);

	// TODO allow to setup window as wished; object/function provider
	window.undecorated = true;
	if (width && height) {
		window.setSize(width, height);
	}
	if ( (x == 0 || x > 0) && (y == 0 || y >= 0)) {
		window.setLocation(x, y);
	}

	window.show(controller.getName());
	
	// TODO in svyLookupTable there is not an event to close the dialog preventing a selection
	
	// return the selected values
	var records = getSvyLookupSelectedRecords();
	var lookupValues = getSvyLookupSelectedValues();
	
	// reset is cancelled;
	isCancelled = false;
	
	if (lookupValues) {
		return lookupValues
	} else {
		return records;
	}
}

/**
 * Hook for sub form(s) to implement specific sol model additions
 *
 * @protected
 * @param {JSForm} jsForm
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @properties={typeid:24,uuid:"56B3D22A-78BB-4AA6-9B1C-78D6FBA40230"}
 */
function onCreateInstance(jsForm, lookupObj) {
	// to be overridden
}

/**
 * 
 * @param {scopes.svyLookup.LookupField} lookupFieldObj
 * @protected 
 * @return {Object}
 *
 * @properties={typeid:24,uuid:"3ED4AF93-157E-4A51-B208-304FBC1F6758"}
 */
function onCreateFieldInstance(lookupFieldObj) {
	// to be overridden
	return null;
}

/**
 * @public
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @return {RuntimeForm<AbstractLookup>}
 * @properties={typeid:24,uuid:"8147DBC9-8AE2-47EC-B6B6-A3C10971DCF3"}
 */
function newInstance(lookupObj) {

	// create JSForm clone
	var formName = application.getUUID().toString();
	var jsForm = solutionModel.cloneForm(formName, solutionModel.getForm(controller.getName()));
	jsForm.dataSource = lookupObj.getDataSource();

	// pass control to sub form(s)
	onCreateInstance(jsForm, lookupObj);

	/** @type {RuntimeForm<AbstractLookup>} */
	var form = forms[jsForm.name];
	form['lookup'] = lookupObj;
	form['setupController' + 'Foundset'](); // TODO suppress warning or load controller at the onShow ?

	return form;
}

/**
 * Callback when item is selected
 * @return {Array<JSRecord|String|Date|Number>} returns the selected records; if the lookupDataprovider has been set instead it returns the lookupDataprovider values on the selected records
 * @protected
 * @properties={typeid:24,uuid:"FB1EE4B2-02C6-4B5C-8346-7D1988326895"}
 */
function onSelect() {

	// dismiss popup
	dismiss();

	var records = getSvyLookupSelectedRecords();
	var lookupValues = getSvyLookupSelectedValues();

	// invoke callback
	if (selectHandler) {
		// TODO can we just return the selected values and the lookupObject itself instead of so many arguments ?
		selectHandler.call(this, records, lookupValues, lookup);
	}

	// reset is cancelled;
	isCancelled = false;
	
	// return the value. May be used by a modal dialog
	if (lookupValues) {
		return lookupValues
	} else {
		return records;
	}
}

/**
 * @protected
 *
 * @return {Array<JSRecord>}
 * @properties={typeid:24,uuid:"BE8C41AF-D193-467E-BA8D-8E2BAB5096C6"}
 */
function getSvyLookupSelectedRecords() {
	if (isCancelled === true) {
		return [];
	}
	
	var record = foundset.getSelectedRecord();
	return [record];
}

/**
 * @return {Array<String|Date|Number>}
 * @protected 
 * @properties={typeid:24,uuid:"23E4DF81-EBD7-4B5B-A292-85DA622FD743"}
 */
function getSvyLookupSelectedValues() {
	var lookupValues;
	var lookupDataprovider = lookup.getLookupDataProvider();
	if (lookupDataprovider) {
		var records = getSvyLookupSelectedRecords();
		lookupValues = [];
		if (records && lookupDataprovider) {
			for (var i = 0; i < records.length; i++) {
				lookupValues.push(records[i][lookupDataprovider]);
			}
		}
	} 
	return lookupValues;
}

/**
 * Cancek the selection and dismiss the popup;
 * @protected 
 * @properties={typeid:24,uuid:"EC688038-CEFE-4DEA-9748-5E29EA0A4BF2"}
 */
function cancel() {
	isCancelled = true;
	dismiss();
}

/**
 * Dismisses the popup
 *
 * @protected
 * @properties={typeid:24,uuid:"D119BC9F-1137-445E-9E30-FDB3F4929484"}
 */
function dismiss() {
	if (window) {
		window.hide();
		window = null;
	} else {
		plugins.window.closeFormPopup(null);
	}
}

/**
 * @private 
 * @properties={typeid:24,uuid:"B7F0631F-DA16-4FD9-B722-DAE714D8E714"}
 */
function setupControllerFoundset() {
	var fs = lookup.getFoundSet()
	if (fs) {
		controller.loadRecords(fs);
		
		// FIXME SVY-12494 copy over the foundset filter params because are not copied via controller.loadRecords(fs) on a separate foundset  
		var foundsetFilterParams = fs.getFoundSetFilterParams();
		for (var i = 0; foundsetFilterParams && i < foundsetFilterParams.length; i++) {
			var filterParam = foundsetFilterParams[i]
			foundset.addFoundSetFilterParam(filterParam[1], filterParam[2], filterParam[3], filterParam[4])
		}
	}
}