/**
 * @type {String}
 * @private
 *
 * @properties={typeid:35,uuid:"935269F2-0554-481F-9958-EB100C69970A"}
 */
var selectedLookupValue;

/**
 * @type {String}
 * @private
 *
 * @properties={typeid:35,uuid:"FB08B0B5-71A1-4D8E-AC5D-B1AFF038A0BB"}
 */
var selectedLookupValues;

/**
 * @type {String}
 * @private
 *
 *
 * @properties={typeid:35,uuid:"A1627088-42F6-4E9B-A4D8-A643980D4B6D"}
 */
var selectedLookupValues$valuelist;

/**
 * @type {scopes.svyLookup.Lookup}
 *
 * @properties={typeid:35,uuid:"0AA55231-F474-4838-B4A5-679C1B4BAF6D",variableType:-4}
 */
var lookupObjMulti;

/**
 * @type {scopes.svyLookup.Lookup}
 *
 * @properties={typeid:35,uuid:"B615A89E-288E-4FF8-81BE-BE0A3411976A",variableType:-4}
 */
var lookupObjMulti$valuelist;

/**
 * @public
 * @return {String}
 *
 * @properties={typeid:24,uuid:"616CF05E-AFA8-4D38-88E6-CE15B3D1822C"}
 */
function getDescription() {
	return 'All-purpose look-up UX pattern for servoy applications';
}

/**
 * @public
 * @return {String} Download URL
 *
 * @properties={typeid:24,uuid:"A162F89B-B37D-4D3E-824E-67A193B09CA4"}
 */
function getDownloadURL() {
	return 'https://github.com/Servoy/svyLookup/releases/download/v1.0.0/svyLookupExample.servoy';
}

/**
 * @public
 * @return {String}
 *
 * @properties={typeid:24,uuid:"04469D49-603F-45F8-8A10-147906BF1B36"}
 */
function getIconStyleClass() {
	return 'fa-search';
}

/**
 *
 * @return {String} Additioanl info (wiki markdown supported)
 *
 * @properties={typeid:24,uuid:"017832D1-060A-4081-9E9A-D45EC53C5214"}
 */
function getMoreInfo() {
	return plugins.http.getPageData('https://github.com/Servoy/svyLookup/blob/master/README.md')
}

/**
 * @public
 * @return {String}
 *
 * @properties={typeid:24,uuid:"C349882A-8F61-49DF-9680-80CF8340EA31"}
 */
function getName() {
	return 'Lookup Search';
}


/**
 *
 *@return {RuntimeForm}
 *
 * @properties={typeid:24,uuid:"4103039A-3293-46F6-8E0B-EABEC03B2E58"}
 */
function getParent() {
	return forms['dataSamples'];
}

/**
 * @public
 * @return {Array<String>} code lines
 *
 * @properties={typeid:24,uuid:"4DD90762-AB83-4898-8578-FB25C06EED9D"}
 */
function getSampleCode() {
	return [''];//printMethodCode(onShowLookup).concat(printMethodCode(onSelectLookup));
}

/**
 *
 * @return {String} Website URL
 *
 * @properties={typeid:24,uuid:"26D7E413-7F9A-4BBE-8F1C-4E93F12127A3"}
 */
