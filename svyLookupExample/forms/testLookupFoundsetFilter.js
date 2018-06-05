/**
 * @type {String}
 * @private
 *
 * @properties={typeid:35,uuid:"A565A597-0091-4BB9-9511-4A553987CFB1"}
 */
var selectedLookupValue = '';

/**
 * @type {String}
 * @private
 *
 * @properties={typeid:35,uuid:"51651793-6C7A-4639-8DE5-88F16D2BA24E"}
 */
var selectedLookupValues = '';

/**
 * @type {String}
 * @private
 *
 * @properties={typeid:35,uuid:"0BB99536-0CA7-4331-9D8D-A26E3810C063"}
 */
var selectedLooupValue$valuelist = '';

/**
 * @type {String}
 * @private
 *
 *
 * @properties={typeid:35,uuid:"286C24A4-1104-4CCB-A90D-8733B4BC92F6"}
 */
var selectedLooupValues$valuelist = '';

/**
 * @public
 * @return {String}
 *
 * @properties={typeid:24,uuid:"CC27E93C-CFF2-4BE3-8308-E18C0147FAEC"}
 */
function getDescription() {
	return 'All-purpose look-up UX pattern for servoy applications';
}

/**
 * @public
 * @return {String} Download URL
 *
 * @properties={typeid:24,uuid:"37B0E698-E8AD-4D0C-958E-CAA2C4E3517F"}
 */
function getDownloadURL() {
	return 'https://github.com/Servoy/svyLookup/releases/download/v1.0.0/svyLookupExample.servoy';
}

/**
 * @public
 * @return {String}
 *
 * @properties={typeid:24,uuid:"F176AB16-59DD-4304-87AD-AC0D067B07BC"}
 */
function getIconStyleClass() {
	return 'fa-search';
}

/**
 *
 * @return {String} Additioanl info (wiki markdown supported)
 *
 * @properties={typeid:24,uuid:"BD21E513-F9A4-4996-AEA8-AC93A3EFE61F"}
 */
function getMoreInfo() {
	return plugins.http.getPageData('https://github.com/Servoy/svyLookup/blob/master/README.md')
}

/**
 * @public
 * @return {String}
 *
 * @properties={typeid:24,uuid:"9B2D6139-BE67-4206-A168-8D8509A3B5B8"}
 */
function getName() {
	return 'Lookup Search';
}

/**
 *
 * @return {RuntimeForm<AbstractMicroSample>}
 *
 * @properties={typeid:24,uuid:"89EF3ABD-8869-42D5-B4F6-8514EB31E354"}
 */
function getParent() {
	return forms.dataSamples;
}

/**
 * @public
 * @return {Array<String>} code lines
 *
 * @properties={typeid:24,uuid:"0F4EEB30-BCBA-4DAD-B483-6AB55F0EBD0D"}
 */
function getSampleCode() {
	return printMethodCode(onShowLookup).concat(printMethodCode(onSelectLookup));
}

/**
 *
 * @return {String} Website URL
 *
 * @properties={typeid:24,uuid:"FC381142-8B90-4606-9974-A9BC6D16E34B"}
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
 * @properties={typeid:24,uuid:"39F33EDD-57C5-485E-80DD-05BDAD828D2A"}
 * @AllowToRunInFind
 */
