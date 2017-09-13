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
 * @private 
 * @type {Function}
 * @properties={typeid:35,uuid:"A27AA3DA-D68C-4529-88C0-851F94635F0F",variableType:-4}
 */
var selectHandler = null;

/**
 * Runs the search. Loads records in the foundset.
 * 
 * @protected 
 * @properties={typeid:24,uuid:"8FD91534-39A2-428C-9910-49B19E1FF3E5"}
 */
function search(txt){
	
	// load all records if no input
	if(!txt){
		foundset.loadAllRecords();
	}
	
	// create search object
	var simpleSearch = scopes.svySearch.createSimpleSearch(foundset);
	simpleSearch.setSearchText(txt);
	
	// Add search providers
	for (var i = 0; i < lookup.getFieldCount(); i++) {
		var field = lookup.getField(i);
		if(field.isSearchable()){
			simpleSearch.addSearchProvider(field.getDataProvider())
				.setAlias(field.getTitleText());
		}
	}
	
	// apply search
	simpleSearch.loadRecords(foundset);
}

/**
 * Shows this form as pop-up, returns selection in callback
 * 
 * @public  
 * @param {Function} callback The function that is called when selection happens
 * @param {RuntimeComponent} target The component which will be shown
 * @param {Number} [width] The width of the pop-up. Optional. Default is component width 
 * @param {Number} [height] The height of the pop-up. Optional. Default is form height.
 * @param {String} [initialValue] Initial value in search. Optional. Default is empty.
 * 
 * @properties={typeid:24,uuid:"9952E85A-95AE-454D-8861-5A0AC99B4D89"}
 */
function showPopUp(callback, target, width, height, initialValue){
	selectHandler = callback;
	var w = !width ? target.getWidth() : width;
	if(initialValue){
		searchText = initialValue;
		search(searchText);
		foundset.loadAllRecords();
	}
	plugins.window.showFormPopup(target,this,this,'foobar',w,height);
}

/**
 * Hook for sub form(s) to implement specific sol model additions
 * 
 * @protected 
 * @param {JSForm} jsForm
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @properties={typeid:24,uuid:"56B3D22A-78BB-4AA6-9B1C-78D6FBA40230"}
 */
function onCreateInstance(jsForm, lookupObj){
	// to be overridden
}

/**
 * @public 
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @return {RuntimeForm<AbstractLookup>}
 * @properties={typeid:24,uuid:"8147DBC9-8AE2-47EC-B6B6-A3C10971DCF3"}
 */
function newInstance(lookupObj){
	
	// create JSForm clone
	var formName = application.getUUID().toString();
	var jsForm = solutionModel.cloneForm(formName,solutionModel.getForm(controller.getName()));
	jsForm.dataSource = lookupObj.getDataSource();
	
	// pass control to sub form(s)
	onCreateInstance(jsForm,lookupObj);
	
	/** @type {RuntimeForm<AbstractLookup>} */
	var form = forms[jsForm.name];
	form['lookup'] = lookupObj;
	return form;
}

/**
 * Callback when item is selected
 * @protected 
 * @properties={typeid:24,uuid:"FB1EE4B2-02C6-4B5C-8346-7D1988326895"}
 */
function onSelect(){
	
	// dismiss popup
	dismiss();
	
	// invoke callback
	if(selectHandler){
		selectHandler.call(this,foundset.getSelectedRecord());
	}
}

/**
 * Dismisses the popup
 * 
 * @protected 
 * @properties={typeid:24,uuid:"D119BC9F-1137-445E-9E30-FDB3F4929484"}
 */
function dismiss(){
	plugins.window.closeFormPopup(null);
}
