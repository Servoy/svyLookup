/**
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"B0AD3B94-A4F9-4B2B-BC9C-1E37DBB37ED1"}
 */
var searchText = '';

/**
 * @protected  
 * @type {scopes.svyLookup.Lookup}
 * @properties={typeid:35,uuid:"9D520951-639E-419E-BDA0-3083A8DC4D09",variableType:-4}
 */
var lookup = null;

/**
 * @private 
 * @type {Function}
 * @properties={typeid:35,uuid:"A27AA3DA-D68C-4529-88C0-851F94635F0F",variableType:-4}
 */
var selectHandler = null;
/**
 * @protected 
 * @properties={typeid:24,uuid:"8FD91534-39A2-428C-9910-49B19E1FF3E5"}
 */
function search(txt){
	if(!txt){
		foundset.loadAllRecords();
	}
	
	var simpleSearch = scopes.svySearch.createSimpleSearch(foundset);
	simpleSearch.setSearchText(txt);
	
	if(getSearchAllColumns()){
		simpleSearch.setSearchAllColumns();
	}
	
	for (var i = 0; i < lookup.getFieldCount(); i++) {
		var field = lookup.getField(i);
		simpleSearch.addSearchProvider(field.getDataProvider())
			.setAlias(field.getTitleText());
	}
	
	simpleSearch.loadRecords(foundset);
}

/**
 * @public  
 * @param {Function} callback
 * @param {RuntimeComponent} target
 * @param {Number} width
 * @param {Number} height
 * @param {String} initialValue
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
 * @properties={typeid:24,uuid:"AEE90AE3-2799-4ABC-880B-50E3A6DC3B49"}
 */
function showDialog(){
	
}

/**
 * @protected 
 * @return {Boolean}
 * @properties={typeid:24,uuid:"54CE4466-5CE8-4DC0-8772-91BA9C0D8FDA"}
 */
function getSearchAllColumns(){
	return false;
}

/**
 * @protected  
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @return {JSForm}
 * 
 * @properties={typeid:24,uuid:"D24843B0-F3DF-47EE-ACF4-3421F99E9901"}
 */
function getInstance(lookupObj){
	var formName = application.getUUID().toString();
	var form = solutionModel.cloneForm(formName,solutionModel.getForm(controller.getName()));
//	var form = solutionModel.newForm(formName,solutionModel.getForm(controller.getName()));
	form.dataSource = lookupObj.getDataSource();
	return form;
}

/**
 * @public 
 * @param {scopes.svyLookup.Lookup} lookupObj
 * @return {RuntimeForm<AbstractLookup>}
 * @properties={typeid:24,uuid:"8147DBC9-8AE2-47EC-B6B6-A3C10971DCF3"}
 */
function newInstance(lookupObj){
	var jsForm = getInstance(lookupObj);
	/** @type {RuntimeForm<AbstractLookup>} */
	var form = forms[jsForm.name];
	form['lookup'] = lookupObj;
	return form;
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"FB1EE4B2-02C6-4B5C-8346-7D1988326895"}
 */
function onSelect(){
	dismiss();
	if(selectHandler){
		selectHandler.call(this,foundset.getSelectedRecord());
	}
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"D119BC9F-1137-445E-9E30-FDB3F4929484"}
 */
function dismiss(){
	plugins.window.closeFormPopup(null);
}