function getWebSiteURL() {
	return 'https://github.com/Servoy/svyLookup/wiki';
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 * @param {Boolean} expand
 *
 * @private
 *
 * @properties={typeid:24,uuid:"7BE387D8-06C7-4E13-8E4F-7624666A3D07"}
 * @AllowToRunInFind
 */
function onShowLookup(event, expand) {

	// create lookup object
	var lookupObj = scopes.svyLookup.createLookup(datasources.db.example_data.products.getDataSource());

	lookupObj.setLookupDataProvider("productname");

	// add fields

	// related data is supported
	lookupObj.addField('products_to_categories.categoryname').setTitleText('Category');
	lookupObj.addField('productname').setTitleText('Product');
	lookupObj.addField('products_to_suppliers.companyname').setTitleText('Supplier');

	// Valuelists and non-searchable fields supported
	lookupObj.addField('discontinued').setTitleText('Available').setSearchable(false).setValueListName('product_availability').setShowAs('sanitizedHtml');

	// formatted, non-searchable field example
	lookupObj.addField('unitprice').setSearchable(false).setTitleText('Price').setFormat('#,###.00').setWidth('50');

	// show pop-up
	var component = elements[event.getElementName()];
	// var initialValue = application.getValueListDisplayValue(elements.selectedProductID.getValueListName(),selectedProductID);

	if (expand) {
		var values = lookupObj.showModalWindow(null, event.getX(), event.getY(), 400, 400, selectedLookupValue);
		selectedLookupValue = (values && values.length) ? values[0] : null;
	} else {
		lookupObj.showPopUp(onSelectLookup, component, null, null, selectedLookupValue);
	}
}

/**
 * Callback for pop-up, passes the selected record
 *
 * @private
 * @param {Array<JSRecord<db:/example_data/products>>} records
 * @param {Array<String|Date|Number>} values
 * @param {scopes.svyLookup.Lookup} lookup
 *  @properties={typeid:24,uuid:"2DA1542B-A67D-46B2-92AD-FAAAF2A4DFA0"}
 */
function onSelectLookup(records, values, lookup) {
	if (values && values.length) {
		selectedLookupValue = values[0];
	}
}

/**
 * Clear the selection
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"5FC69327-EBF4-4F22-83EC-59C4F5198E51"}
 */
function clearLookup(event) {
	selectedLookupValue = null;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 * @param {Boolean} expand
 *
 * @private
 *
 * @properties={typeid:24,uuid:"39F2FED4-B8C6-4809-919C-FE97282533CC"}
 */
function onShowLookupMultiSelection(event, expand) {
	if (!lookupObjMulti) {
		// create lookup object
		var lookupObj = scopes.svyLookup.createLookup(datasources.db.example_data.products.getDataSource());
		lookupObj.setLookupDataProvider("productname");
	
		// add fields
	
		// related data is supported
		lookupObj.addField('products_to_categories.categoryname').setTitleText('Category');
		lookupObj.addField('productname').setTitleText('Product');
		lookupObj.addField('products_to_suppliers.companyname').setTitleText('Supplier');
	
		// Valuelists and non-searchable fields supported
		lookupObj.addField('discontinued').setTitleText('Available').setSearchable(false).setValueListName('product_availability').setShowAs('sanitizedHtml');
	
		// formatted, non-searchable field example
		lookupObj.addField('unitprice').setSearchable(false).setTitleText('Price').setFormat('#,###.00').setWidth('50')
	
		// make multiselect
		lookupObj.setMultiSelect(true);
		lookupObj.setLookupForm(forms.svyLookupNGTableMulti)
	
		lookupObjMulti = lookupObj
	}

	
	// show pop-up
	var component = elements[event.getElementName()];
	var initialValue = selectedLookupValues ? selectedLookupValues.split(",")[selectedLookupValues.split(",").length - 1] : null;
	if (expand) {
		var values = lookupObjMulti.showModalWindow(null, event.getX(), event.getY(), 600, 400, initialValue);
		selectedLookupValues = values.join(",");
	} else {
		lookupObjMulti.showPopUp(onSelectMulti, component, null, null, initialValue);
	}
}

/**
 * @param {Array<JSRecord<db:/example_data/products>>} records
 * @param {Array<String|Date|Number>} values
 * @param {scopes.svyLookup.Lookup} lookup
 * @private
 *
 * @properties={typeid:24,uuid:"D41BB50A-A49B-46F2-AEAC-9D5214908236"}
 */
function onSelectMulti(records, values, lookup) {
	if (values) {
		selectedLookupValues = values.join(",");
	} else {
		selectedLookupValues = null;
	}
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"30B3D178-9C86-462E-9265-B770C082F331"}
 */
function clearLookupValues(event) {
	selectedLookupValues = null;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 * @param {Boolean} expand
 * @private
 *
 * @properties={typeid:24,uuid:"3CE950BC-B6DF-4BE1-AFE1-C934683CCCCD"}
 */
function onShowValuelistLookup(event, expand) {
	// create lookup object
	
	if (!lookupObjMulti$valuelist) {
		var lookupObj = scopes.svyLookup.createValueListLookup("productsTable", "Product");
		lookupObjMulti$valuelist = lookupObj;
	}
	// show pop-up
	var component = elements[event.getElementName()];

	if (expand) {
		var values = lookupObjMulti$valuelist.showModalWindow(null, event.getX(), event.getY(), 400, 400, null);
		selectedLookupValues$valuelist = values[0];
	} else {
		lookupObjMulti$valuelist.showPopUp(onSelectValuelist, component, null, null, null);
	}
}

/**
 * @private
 * @param {Array<JSRecord<db:/example_data/products>>} records
 * @param {Array<String|Date|Number>} values
 * @param {scopes.svyLookup.Lookup} lookup
 *  @properties={typeid:24,uuid:"F99C70C5-28F1-4628-ACD0-77068383E6FD"}
 */
function onSelectValuelist(records, values, lookup) {
	selectedLookupValues$valuelist = values[0];
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"D92B0E5A-C1B9-47B7-9526-F1DBC008B614"}
 */
function clearLookupValuelist(event) {
	selectedLookupValues$valuelist = null;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 * @param {Boolean} expand
 * @private
 *
 * @properties={typeid:24,uuid:"E1C42E9C-221C-4736-B161-76BA92DAFDEE"}
 */
function onShowValuelistLookupMulti(event, expand) {
	// create lookup object
	var lookupObj = scopes.svyLookup.createValueListLookup("productsTable", "Products");
	lookupObj.setMultiSelect(true);
	
	// set selected pks
	if (selectedLookupValues$valuelist) 
		lookupObj.setSelectedPks(selectedLookupValues$valuelist.split(","))

	// show pop-up
	var component = elements[event.getElementName()];

	if (expand) {
		var values = lookupObj.showModalWindow(null, event.getX(), event.getY(), 400, 400);
		selectedLookupValues$valuelist = values ? values.join(",") : null;
	} else {
		lookupObj.showPopUp(onSelectValuelistMulti, component, null, null);
	}
}

/**
 * @private
 * @param {Array<JSRecord<db:/example_data/products>>} records
 * @param {Array<String|Date|Number>} values
 * @param {scopes.svyLookup.Lookup} lookup
 *  @properties={typeid:24,uuid:"41E91869-0D41-47E5-9500-4F268EAA3946"}
 */
function onSelectValuelistMulti(records, values, lookup) {
	selectedLookupValues$valuelist = values ? values.join(",") : null;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"86A81DD0-4356-46B8-B2BA-4F966053C6CE"}
 */
function clearLookupValuelistMulti(event) {
	selectedLookupValues$valuelist = null;
}