function onShowLookup(event, expand) {

	// create lookup object
	var lookupObj = scopes.svyLookup.createLookup(getProductFoundSet());

	lookupObj.setLookupDataprovider("productname");

	// add fields

	// related data is supported
	lookupObj.addField('products_to_categories.categoryname').setTitleText('Category');
	lookupObj.addField('productname').setTitleText('Product');
	lookupObj.addField('products_to_suppliers.companyname').setTitleText('Supplier');

	// Valuelists and non-searchable fields supported
	lookupObj.addField('discontinued').setTitleText('Available').setSearchable(false).setvalueListName('product_availability');

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
 *  @properties={typeid:24,uuid:"93BD38E2-E4E7-4764-9C7B-8D09815F4027"}
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
 * @properties={typeid:24,uuid:"9665AF9D-C4BE-43E2-9541-B40E3438A726"}
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
 * @properties={typeid:24,uuid:"936D43AE-0336-4E4B-9648-B15574776F14"}
 */
function onShowLookupMultiSelection(event, expand) {
	// create lookup object
	var lookupObj = scopes.svyLookup.createLookup(getProductFoundSet());

	lookupObj.setLookupDataprovider("productname");

	// add fields

	// related data is supported
	lookupObj.addField('products_to_categories.categoryname').setTitleText('Category');
	lookupObj.addField('productname').setTitleText('Product');
	lookupObj.addField('products_to_suppliers.companyname').setTitleText('Supplier');

	// Valuelists and non-searchable fields supported
	lookupObj.addField('discontinued').setTitleText('Available').setSearchable(false).setvalueListName('product_availability');

	// formatted, non-searchable field example
	lookupObj.addField('unitprice').setSearchable(false).setTitleText('Price').setFormat('#,###.00').setWidth('50')

	// change lookup provider
	lookupObj.setLookupFormProvider(forms.svyLookupTableMulti);

	// show pop-up
	var component = elements[event.getElementName()];
	var initialValue = selectedLookupValues ? selectedLookupValues.split(",")[selectedLookupValues.split(",").length - 1] : null;

	if (expand) {
		var values = lookupObj.showModalWindow(null, event.getX(), event.getY(), 400, 400, initialValue);
		selectedLookupValues = values.join(",");
	} else {
		lookupObj.showPopUp(onSelectMulti, component, null, null, initialValue);
	}
}

/**
 * @param {Array<JSRecord<db:/example_data/products>>} records
 * @param {Array<String|Date|Number>} values
 * @param {scopes.svyLookup.Lookup} lookup
 * @private
 *
 * @properties={typeid:24,uuid:"2DB37F8C-C37E-480D-9606-80CEA669E04B"}
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
 * @properties={typeid:24,uuid:"60286927-59C4-4C14-A461-3202140D7B4E"}
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
 * @properties={typeid:24,uuid:"D00AF327-6B4C-4D58-A374-25C1664D4AD6"}
 */
function onShowValuelistLookup(event, expand) {
	// create lookup object
	var lookupObj = scopes.svyLookup.createValuelistLookup("productsTable", "Product");

	// show pop-up
	var component = elements[event.getElementName()];

	if (expand) {
		var values = lookupObj.showModalWindow(null, event.getX(), event.getY(), 400, 400, null);
		selectedLooupValue$valuelist = values[0];
	} else {
		lookupObj.showPopUp(onSelectValuelist, component, null, null, null);
	}
}

/**
 * @private
 * @param {Array<JSRecord<db:/example_data/products>>} records
 * @param {Array<String|Date|Number>} values
 * @param {scopes.svyLookup.Lookup} lookup
 *  @properties={typeid:24,uuid:"D49339BC-3D49-4DB7-8157-40477987C85F"}
 */
function onSelectValuelist(records, values, lookup) {
	selectedLooupValue$valuelist = values[0];
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"96C00078-5D21-42DD-ACD0-9E5E50FA56BA"}
 */
function clearLookupValuelist(event) {
	selectedLooupValue$valuelist = null;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 * @param {Boolean} expand
 * @private
 *
 * @properties={typeid:24,uuid:"1D3E09ED-B170-43F0-8C54-EBF09721B3C8"}
 */
function onShowValuelistLookupMulti(event, expand) {
	// create lookup object
	var lookupObj = scopes.svyLookup.createValuelistLookup("productsTable");
	lookupObj.setLookupFormProvider(forms.svyLookupTableMulti);

	// show pop-up
	var component = elements[event.getElementName()];
	var initialValue = selectedLooupValues$valuelist ? selectedLooupValues$valuelist.split(",")[selectedLooupValues$valuelist.split(",").length - 1] : null;

	if (expand) {
		var values = lookupObj.showModalWindow(null, event.getX(), event.getY(), 400, 400, initialValue);
		selectedLooupValues$valuelist = values ? values.join(",") : null;
	} else {
		lookupObj.showPopUp(onSelectValuelistMulti, component, null, null, initialValue);
	}
}

/**
 * @private
 * @param {Array<JSRecord<db:/example_data/products>>} records
 * @param {Array<String|Date|Number>} values
 * @param {scopes.svyLookup.Lookup} lookup
 *  @properties={typeid:24,uuid:"F5A3C064-18F4-4784-9538-8143FBD1ADAA"}
 */
function onSelectValuelistMulti(records, values, lookup) {
	selectedLooupValues$valuelist = values ? values.join(",") : null;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"61664A4C-3021-493B-A197-7BF32186C573"}
 */
function clearLookupValuelistMulti(event) {
	selectedLooupValues$valuelist = null;
}


/**
 * @protected 
 * @properties={typeid:24,uuid:"F1CC7301-3CC7-4159-B603-33D93610C480"}
 */
function getProductFoundSet() {
	var fs = datasources.db.example_data.products.getFoundSet();
	fs.addFoundSetFilterParam("unitprice",">","30","unitprice");
	fs.sort("unitprice desc", true);
	return fs;
}