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
 * The lookup object used by this lookup form
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
 * Set to true when the selection is confirmed. Return a value only when the selection is confirmed.
 * Force an explicit selection to return the selected values
 *
 * @protected
 * @properties={typeid:35,uuid:"BF6DB2F6-6167-457A-8D40-21E808ABB61F",variableType:-4}
 */
var confirmSelection = false;

/**
 * If true will select an empty value
 * @private
 * @properties={typeid:35,uuid:"B2FFC5BF-711D-4C8C-8A5B-C498FCC349D2",variableType:-4}
 */
var confirmSelectEmptyValue = false;

/**
 * Flag if keylistener has been added
 *
 * @protected
 * @type {Boolean}
 * @properties={typeid:35,uuid:"5874BF2B-403A-4175-B91D-79E4C7404F98",variableType:-4}
 */
var keyListenerReady = false;

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
	setupControllerFoundset();

	// reset confirmSelection to init state false
	confirmSelection = false;
	confirmSelectEmptyValue = false;

	keyListenerReady = false;

	if (firstShow) {
		plugins.window.createShortcut('ENTER', onEnterShortcut, controller.getName());
		plugins.window.createShortcut('ESC', cancel, controller.getName());
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
 * @properties={typeid:24,uuid:"B6070ACF-1805-4690-820D-F216DD156B31"}
 */
function onHide(event) {
	if (keyListenerReady && 'keyListener' in plugins) {
		plugins.keyListener.removeKeyListener("data-svylookup-search");
	}
	return true
}

/**
 * When attached to a search field, will add a keylistener to any element having an attribute keylistener='data-svylookup-search'
 *
 * @protected
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"99D05750-C075-497A-8ABA-F7AA2BFF3C23"}
 * @AllowToRunInFind
 */
function onFocusGainedSearch(event) {
	if (!keyListenerReady && 'keyListener' in plugins) {
		plugins.keyListener.addKeyListener("data-svylookup-search", onKey, true);
		keyListenerReady = true;
	}
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
 * @properties={typeid:24,uuid:"5F784C8C-896E-4CD9-9215-53D6A6576FD8"}
 */
function onKey(value, event, keyCode, altKey, ctrlKey, shiftKey, capsLock) {
	// run search
	search(value);
}

/**
 * Update the datasource if necessary. e.g. ValueList has been created from a global valuelist
 * 
 * @private
 * @properties={typeid:24,uuid:"D13232CA-6183-4DD6-B935-A8EDC305AB7F"}
 */
function updateDataSource(txt) {
	//if we are using a global method valuelist:
	//we need to refresh the foundset using global method
	
	/** @type {scopes.svyLookup.Lookup} */
	var lookupObj = getLookup();
	var valueListName = lookupObj.getValueListName()
	if (valueListName) {
		var jsList = solutionModel.getValueList(valueListName);
		if (jsList && jsList.globalMethod) {
			/** @type {Function} */
			var lookupGLMethod = scopes[jsList.globalMethod.getScopeName()][jsList.globalMethod.getName()];
			if (lookupGLMethod) {
				/** @type {JSDataSet} */
				var ds = lookupGLMethod(txt, null, null, valueListName, false);
				if (ds.getColumnName(1) != 'displayvalue') ds.setColumnName(1, 'displayvalue');
				if (ds.getColumnName(2) != 'realvalue') ds.setColumnName(2, 'realvalue');
				ds.createDataSource(foundset.getDataSource().split(':')[1]);
			}
		}
	}
}

/**
 * Runs the search. Loads records in the foundset.
 *
 * @protected
 * @properties={typeid:24,uuid:"8FD91534-39A2-428C-9910-49B19E1FF3E5"}
 */
function search(txt) {
	//if we are using a global method valuelist:
	//we need to refresh the foundset using global method
	updateDataSource(txt);

	// fix search disappear while typing
	// searchText = txt;

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
 * @param {RuntimeComponent|RuntimeWebComponent} target The component which will be shown
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
 * Creates a form popup for this form and returns it
 * @public
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
	if (initialValue) {
		searchText = initialValue;
		search(searchText);
	}
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

	window = createWindow(x, y, width, height);
	window.show(controller.getName());

	// return null if selection is not confirmed
	if (confirmSelection !== true) {
		confirmSelection = false;
		return null;
	}

	// return empty selection
	if (confirmSelectEmptyValue === true) {
		confirmSelectEmptyValue = false;
		return [];
	}

	// return the selected values
	var records = getSvyLookupSelectedRecords();
	var lookupValues = getSvyLookupSelectedValues();

	if (lookupValues) {
		return lookupValues
	} else {
		return records;
	}
}

/**
 * @public
 * @param {JSWindow} win the JSWindow object to show
 * @param {function(Array<JSRecord>,Array<String|Date|Number>,scopes.svyLookup.Lookup)} [callback] The function that is called when selection happens. The callback function is optional for lookups in modal dialog
 * @param {String} [initialValue] Initial value in search. Optional. Default is empty.
 *
 * @return {Array<JSRecord>|Array<String|Date|Number>} returns the selected records; if the lookupDataprovider has been set instead it returns the lookupDataprovider values on the selected records
 *
 * @properties={typeid:24,uuid:"951F2497-B395-4B7E-9055-82ED8876C997"}
 */
function showWindow(win, callback, initialValue) {
	selectHandler = callback;
	if (initialValue) {
		searchText = initialValue;
		search(searchText);
		foundset.loadAllRecords();
	}

	window = win;
	window.show(controller.getName());

	// return null if selection is not confirmed
	if (confirmSelection !== true) {
		confirmSelection = false;
		return null;
	}

	// return empty selection
	if (confirmSelectEmptyValue === true) {
		confirmSelectEmptyValue = false;
		return [];
	}

	// return the selected values
	var records = getSvyLookupSelectedRecords();
	var lookupValues = getSvyLookupSelectedValues();

	if (lookupValues) {
		return lookupValues
	} else {
		return records;
	}
}

/**
 * @public
 * @param {Number} [x]
 * @param {Number} [y]
 * @param {Number} [width] The width of the pop-up. Optional. Default is component width
 * @param {Number} [height] The height of the pop-up. Optional. Default is form height.
 * @param {Number} [jsWindowType] Type of window; should be an option of JSWindow, Default JSWindow.MODAL_DIALOG
 *
 * @return {JSWindow}
 * @properties={typeid:24,uuid:"1A05B913-0859-41AA-8B57-F65FF1E29750"}
 */
function createWindow(x, y, width, height, jsWindowType) {
	if (!jsWindowType) jsWindowType = JSWindow.MODAL_DIALOG;

	var win = application.createWindow(controller.getName(), jsWindowType);

	// TODO allow to setup window as wished; object/function provider
	win.undecorated = true;
	if (width && height) {
		win.setSize(width, height);
	}
	if ( (x == 0 || x > 0) && (y == 0 || y >= 0)) {
		win.setLocation(x, y);
	}

	return win;
}

/**
 * Hook for sub form(s) to implement specific solution model additions
 *
 * @protected
 *
 * @param {JSForm} jsForm
 * @param {scopes.svyLookup.Lookup} lookupObj
 *
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
function createFieldInstance(lookupFieldObj) {
	// to be overridden
	return null;
}

/**
 * Creates a new instance of the lookup form
 *
 * @public
 *
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @return {RuntimeForm<AbstractLookup>}
 *
 * @properties={typeid:24,uuid:"8147DBC9-8AE2-47EC-B6B6-A3C10971DCF3"}
 */
function newInstance(lookupObj) {
	// create JSForm clone
	var formName = controller.getName() + '_' + application.getUUID().toString().replace(/-/g, '_');
	var jsForm = solutionModel.cloneForm(formName, solutionModel.getForm(controller.getName()));
	jsForm.dataSource = lookupObj.getDataSource();

	// pass control to sub form(s)
	onCreateInstance(jsForm, lookupObj);

	/** @type {RuntimeForm<AbstractLookup>} */
	var form = forms[jsForm.name];
	form['lookup'] = lookupObj;

	return form;
}

/**
 * @protected
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"5148147D-152F-4743-AB00-1A576879487C"}
 */
function onEnterShortcut(event) {
	var source = event.getSource();
	if (source.getDataProviderID && source.getDataProviderID() === "searchText") {
		// do nothing when pressing enter in search field. Execute the default onAction of the searchField instead
	} else {
		onSelect();
	}
}

/**
 * Callback when item is selected
 *
 * @return {Array<JSRecord|String|Date|Number>} returns the selected records; if the lookupDataprovider has been set instead it returns the lookupDataprovider values on the selected records
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"FB1EE4B2-02C6-4B5C-8346-7D1988326895"}
 */
function onSelect() {

	// confirmSelection
	confirmSelection = true;

	// dismiss popup
	dismiss();

	if (confirmSelectEmptyValue === true) {
		// invoke callback
		if (selectHandler) {
			selectHandler.call(this, [], [], lookup);
		}
		return [];
	}

	var records = getSvyLookupSelectedRecords();
	var lookupValues = getSvyLookupSelectedValues();

	// invoke callback
	if (selectHandler) {
		// TODO can we just return the selected values and the lookupObject itself instead of so many arguments ?
		selectHandler.call(this, records, lookupValues, lookup);
	}

	// return the value. May be used by a modal dialog
	if (lookupValues) {
		return lookupValues
	} else {
		return records;
	}
}

/**
 * Dismiss the lookup returning an empty selection; returns an empty array [] as result.
 *
 * @return {Array}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"C2172FB4-650C-4643-81F0-7EBEED31A6C5"}
 */
function selectEmptyValue() {
	confirmSelection = true;
	confirmSelectEmptyValue = true;

	dismiss();

	// invoke callback
	if (selectHandler) {
		// TODO can we just return the selected values and the lookupObject itself instead of so many arguments ?
		selectHandler.call(this, [], [], lookup);
	}

	return [];
}

/**
 * Returns the selected record(s)
 *
 * @protected
 *
 * @return {Array<JSRecord>}
 *
 * @properties={typeid:24,uuid:"BE8C41AF-D193-467E-BA8D-8E2BAB5096C6"}
 */
function getSvyLookupSelectedRecords() {
	var record = foundset.getSelectedRecord();
	return [record];
}

/**
 * Returns the lookupDataProvider values for the selected record
 *
 * @return {Array<String|Date|Number>}
 *
 * @protected
 *
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
 * Cancel the selection and dismiss the popup
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"EC688038-CEFE-4DEA-9748-5E29EA0A4BF2"}
 */
function cancel() {
	// discard any selection
	confirmSelection = false;
	dismiss();
}

/**
 * Dismisses the popup
 *
 * @protected
 *
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
 *
 * @properties={typeid:24,uuid:"B7F0631F-DA16-4FD9-B722-DAE714D8E714"}
 */
function setupControllerFoundset() {
	var fs = lookup.getFoundSet();
	if (fs) {
		controller.loadRecords(fs);
		
		// Sort is now handled in the createValueListLookup
//		/** @type {scopes.svyLookup.Lookup} */
//		var lookupObj = getLookup();
//		var valueListName = lookupObj.getValueListName();
//		
//		//check if we have a valuelist and need to sort.
//		if (valueListName) {
//			var jslist = solutionModel.getValueList(valueListName);
//			if (jslist.sortOptions) {
//				foundset.sort(jslist.sortOptions);
//			}
//		}
		
		// FIXME SVY-12494 copy over the foundset filter params because are not copied via controller.loadRecords(fs) on a separate foundset
		var foundsetFilterParams = fs.getFoundSetFilterParams();
		for (var i = 0; foundsetFilterParams && i < foundsetFilterParams.length; i++) {
			var filterParam = foundsetFilterParams[i]
			if (filterParam.length > 2) {
				foundset.addFoundSetFilterParam(filterParam[1], filterParam[2], filterParam[3], filterParam[4])
			} else {
				foundset.addFoundSetFilterParam(filterParam[0], filterParam[1])
			}
		}
	}
}

/**
 * @protected
 * @return {scopes.svyLookup.Lookup}
 * @properties={typeid:24,uuid:"A7F98495-7DC8-47D3-9316-50093596D9E8"}
 */
function getLookup() {
	return lookup;
}
