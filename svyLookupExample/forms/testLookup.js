/**
 * The selected product
 * @private 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"13141FF3-D55E-4FE3-B232-408F3215C32B",variableType:4}
 */
var selectedProductID = null;

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"7BE387D8-06C7-4E13-8E4F-7624666A3D07"}
 * @AllowToRunInFind
 */
function selectProduct(event) {
	
	// create lookup object
	var lookupObj = scopes.svyLookup.createLookup(datasources.db.example_data.products.getDataSource());
	
	// add fields
	lookupObj.addField('products_to_categories.categoryname').setTitleText('Category');
	lookupObj.addField('productname').setTitleText('Product');
	lookupObj.addField('products_to_suppliers.companyname').setTitleText('Supplier');
	lookupObj.addField('discontinued')
		.setTitleText('Available')
		.setSearchable(false)
		.setvalueListName('product_availability');
	lookupObj.addField('unitprice')
		.setSearchable(false)
		.setTitleText('Price')
		.setFormat('#,###.00')
	
	// show pop-up
	var component = elements.productID;
	var initialValue = application.getValueListDisplayValue(elements.productID.getValueListName(),selectedProductID);
	lookupObj.showPopUp(onSelect,component,null,null,initialValue);
}

/**
 * Callback for pop-up, passes the selected record
 * 
 * @private 
 * @param {JSRecord<db:/example_data/products>} record
 *
 * @properties={typeid:24,uuid:"2DA1542B-A67D-46B2-92AD-FAAAF2A4DFA0"}
 */
function onSelect(record){
	if(record){
		selectedProductID = record.productid
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
function clear(event) {
	selectedProductID = null;
}
