/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"5A2BE8D9-FD32-4143-A2E4-6674A6FE3B4E"}
 */
var result = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"32BB4D45-1D13-4DD3-8FDD-DA4FB6EE669B"}
 */
var searchText;

/**
 * @properties={typeid:24,uuid:"0CEC6007-D103-4847-9ABD-5710BE8EBC6B"}
 * @AllowToRunInFind
 */
function search() {
	// create an array of lookupS (multi datasources) (initially just add products ds)
	var mlobj = scopes.svyLookup.createMultiDSLookup([datasources.db.example_data.products.getDataSource()]);

	//get the products datasource from list and add some fields to search on.
	var products = mlobj.getLookup(datasources.db.example_data.products.getDataSource());
	products.addField('products_to_categories.categoryname')
	products.addField('productname')
	products.addField('products_to_suppliers.companyname')

	//set a single display field to appear in the popup
	products.setDisplayField('productname');

	//set header text to appear for results in this datasource in the popup
	//if nothing is set else we will use datasource name.
	products.setHeader('Products');

	//add customers datasource to the list
	var customers = mlobj.addLookup(datasources.db.example_data.customers.getDataSource())
	customers.addField('customerid')
	customers.addField('country')
	customers.setDisplayField('companyname');
	customers.setHeader('Customers');

	//add employees datasource to the list
	var employees = mlobj.addLookup(datasources.db.example_data.employees.getDataSource())
	employees.addField('firstname')
	employees.addField('lastname')
	employees.setDisplayField('firstname');
	employees.setHeader('Employees');

	//add suppliers datasource to the list
	var suppliers = mlobj.addLookup(datasources.db.example_data.suppliers.getDataSource())
	suppliers.addField('companyname')
	suppliers.setDisplayField('companyname');
	suppliers.setHeader('Suppliers');

	//add territory datasource to the list
	var territory = mlobj.addLookup(datasources.db.example_data.territories.getDataSource())
	territory.addField('territorydescription')
	territory.setDisplayField('territorydescription');
	territory.setHeader('Territory');

	// show pop-up
	/** @type {RuntimeComponent} */
	var component = elements.search;
	mlobj.showPopUpMultiDS(onSelect, component, null, null, searchText);
	result = '';
}

/**
 * @param {{record:JSRecord,searchtext:String}} data
 * @properties={typeid:24,uuid:"B411BF08-9B9F-4A5C-AFB0-5C17AAC0C159"}
 * @AllowToRunInFind
 */
function onSelect(data) {
	searchText = data.searchtext;
	var cols = databaseManager.getTable(data.record.getDataSource()).getColumnNames()
	result += '<b>'+ data.record.getDataSource() + '<br></b>';
	for (var i = 0; i < cols.length; i++) {
		result += cols[i] + ': ' + data.record[cols[i]] + '<br>';
	}
}
