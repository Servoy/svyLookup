/**
 * @private 
 * @properties={typeid:35,uuid:"A7394F97-5893-4AE6-B599-1B757C587F2A",variableType:-4}
 */
var DEFAULT_FORM_INSTANCES = {
	ABSTRACT: 'AbstractLookup',
	ABSTRACT_MULTI: 'AbstractLookupMulti',
	LOOKUP: 'svyLookupTable',
	MULTI_LOOKUP: 'svyLookupTableMulti'
}

/**
 * Creates a lookup object which can be used to show a pop-up form
 *
 * @public
 * @param {String|JSFoundSet|JSRecord} dataSource The data source to lookup
 * @return {Lookup}
 * @example <pre>
 * function onActionAddProducts(event) {
 *	var lookupObj = scopes.svyLookup.createLookup(datasources.db.example_data.products.getDataSource());
 *
 *  // allow multi-selection
 *	lookupObj.setMultiSelect(true);
 *	
 *	// add searchable fields 
 *	lookupObj.addField('productname').setTitleText('Product');
 *	lookupObj.addField('products_to_suppliers.companyname').setTitleText('Supplier');
 *	lookupObj.addField('unitprice')
 *		.setSearchable(false)
 *		.setTitleText('Price')
 *		.setFormat('#,###.00')
 *	
 *	// show pop-up
 *	lookupObj.showPopUp(onSelect, elements.btnNewProduct, controller.getFormWidth()/2, 412);
 * }
 * 
 * // lookup callback. Add products into current order 
 * function onSelect(records, values, lookup){
 *	if(records){
 *		records.forEach(function(rec){
 *			
 *			if(foundset.selectRecord(foundset.orderid,rec.productid)) {
 *				// increase quantity if product already in order
 *				foundset.quantity = foundset.quantity + 1;
 *			} else {
 *				// create a new order line for each product selected in lookup
 *				var newRec = foundset.getRecord(foundset.newRecord())
 *				newRec.discount = 0;
 *				newRec.quantity = 1;
 *				newRec.unitprice = rec.unitprice;
 *				newRec.productid = rec.productid;
 *			}
 *		})
 *	 }
 * }
 * 
 * </pre>
 * 
 * @properties={typeid:24,uuid:"65E8E051-667D-4118-A873-8024C2648F09"}
 */
function createLookup(dataSource) {
	/** @type {String} */
	var ds = dataSource;
	if (dataSource instanceof JSRecord) {
		ds = dataSource.getDataSource();
	}
	return new Lookup(ds);
}

/**
 * Creates a lookup object from a valuelist which can be used to show a pop-up form or a modal window
 * 
 * NOTE: Valuelist cannot be based on a database relation.
 * Custom Valuelists can show up to **500** items in lookup.
 *
 * @public
 * @param {String} valuelistName
 * @param {String|Array<String>} [titleText] Sets the display text for the valuelist field(s). Default is 'Value' or the column names;
 * TODO should i allow to override the valuelist displayvalue, realvalue dataproviders. Could be handy because the lookup returns the record and the user has no clue about displayvalue/realvalue ?
 * 
 * @return {Lookup}
 * 
 * @example <pre>
 * // create the lookup using the valuelist productsTable
 * var lookupObj = scopes.svyLookup.createValueListLookup("productsTable", "Product");
 * 
 * // show the lookup
 * lookupObj .showPopUp(onSelect, elements.productid);
 * 
 * // handle selection
 * function onSelect(records, values, lookup) {
 * 	 var selectedLookupValues = values.length ? values[0] : null;
 * }
 * </pre>
 *
 * @properties={typeid:24,uuid:"C33D8065-4A81-40CA-852A-07F58C004926"}
 */
function createValueListLookup(valuelistName, titleText) {
	var jsList = solutionModel.getValueList(valuelistName);
	if (!jsList) {
		throw new scopes.svyExceptions.IllegalArgumentException("Cannot use undefined valuelist " + valuelistName);
	}	
	
	if (jsList.valueListType != JSValueList.CUSTOM_VALUES && jsList.valueListType != JSValueList.DATABASE_VALUES && !jsList.globalMethod) {
		throw new scopes.svyExceptions.IllegalArgumentException("The valuelist " + valuelistName + " must be a valuelist of type CUSTOM_VALUES, DATABASE_VALUE, or Global Method Type");
	}
	
	var dataSourceName = "svylookup_valuelist_" + valuelistName;
	var dataSource = "mem:" + dataSourceName;
    var valuelistFoundSet;
	
	if (jsList.valueListType === JSValueList.CUSTOM_VALUES) {
		var items = application.getValueListItems(valuelistName);
		
		// make sure value list entries are sorted as given
		items.addColumn('sort');
		for (var d = 1; d <= items.getMaxRowIndex(); d++) {
			items.setValue(d, 3, d);
		}
		
		// check if valuelist is of old type, default realValue to text
		var realValueType = jsList.realValueType;
		if (realValueType === 0) {
			realValueType = JSColumn.TEXT
		}
		// skip null value if valuelist allow null values
		if (jsList.addEmptyValue == JSValueList.EMPTY_VALUE_ALWAYS && items.getValue(1,1) === "") {
			items.removeRow(1);
		}	
		dataSource = items.createDataSource(dataSourceName, [JSColumn.TEXT, realValueType, JSColumn.INTEGER], ['realvalue']);
		valuelistFoundSet = databaseManager.getFoundSet(dataSource);
		
		// sort the foundset by the order of the original value list
		valuelistFoundSet.sort('sort asc', true);
		valuelistFoundSet.loadAllRecords();
	} else if (jsList.valueListType === JSValueList.DATABASE_VALUES) {
		var jsTable = databaseManager.getTable(jsList.dataSource||scopes.svyDataUtils.getRelationForeignDataSource(jsList.relationName));
		var pkColumns = jsTable.getRowIdentifierColumnNames();
		
	    var displayDataProviders = jsList.getDisplayDataProviderIds();
	    var realDataProviders = jsList.getReturnDataProviderIds();
	    
	    var isPkValueList = scopes.svyJSUtils.areObjectsEqual(pkColumns, realDataProviders);
	    
	    if(jsList.relationName) {
	    	if(!scopes.svyDataUtils.isGlobalRelation(jsList.relationName)) {
	    		application.output('Using related valuelists is not fully supported, only relations based on globals are supported', LOGGINGLEVEL.WARNING);
	    	}
	    }
	    
	    if (!isPkValueList) {
		    var qbSelect = databaseManager.createSelect(jsList.dataSource||scopes.svyDataUtils.getRelationForeignDataSource(jsList.relationName));
		    
		    // create displayValue column
		    if (displayDataProviders.length === 3) {
		    	qbSelect.result.add(
		    		qbSelect.getColumn(displayDataProviders[0])
					.concat(jsList.separator)
					.concat(qbSelect.getColumn(displayDataProviders[1]))
					.concat(jsList.separator)
					.concat(qbSelect.getColumn(displayDataProviders[2])), 'displayvalue');
		    	
		    	qbSelect.groupBy.add(qbSelect.getColumn(displayDataProviders[0]));
		    	qbSelect.groupBy.add(qbSelect.getColumn(displayDataProviders[1]));
		    	qbSelect.groupBy.add(qbSelect.getColumn(displayDataProviders[2]));
		    	
		    	qbSelect.sort.add(qbSelect.getColumn(displayDataProviders[0]).asc);	    	
		    	qbSelect.sort.add(qbSelect.getColumn(displayDataProviders[1]).asc);	    	
		    	qbSelect.sort.add(qbSelect.getColumn(displayDataProviders[2]).asc);	  
		    } else if (displayDataProviders.length === 2) {
		    	qbSelect.result.add(
		    		qbSelect.getColumn(displayDataProviders[0])
					.concat(jsList.separator)
					.concat(qbSelect.getColumn(displayDataProviders[1])), 'displayvalue');
		    	
		    	qbSelect.groupBy.add(qbSelect.getColumn(displayDataProviders[0]));
		    	qbSelect.groupBy.add(qbSelect.getColumn(displayDataProviders[1]));
		    	
		    	qbSelect.sort.add(qbSelect.getColumn(displayDataProviders[0]).asc);	    	
		    	qbSelect.sort.add(qbSelect.getColumn(displayDataProviders[1]).asc);
		    } else if (displayDataProviders.length === 1) {
		    	qbSelect.result.add(qbSelect.getColumn(displayDataProviders[0]), 'displayvalue');
		    	
		    	qbSelect.groupBy.add(qbSelect.getColumn(displayDataProviders[0]));
		    	
		    	qbSelect.sort.add(qbSelect.getColumn(displayDataProviders[0]).asc);
		    }
	
			if (realDataProviders.length === 3) {
		    	qbSelect.result.add(
		    		qbSelect.getColumn(realDataProviders[0])
					.concat(jsList.separator)
					.concat(qbSelect.getColumn(realDataProviders[1]))
					.concat(jsList.separator)
					.concat(qbSelect.getColumn(realDataProviders[2])), 'realvalue');
		    	
		    	qbSelect.groupBy.add(qbSelect.getColumn(realDataProviders[0]));
		    	qbSelect.groupBy.add(qbSelect.getColumn(realDataProviders[1]));
		    	qbSelect.groupBy.add(qbSelect.getColumn(realDataProviders[2]));	    	
		    } else if (realDataProviders.length === 2) {
		    	qbSelect.result.add(
		    		qbSelect.getColumn(realDataProviders[0])
					.concat(jsList.separator)
					.concat(qbSelect.getColumn(realDataProviders[1])), 'realvalue');
		    	
		    	qbSelect.groupBy.add(qbSelect.getColumn(realDataProviders[0]));
		    	qbSelect.groupBy.add(qbSelect.getColumn(realDataProviders[1]));  	
		    } else if (realDataProviders.length === 1) {
		    	qbSelect.result.add(qbSelect.getColumn(realDataProviders[0]), 'realvalue');
		    	
		    	qbSelect.groupBy.add(qbSelect.getColumn(realDataProviders[0]));    	
		    }
			
		    // apply valuelist name as filter on column 'valuelist_name'
		    if (jsList.useTableFilter) {
		    	
		    	if (isPkValueList) {
		    		// TODO handle apply valuelist name as filter on column 'valuelist_name' when the return dataprovider are the PKs
		    		application.output("The created Lookup does not apply the valuelist name as filter on column 'valuelist_name'.", LOGGINGLEVEL.WARNING);
		    	} else {
			    	qbSelect.where.add(qbSelect.getColumn("valuelist_name").eq(jsList.name));
		    	}
		    }
			
		    // create an in-mem DS using global relation conditions
		    if (jsList.relationName && scopes.svyDataUtils.isGlobalRelation(jsList.relationName)) {
		    	
		    	var jsRelation = solutionModel.getRelation(jsList.relationName);
		    	var relationItems = jsRelation.getRelationItems();
		    	
				for (var i = 0; i < relationItems.length; i++) {
					var relationItem = relationItems[i];
					
					/** @type {String} */
					var relPrimaryValue;
					if (relationItem.primaryLiteral != null) {
						relPrimaryValue = relationItem.primaryLiteral
					} else if (relationItem.primaryDataProviderID) {
						relPrimaryValue = eval(relationItem.primaryDataProviderID);
					}

					var op;
					var useNot = false;
					var useCaseInsensitive = false;
					var useIsNull = false;
					switch (relationItem.operator) {
					case "=":
						op = "eq"
						break;
					case ">":
						op = "gt"
						break;
					case ">=":
						op = "ge"
						break;
					case "<":
						op = "lt"
						break;
					case "<=":
						op = "le"
						break;
					case "!=":
						op = "eq"
						useNot = true
						break;
					case "like":
						op = "like"
						break;
					case "not like":
						op = "like"
						useNot = true;
						break;
					case "#=":
						op = "eq"
						useCaseInsensitive = true
						break;
					case "#!=":
						op = "eq"
						useCaseInsensitive = true;
						useNot = true;
						break;
					case "#like":
						op = "like"
						useCaseInsensitive = true;
						break;
					case "#not like":
						op = "like"
						useCaseInsensitive = true;
						useNot = true;
						break;
					case "^||=":
						op = "eq";
						useIsNull = true;
						break;
					case "^||>":
						op = "gt"
						useIsNull = true;
						break;
					case "^||>=":
						op = "ge"
						useIsNull = true;
						break;
					case "^||<":
						op = "lt"
						useIsNull = true;
						break;
					case "^||<=":
						op = "le"
						useIsNull = true;
						break;
					case "^||!=":
						op = "eq"
						useNot = true
						useIsNull = true;
						break;
					case "^||like":
						op = "like"
						useIsNull = true;
						break;
					case "^||not like":
						op = "like"
						useNot = true;
						useIsNull = true;
						break;
					case "^||#=":
						op = "eq";
						useCaseInsensitive = true;
						useIsNull = true;
						break;
					case "^||#!=":
						op = "eq";
						useCaseInsensitive = true;
						useNot = true;
						useIsNull = true;
						break;
					case "^||#like":
						op = "like";
						useCaseInsensitive = true;
						useIsNull = true;
						break;
					case "^||#not like":
						op = "like";
						useCaseInsensitive = true;
						useNot = true;
						useIsNull = true;
						break;

					default:
						application.output("Operator for related valuelist '" + jsList.name + "' unknown: " + relationItem.operator, LOGGINGLEVEL.WARNING);
						continue;
					}

					// get the column 
					var qbColumn = qbSelect.getColumn(relationItem.foreignColumnName);
					var qbColumnQuery = qbColumn;
					
					// like search
					if (op == "like" && relPrimaryValue && relPrimaryValue instanceof String) {
						relPrimaryValue = "%" + relPrimaryValue + "%";
					}
					
					// case insensitive
					if (useCaseInsensitive) {
						qbColumnQuery = qbColumnQuery.lower;
						relPrimaryValue =  (relPrimaryValue && relPrimaryValue instanceof String) ? relPrimaryValue.toLowerCase() : relPrimaryValue;
					}
					
					// apply not operator
					if (useNot) {
						qbColumnQuery = qbColumnQuery.not;
					}
					
					// include null
					if (useIsNull) {
						qbSelect.where.add(qbSelect.or.add(qbColumn.isNull).add(qbColumnQuery[op](relPrimaryValue)))
					} else {
						qbSelect.where.add(qbColumnQuery[op](relPrimaryValue));
					}

				}
		    	
//		    	var relation = qbSelect.joins.add(jsList.relationName, jsList.relationName);
//				relation.joinType = JSRelation.INNER_JOIN;
		    }
		    
		    // realvalue should not be null
		    qbSelect.where.add(qbSelect.getColumn(realDataProviders[0]).not.isNull);
	    }
		
	    var sortString;
	    
	    if (!isPkValueList) {
	    	// create in-memory datasource
	    	databaseManager.createDataSourceByQuery(dataSourceName, qbSelect, -1, null, ['realvalue']);
	    	sortString = 'displayvalue asc';
	    } else {
	    	dataSource = jsList.dataSource||scopes.svyDataUtils.getRelationForeignDataSource(jsList.relationName);
	    	
		    // get the valuelist sort string
		    sortString = jsList.sortOptions ? jsList.sortOptions : null;
	    	
	    	// Set default sort String if not defined yet
	    	if (!sortString) {
	    		sortString = displayDataProviders.join(" asc,");
	    		sortString = sortString ? sortString + ' asc' : null;
	    	}
	    	
	    }

		// use related foundset for related valuelists (only if realValue is pks)
		if (jsList.relationName && isPkValueList && scopes.svyDataUtils.isGlobalRelation(jsList.relationName)) {
			valuelistFoundSet = databaseManager.getFoundSet(dataSource)[jsList.relationName];
		}
	    
	    // get a sorted foundset to be used to create the valuelist
    	if (sortString) {
    		if (!valuelistFoundSet) {
    			valuelistFoundSet = databaseManager.getFoundSet(dataSource);
    		}
    		
    		// sort the foundset
    		valuelistFoundSet.sort(sortString, true);
    		valuelistFoundSet.loadAllRecords();
    	}
	}
	
	/** @type {Lookup} */
	var valuelistLookup;

	// consider to set sort in valuelistObject as API
	if (valuelistFoundSet) {
		// autoconfigure the valuelist lookup from sorted foundset
		valuelistLookup = createLookup(valuelistFoundSet);
	} else {
		valuelistLookup = createLookup(dataSource);
	}
	
	// store the valuelistName in the lookup obj
	valuelistLookup['valueListName'] = valuelistName;
	var field;
	
	// check if the valuelist has a global method
	if (jsList.globalMethod) {
		
		/** @type {Function} */
		var vlGlobalMethod = scopes[jsList.globalMethod.getScopeName()][jsList.globalMethod.getName()];
		/** @type {JSDataSet} */
		var ds = vlGlobalMethod(null, null, null, jsList.name, false);
		if (ds.getColumnName(1) != 'displayvalue') ds.setColumnName(1, 'displayvalue');
		if (ds.getColumnName(2) != 'realvalue') ds.setColumnName(2, 'realvalue');
		dataSource = ds.createDataSource(dataSourceName);
	}

	/** @type {Array<String>} */
	var titleTextArray = titleText instanceof Array ? titleText : [titleText];

	if (!isPkValueList) {	// custom realValue for valuelist
		valuelistLookup.setLookupDataProvider("realvalue");
		field = valuelistLookup.addField("displayvalue");
		if (titleText) {
			field.setTitleText(titleTextArray[0]);
		} else {
			field.setTitleText("Value");
		}
	} else { // valuelist realValue are PKs
		if (pkColumns.length === 1) {
			valuelistLookup.setLookupDataProvider(pkColumns[0]);
		} else {
			//create a calculation that returns the multi column PK as a comma separated list
			var jsDsNode = solutionModel.getDataSourceNode(dataSource);
			if (!jsDsNode.getCalculation('svylookup_dataprovider')) {
				jsDsNode.newCalculation('function svylookup_dataprovider() { return [' + pkColumns.join(', ') + '].join(", "); }', JSVariable.TEXT);
			}
			valuelistLookup.setLookupDataProvider('svylookup_dataprovider');
		}
		//add display fields
		for (var f = 0; f < displayDataProviders.length; f++) {
			field = valuelistLookup.addField(displayDataProviders[f]);
			if (titleTextArray.length === displayDataProviders.length) {
				field.setTitleText(titleTextArray[f]);
			}
		}
	}

	return valuelistLookup;
}

/**
 * Creates a lookup object from a valuelist which can be used to show a pop-up form or a modal window
 * 
 * NOTE: Valuelist cannot be based on a database relation or a global method.
 *
 * @protected 
 * @deprecated use createValueListLookup instead
 * @param {String} valuelistName
 * @param {String|Array<String>} [titleText] Sets the display text for the valuelist field(s). Default is 'Value' or the column names;
 * TODO should i allow to override the valuelist displayvalue, realvalue dataproviders. Could be handy because the lookup returns the record and the user has no clue about displayvalue/realvalue ?
 *
 * @example <pre>
 * // create the lookup using the valuelist productsTable
 * var lookupObj = scopes.svyLookup.createValueListLookup("productsTable", "Product");
 * 
 * // show the lookup
 * lookupObj .showPopUp(onSelect, elements.productid);
 * 
 * // handle selection
 * function onSelect(records, values, lookup) {
 * 	 var selectedLookupValues = values.length ? values[0] : null;
 * }
 * </pre>
 *
 * @return {Lookup}
 *
 * @properties={typeid:24,uuid:"5FE26179-2276-4689-9101-C642C5C1EC68"}
 */
function createValuelistLookup(valuelistName, titleText) {
	return createValueListLookup(valuelistName, titleText);
}

/**
 * Creates a read only, in-memory datasource from the given query and creates a Lookup for that
 * 
 * @param {QBSelect} qbSelect the query
 * @param {String} [dsName] the name of the datasource in case it should be reused
 * @param {Boolean} [overrideData] when true, the datasource with the given name is filled again from the given query, when false, an existing datasource with the same datasource name would be reused; default is false
 * @param {Array<String>} [pkNames] contains all pk
 * 
 * @return {Lookup}
 * 
 * @example <pre>
 *   //distinct query for the value
 *   var qbSelect = datasources.db.example_data.order_details.createSelect();
 *   qbSelect.result.add(qbSelect.joins.order_details_to_products.columns.productname, "productname");
 *   qbSelect.result.add(qbSelect.columns.productid, "productid");
 *   qbSelect.result.distinct = true;
 *   qbSelect.sort.add(qbSelect.joins.order_details_to_products.columns.productname);
 *
 *   //create lookup and set form provider
 *   var lookupObj = scopes.svyLookup.createQueryLookup(qbSelect, 'ordered_products');
 *   
 *   //set proper header title for field
 *   var lookupField = lookupObj .getField(0);
 *   lookupField.setTitleText("Product");
 *   
 *   // show the lookup
 *   lookupObj.showPopUp(onSelect, elements.productid);
 *
 *   // handle selection
 *   function onSelect(records, values, lookup) {
 *	    var selectedLookupValues = records.length ? records[0].productid : null;
 *   }</pre>
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"A3D0175E-FD07-426C-B0EC-B951337075D0"}
 */
function createQueryLookup(qbSelect, dsName, overrideData, pkNames) {
	var dataSource = null;
	if (!dsName) {
		dsName = application.getUUID().toString().replace(/-/g, '_');
	}
	var dataSourceName = "svy_lookup_" + dsName;
	if (!databaseManager.dataSourceExists(dataSourceName) || overrideData === true) {
		if (!pkNames) {
			dataSource = databaseManager.createDataSourceByQuery(dataSourceName, qbSelect, -1);
		}
		else{
			dataSource = databaseManager.createDataSourceByQuery(dataSourceName, qbSelect, -1, null, pkNames);
		}
	}
	
	var columnNames = datasources.mem[dataSourceName].getColumnNames();
	
	var dsLookup = createLookup(dataSource);
	for (var c = 0; c < columnNames.length; c++) {
		if (columnNames[c] === '_sv_rowid') continue;
		dsLookup.addField(columnNames[c]);
	}
	return dsLookup;
}

/**
 * @protected  
 * @param {String|JSFoundSet} datasource
 * @constructor
 * @properties={typeid:24,uuid:"DC5A7A69-5B84-4438-9BFD-06558632E4E8"}
 */
function Lookup(datasource) {

	/**
	 * @protected
	 * @type {Array<LookupField>}
	 */
	this.fields = [];

	/**
	 * @protected
	 * @type {Array} */
	this.params = [];

	/**
	 * @protected
	 * @type {String} */
	this.lookupDataprovider = null;

	/**
	 * @type {String}
	 * @protected 
	 * */
	this.lookupFormProvider = null;
	
	/**
	 * @type {Object}
	 * @protected 
	 */
	this.dataSource = datasource;
	
	/**
	 * @type {Boolean}
	 * @protected 
	 */
	this.multiSelect = false;

	// TODO var sort

	// TODO datasource could be an existing foundset, used to filter lookup data ?

	/**
	 * Sets the lookup form. The lookup form must be an instance of the AbstractLookup form.
	 *
	 * @protected 
	 * @type {String}
	 */
	this.header = null;

	/**
	 * @protected   
	 * @type {String}
	 */
	this.displayField = null;

	/**
	 * @protected 
	 * @type {Array<Array<Object>>}
	 */
	this.selectedPks = [];
	
	/**
	 * @protected
	 * @type {String}
	 */
	this.valueListName = null;
}

/**
 * @constructor 
 * @private 
 * @properties={typeid:24,uuid:"C0E6C5B2-0E41-40B1-955F-6CC1FAD5FF71"}
 */
function init_Lookup() {
	
	/**
	 * what this is used for ?
	 * Set display field to the lookup object
	 *
	 * @protected 
	 * @deprecated 
	 * @param {String} headerText HeaderText on datasource for Multi Lookup Popup
	 * @return {String}
	 * @this {Lookup}
	 */
	Lookup.prototype.setHeader = function(headerText) {
		if (!headerText || headerText.length < 1) {
			var ds = this.getDataSource().split('/')
			this.header = ds[ds.length - 1];
		} else {
			this.header = headerText
		}
		return this.header;
	}
	
	/**
	 * what this is used for ?
	 * get header field
	 *
	 * @protected 
	 * @deprecated 
	 * @return {String}
	 * @this {Lookup}
	 */
	Lookup.prototype.getHeader = function() {
		return this.header;
	}

	/**
	 * What this is used for ?
	 * Set display field to the lookup object
	 *
	 * @deprecated  
	 * @protected  
	 * @param {String} displayField Display dataprovider to be used for Multi Lookup Popup
	 * @return {String}
	 * @this {Lookup}
	 */
	Lookup.prototype.setDisplayField = function(displayField) {
		this.displayField = displayField
		return this.displayField;
	}
	
	/**
	 * 
	 * What this is used for ?
	 * get display field to the lookup object
	 * 
	 * @deprecated
	 * @protected  
	 * @return {String}
	 * @this {Lookup}
	 */
	Lookup.prototype.getDisplayField = function() {
		return this.displayField;
	}	
	
	/**
	 * @protected
	 * @param {RuntimeForm<AbstractLookup>} lookupForm
	 * @deprecated use setLookupForm instead
	 * @this {Lookup}
	 *  */
	Lookup.prototype.setLookupFormProvider = function(lookupForm) {
		if (!lookupForm) {
			throw new scopes.svyExceptions.IllegalArgumentException("Illegal argument formProvider. formProvider must be an instance of AbstractLookup form")
		}
		if (!scopes.svyUI.isJSFormInstanceOf(lookupForm, "AbstractLookup")) {
			throw new scopes.svyExceptions.IllegalArgumentException("The given formProvider must be an instance of AbstractLookup form.");
		}
		this.lookupFormProvider = lookupForm['controller'].getName();
	}
	
	/**
	 * Sets the lookup form used as template for the lookup popup/dialog
	 * The lookup form must extend the abstract form AbstractLookup
	 * 
	 * @public
	 * @param {RuntimeForm<AbstractLookup>} lookupForm
	 * @example <pre>
	 * var lookupObj = scopes.svyLookup.createLookup(datasources.db.example_data.products.getDataSource());
	 * // lookup template with NG Table
	 * lookupObj.setLookupForm(forms.svyLookupNGTable);
	 * 
	 * var lookupObjMulti = scopes.svyLookup.createLookup(datasources.db.example_data.products.getDataSource());
	 * lookupObjMulti.setMultiSelect(true);
	 * // lookup template with NG Table
	 * lookupObjMulti.setLookupForm(forms.svyLookupNGTableMulti);
	 * </pre>
	 * 
	 * @this {Lookup}
	 *  */
	Lookup.prototype.setLookupForm = function(lookupForm) {
		if (!lookupForm) {
			throw new scopes.svyExceptions.IllegalArgumentException("Illegal argument lookupForm. lookupForm must be an instance of AbstractLookup form")
		}
		if (!scopes.svyUI.isJSFormInstanceOf(lookupForm, DEFAULT_FORM_INSTANCES.ABSTRACT)) {
			throw new scopes.svyExceptions.IllegalArgumentException("The given lookupForm must be an instance of " + DEFAULT_FORM_INSTANCES.ABSTRACT + " form.");
		}
		if (this.multiSelect === true && !scopes.svyUI.isJSFormInstanceOf(lookupForm, DEFAULT_FORM_INSTANCES.ABSTRACT_MULTI)) {
			throw new scopes.svyExceptions.IllegalArgumentException("The given lookupForm must be an instance of " + DEFAULT_FORM_INSTANCES.ABSTRACT_MULTI + " form for multi selection.");			
		}
		if (scopes.svyUI.isJSFormInstanceOf(lookupForm, DEFAULT_FORM_INSTANCES.ABSTRACT_MULTI) && this.multiSelect === false) {
			this.multiSelect = true;
		}
		this.lookupFormProvider = lookupForm['controller'].getName();
	}

	/**
	 * Allows this Lookup to multi select records
	 * The lookup form used will be changed when the instance set does not match the multi select setting
	 * @public
	 * @param {Boolean} multiSelect
	 * @return {Lookup}
	 * @this {Lookup}
	 */
	Lookup.prototype.setMultiSelect = function(multiSelect) {
		this.multiSelect = multiSelect;
		var lookupForm = this.getLookupForm();
		if (multiSelect === true && !scopes.svyUI.isJSFormInstanceOf(this.lookupFormProvider, DEFAULT_FORM_INSTANCES.ABSTRACT_MULTI)) {
			//current form is not a multi lookup form
			lookupForm = forms[DEFAULT_FORM_INSTANCES.MULTI_LOOKUP];
			this.setLookupForm(lookupForm);
		} else if (multiSelect !== true && (scopes.svyUI.isJSFormInstanceOf(this.lookupFormProvider, DEFAULT_FORM_INSTANCES.ABSTRACT_MULTI) || !scopes.svyUI.isJSFormInstanceOf(this.lookupFormProvider, DEFAULT_FORM_INSTANCES.ABSTRACT))) {
			//current form is a multi lookup form or not a lookup form at all
			lookupForm = forms[DEFAULT_FORM_INSTANCES.LOOKUP];
			this.setLookupForm(lookupForm);			
		}
		return this;
	}
	
	/**
	 * Gets the data source for this Lookup object
	 * @public
	 * @return {String}
	 * @this {Lookup}
	 */
	Lookup.prototype.getDataSource = function() {
		/** @type {String} */
		var ds;
		if (this.dataSource instanceof JSRecord || this.dataSource instanceof JSFoundSet) {
			ds = this.dataSource.getDataSource();
		} else if (this.dataSource instanceof String) {
			ds = this.dataSource;
		} 
		return ds;
	}
	
	/** 
	 * Gets the foundset for this Lookup object.
	 * @public 
	 * @return {JSFoundSet}
	 * @this {Lookup}
	 * */
	Lookup.prototype.getFoundSet = function() {
		/** @type {JSFoundSet} */
		var fs;
		if (this.dataSource instanceof JSRecord) {
			/** @type {JSRecord} */
			var record = this.dataSource;
			fs = record.foundset;
		} else if (this.dataSource instanceof JSFoundSet) { // return the given foundset
			fs = this.dataSource;
		} else {	// return a separate foundset
			/** @type {String} */
			var ds = this.dataSource;
			fs = databaseManager.getFoundSet(ds);
			fs.loadRecords();
		}
		return fs;
	}
	
	/**
	 * Sets the lookup dataprovider
	 *
	 * @protected 
	 * @param {String} dataProvider
	 * @this {Lookup}
	 * @deprecated use setLookupDataProvider instead
	 */
	Lookup.prototype.setLookupDataprovider = function(dataProvider) {
		this.lookupDataprovider = dataProvider;
	}
	
	/**
	 * Sets the lookup dataprovider
	 * Has to be a dataprovider or a related dataprovider of the lookup dataSource
	 * Setting the lookup dataprovider will return the selected dataprovider values in the lookup callback
	 *
	 * @public
	 * @param {String} dataProvider
	 * @this {Lookup}
	 * 
	 * @example <pre> 
	 * var lookupObj = scopes.svyLookup.createLookup(datasources.db.example_data.products.getDataSource());
	 * // set the lookup dataprovider to productid
	 * lookupObj.setLookupDataProvider("productid");
	 * 
	 * // add fields
	 * lookupObj.addField('productname').setTitleText('Product');
	 * lookupObj.addField('products_to_suppliers.companyname').setTitleText('Supplier');
	 * lookupObj.addField('unitprice')
	 *	.setSearchable(false)
	 *	.setTitleText('Price')
	 *	.setFormat('#,###.00')
	 *		
	 * // show pop-up
	 * lookupObj.showPopUp(onSelect, elements.setProduct, controller.getFormWidth()/2, 412);
	 * 
	 * //because i have set the lookupDataProvider as productid values contains the selected productid (if any selected)
     * function onSelect(record, values, lookup){
	 *   if (values && values.length) {
	 * 	  foundset.productid = values[0];
	 *   }
	 * }
	 * </pre>
	 * 
	 */
	Lookup.prototype.setLookupDataProvider = function(dataProvider) {
		this.lookupDataprovider = dataProvider;
	}	

	/**
	 * Gets the lookup dataprovider
	 * @protected
	 * @return {String}
	 * @this {Lookup}
	 * @deprecated use getLookupDataProvider instead
	 */
	Lookup.prototype.getLookupDataprovider = function() {
		return this.lookupDataprovider;
	}	

	/**
	 * Gets the lookup dataprovider
	 * @public
	 * @return {String}
	 * @this {Lookup}
	 */
	Lookup.prototype.getLookupDataProvider = function() {
		return this.lookupDataprovider;
	}	

	/**
	 * Returns the Lookup form instance used
	 * @public
	 * @return {RuntimeForm<AbstractLookup>}
	 * @this {Lookup}
	 */
	Lookup.prototype.getLookupForm = function() {
		/** @type {RuntimeForm<AbstractLookup>} */
		var lookupForm;
		if (this.lookupFormProvider) {
			lookupForm = forms[this.lookupFormProvider];
		} else if (this.multiSelect === true) {
			this.lookupFormProvider = DEFAULT_FORM_INSTANCES.MULTI_LOOKUP;
			lookupForm = forms[DEFAULT_FORM_INSTANCES.MULTI_LOOKUP];
		} else {
			this.lookupFormProvider = DEFAULT_FORM_INSTANCES.LOOKUP;
			lookupForm = forms[DEFAULT_FORM_INSTANCES.LOOKUP];			
		}
		return lookupForm;
	}

	/**
	 * Adds a field to the lookup object
	 *
	 * @public
	 * @param {String} dataProvider
	 * @return {LookupField}
	 * 
	 * @example <pre>
	 * var lookupObj = scopes.svyLookup.createLookup(datasources.db.example_data.products.getDataSource());
	 * 
	 * lookupObj.addField('productname').setTitleText('Product');
	 * lookupObj.addField('products_to_suppliers.companyname').setTitleText('Supplier');
	 * lookupObj.addField('unitprice')
	 *	.setSearchable(false)
	 *	.setTitleText('Price')
	 *	.setFormat('#,###.00')
	 *</pre>
	 * 
	 * @this {Lookup}
	 */
	Lookup.prototype.addField = function(dataProvider) {
		var provider = new LookupField(this, dataProvider);
		this.fields.push(provider);
		return provider;
	}

	/**
	 * Gets the field at the specified index
	 * @public
	 * @param {Number} index
	 * @return {LookupField}
	 * @this {Lookup}
	 */
	Lookup.prototype.getField = function(index) {
		return this.fields[index];
	}

	/**
	 * Removes a field at the specified index
	 * @public
	 * @param {Number} index
	 * @this {Lookup}
	 */
	Lookup.prototype.removeField = function(index) {
		this.fields.splice(index, 1);
	}

	/**
	 * Gets the number of fields in the lookup object
	 * @public
	 * @return {Number}
	 * @this {Lookup}
	 */
	Lookup.prototype.getFieldCount = function() {
		return this.fields.length;
	}

	/**
	 * Add a params to be added into the onSelect callback arguments
	 * @param {Object} param
	 * @public
	 * @example <pre>
	 * // create lookup object
	 * var lookupObj = scopes.svyLookup.createLookup(datasources.db.example_data.products.getDataSource());
	 * lookupObj.setLookupDataProvider("productname");
	 *
	 * // custom param, define to which dataprovider the lookup result should be assigned
	 * lookupObj.addParam({resultDataProvider: "productfk"});
	 * lookupObj.showPopUp(onSelect, elements.productfk);
	 *
	 * function onSelect(records, values, lookup) {
	 * 	if (values && values.length) {
	 * 		var resultDataProvider = lookup.getParams()[0].resultDataProvider;
	 * 		foundset[resultDataProvider] = values[0];
	 * 	}
	 * }
	 * </pre>
	 * 
	 * @this {Lookup}
	 * */
	Lookup.prototype.addParam = function(param) {
		this.params.push(param);
	}

	/**
	 * @public
	 * @return {Array}
	 * 
	 * @example <pre>
	 * // create lookup object
	 * var lookupObj = scopes.svyLookup.createLookup(datasources.db.example_data.products.getDataSource());
	 * lookupObj.setLookupDataProvider("productname");
	 *
	 * // custom param, define to which dataprovider the lookup result should be assigned
	 * lookupObj.addParam({resultDataProvider: "productfk"});
	 * lookupObj.showPopUp(onSelect, elements.productfk);
	 *
	 * function onSelect(records, values, lookup) {
	 * 	if (values && values.length) {
	 * 		var resultDataProvider = lookup.getParams()[0].resultDataProvider;
	 * 		foundset[resultDataProvider] = values[0];
	 * 	}
	 * }
	 * </pre>
	 * 
	 * @this {Lookup}
	 * */
	Lookup.prototype.getParams = function() {
		return this.params;
	}

	/**
	 * Returns the selected records for the lookup object
	 * Can be used to know which records have been previously selected by the user for this lookup
	 * 
	 * @public
	 * @return {Array<JSRecord>}
	 * @this {Lookup}
	 * */
	Lookup.prototype.getSelectedRecords = function() {
		var result = [];
		if (this.selectedPks && this.selectedPks.length > 0) {
			/** @type {String} */
			var ds = this.getDataSource();
			var fs = databaseManager.getFoundSet(ds);
			var pks = databaseManager.createEmptyDataSet(0, this.selectedPks[0].length);
			for (var i = 0; i < this.selectedPks.length; i++) {
				pks.addRow(this.selectedPks[i]);
			}
			// NOTE: for valuelist based lookup i need to store the realValue, there is no much use of the PKs
			fs.loadRecords(pks);
			if (utils.hasRecords(fs)) {
				for (var f = 1; f <= fs.getSize(); f++) {
					result.push(fs.getRecord(f));
				}
			}
		}
		return result;
	}	
	
	/**
	 * Returns the selected values based on the lookupDataProvider based on the lookupFormProvider.
	 * Can be used to know which values have been previously selected by the user for this lookup.
	 * 
	 * @throws {scopes.svyExceptions.IllegalStateException} throws an exception if the lookupDataProvider has not been set
	 * 
	 * @public
	 * @return {Array<JSRecord>}
	 * @this {Lookup}
	 * */
	Lookup.prototype.getSelectedValues = function() {

		// TODO what if no lookupDataProvider is set !?
		
		var lookupValues;
		var lookupDataprovider = this.getLookupDataProvider();
		if (lookupDataprovider) {
			var records = this.getSelectedRecords();
			lookupValues = [];
			if (records && lookupDataprovider) {
				for (var i = 0; i < records.length; i++) {
					lookupValues.push(records[i][lookupDataprovider]);
				}
			}
		} else {
			throw new scopes.svyExceptions.IllegalStateException("Calling getSelectedValues on Lookup with unknown lookupDataProvider");
		}
		return lookupValues;
		
	}	

	/**
	 * Removes a param at the specified index
	 * @public
	 * @param {Number} index
	 * @this {Lookup}
	 */
	Lookup.prototype.removeParam = function(index) {
		this.params.splice(index, 1);
	}

	/**
	 * Clear the params
	 * @public
	 * @this {Lookup}
	 */
	Lookup.prototype.clearParams = function() {
		this.params = [];
	}
	/**
	 * Shows the lookup as a Popup Form
	 *
	 * @public
	 * @param {function(Array<JSRecord>,Array<String|Date|Number>,Lookup)} callback The function that will be called when a selection is made; the callback returns the following arguments: {Array<JSRecord>} record, {Array<String|Date|Number>} lookupValue , {Lookup} lookup
	 * @param {RuntimeComponent|RuntimeWebComponent} target The component to show relative to
	 * @param {Number} [width] The width of the lookup. Optional. Default is same as target component
	 * @param {Number} [height] The height of the lookup. Optional. Default is implementation-specifc.
	 * @param {String} [initialValue] And initial value to show in the search
	 * @this {Lookup}
	 */
	Lookup.prototype.showPopUp = function(callback, target, width, height, initialValue) {
		/** @type {RuntimeForm<AbstractLookup>} */
		var lookupForm = this.getLookupForm();
		/** @type {scopes.svyLookup.Lookup} */
		var thisInstance = this;
		var runtimeForm = lookupForm.newInstance(thisInstance);
		runtimeForm.showPopUp(callback, target, width, height, initialValue);
	}
	
	/**
	 * Creates and returns a Popup Form to be used to show the lookup
	 * 
	 * @public 
	 * @param {function(Array<JSRecord>,Array<String|Date|Number>,scopes.svyLookup.Lookup)} callback The function that will be called when a selection is made; the callback returns the following arguments: {Array<JSRecord>} record, {Array<String|Date|Number>} lookupValue , {Lookup} lookup
	 * @param {String} [initialValue] And initial value to show in the search
	 * @return {plugins.window.FormPopup}
	 * @this {Lookup}
	 */
	Lookup.prototype.createPopUp = function(callback, initialValue) {
		/** @type {RuntimeForm<AbstractLookup>} */
		var lookupForm = this.getLookupForm();
		/** @type {scopes.svyLookup.Lookup} */
		var thisInstance = this;
		var runtimeForm = lookupForm.newInstance(thisInstance);
		return runtimeForm.createPopUp(callback, initialValue);
	}

	/**
	 * Shows the lookup in a modal Window
	 *
	 * @public
	 * @param {function(Array<JSRecord>,Array<String|Date|Number>,Lookup)} [callback] The function that will be called when a selection is made; the callback returns the following arguments: {Array<JSRecord>} record, {Array<String|Date|Number>} lookupValue , {Lookup} lookup
	 * @param {Number} [x]
	 * @param {Number} [y]
	 * @param {Number} [width] The width of the lookup. Optional. Default is same as target component
	 * @param {Number} [height] The height of the lookup. Optional. Default is implementation-specifc.
	 * @param {String} [initialValue] And initial value to show in the search
	 *
	 * @return {Array<JSRecord>|Array<String|Date|Number>} returns the selected records; if the lookupDataprovider has been set instead it returns the lookupDataprovider values on the selected records. Returns null if the window is closed without a selection or an empty selection
	 * @this {Lookup}
	 */
	Lookup.prototype.showModalWindow = function(callback, x, y, width, height, initialValue) {
		/** @type {RuntimeForm<AbstractLookup>} */
		var lookupForm = this.getLookupForm();
		/** @type {scopes.svyLookup.Lookup} */
		var thisInstance = this;
		var runtimeForm = lookupForm.newInstance(thisInstance);
		// TODO return the actual values, no need of params
		return runtimeForm.showModalWindow(callback, x, y, width, height, initialValue);
	}	
	
	
	/**
	 * Shows the lookup in a Window
	 *
	 * @public
	 * @param {JSWindow} win the JSWindow object to show
	 * @param {function(Array<JSRecord>,Array<String|Date|Number>,Lookup)} [callback] The function that will be called when a selection is made; the callback returns the following arguments: {Array<JSRecord>} record, {Array<String|Date|Number>} lookupValue , {Lookup} lookup
	 * @param {String} [initialValue] And initial value to show in the search
	 *
	 * @return {Array<JSRecord>|Array<String|Date|Number>} returns the selected records; if the lookupDataprovider has been set instead it returns the lookupDataprovider values on the selected records. Returns null if the window is closed without a selection or an empty selection
	 * @this {Lookup}
	 */
	Lookup.prototype.showWindow = function(win, callback, initialValue) {
		/** @type {RuntimeForm<AbstractLookup>} */
		var lookupForm = this.getLookupForm();
		/** @type {scopes.svyLookup.Lookup} */
		var thisInstance = this;
		var runtimeForm = lookupForm.newInstance(thisInstance);
		// TODO return the actual values, no need of params
		return runtimeForm.showWindow(win, callback, initialValue);
	}
	
	/**
	 * @public
	 * Creates a window object for the lookup; call lookup.showWindow(win); to show the lookup window
	 *
	 * @param {Number} [x]
 	 * @param {Number} [y]
 	 * @param {Number} [width] The width of the pop-up. Optional. Default is component width
 	 * @param {Number} [height] The height of the pop-up. Optional. Default is form height.
 	 * @param {Number} [jsWindowType] Type of window; should be an option of JSWindow, Default JSWindow.MODAL_DIALOG
	 *
	 * @return {JSWindow} returns a JSWindow which can be used to show the lookup in it using lookup.showWindow(window)
	 * @this {Lookup}
	 */
	Lookup.prototype.createWindow = function(x, y, width, height, jsWindowType) {
		/** @type {RuntimeForm<AbstractLookup>} */
		var lookupForm = this.getLookupForm();
		/** @type {scopes.svyLookup.Lookup} */
		var runtimeForm = lookupForm.newInstance(this);
		// TODO return the actual values, no need of params
		return runtimeForm.createWindow(x, y, width, height, jsWindowType);
	}
	
	/**
	 * Clears the selection of this Lookup
	 * 
	 * @public 
	 * @this {Lookup}
	 */
	Lookup.prototype.clearSelectedRecords = function() {
		this.selectedPks = [];
	}	
	
	/**
	 * Sets the selected records of this Lookup
	 * Can be used to restore the user's selection from a previous user's session
	 * 
	 * @public 
	 * @param {Array<JSRecord>} records
	 * @this {Lookup}
	 */
	Lookup.prototype.setSelectedRecords = function(records) {
		this.selectedPks = [];
		for (var r = 0; r < records.length; r++) {
			this.addSelectedRecord(records[r]);
		}
	}
	
	/**
	 * Adds the given record to the list of selected records
	 * 
	 * @public 
	 * @param {JSRecord} record
	 * @this {Lookup}
	 */
     Lookup.prototype.addSelectedRecord = function(record) {
		this.selectedPks.push(record.getPKs().map(function(item) {
			if(item instanceof UUID) {
				return item.toString();
			} else {
				return item;
			}
		}));
	}
	
	/**
	 * Removes the given record from the list of selected records
	 * 
	 * @public 
	 * @param {JSRecord} record
	 * @this {Lookup}
	 */
	Lookup.prototype.removeSelectedRecord = function(record) {
		var selectedPKs = record.getPKs().map(function(item) {
			if(item instanceof UUID) {
				return item.toString();
			} else {
				return item;
			}
		});
		
		for (var s = 0; s < this.selectedPks.length; s++) {
			if (scopes.svyJSUtils.areObjectsEqual(this.selectedPks[s], selectedPKs)) {
				this.selectedPks.splice(s, 1);
			}
		}
	}
	
	/**
	 * Sets the selected records of this Lookup from the given primary keys
	 * Can be used to restore the user's selection from a previous user's session
	 * 
	 * @public 
	 * @param {Array<*>} pks
	 * @this {Lookup}
	 */
	Lookup.prototype.setSelectedPks = function(pks) {
		this.selectedPks = [];
		for (var s = 0; s < pks.length; s++) {
			if (pks[s] instanceof Array) {
				this.selectedPks.push(pks[s]);
			} else {
				this.selectedPks.push([pks[s]]);				
			}
		}
	}
	
	/**
	 * @public 
	 * Sets the selected values of this Lookup based on the lookupFormProvider
	 * Can be used to restore the user's selection from a previous user's session
	 * 
	 * @throws {scopes.svyExceptions.IllegalStateException} throws an exception if the lookupDataProvider has not been set
	 * 
	 * @param {Array<*>} values
	 * @this {Lookup}
	 */
	Lookup.prototype.setSelectedValues = function(values) {

		if (!values) {
			throw new scopes.svyExceptions.IllegalArgumentException("Values null or undefined for setSelectedValues");
		}
	
		if (!this.getDataSource()) {
			throw new scopes.svyExceptions.IllegalStateException("Calling setSelectedValues on Lookup with unknown dataSource");
		}
		
		var lookupProvider = this.getLookupDataProvider();
		if (!lookupProvider) {
			throw new scopes.svyExceptions.IllegalStateException("Calling setSelectedValues on Lookup with unknown lookupDataProvider");
		}
		
		var pks = [];
		if (values.length) {
		
			
			/** @type {String} */
			var dataSource = this.getDataSource();
			var query = databaseManager.createSelect(dataSource);
			query.result.addPk();
			
			// TODO check if lookup provider exists ?
			query.where.add(query.getColumn(lookupProvider).isin(values));
			
			var ds = databaseManager.getDataSetByQuery(query,-1);
			
			if (ds.getMaxColumnIndex() > 1) {
				for (var i = 1; i <= ds.getMaxRowIndex(); i++) {
					var row = ds.getRowAsArray(i);
					pks.push(row);
				}
			} else {
				pks = ds.getColumnAsArray(1);
			}
		}
		
		// TODO in case of in-memory datasource, selection can still be lost if the datasource is re-created after this call.
		// an idea can be to store the selectedValues in the lookup object; but then the lookup will have selectedValues and selectedPks which is confusing
		// set selected pks
		this.setSelectedPks(pks);
	}
	
	/**
	 * Returns the valuelist name if the Lookup has been created from a valuelist (@see createValueListLookup(valuelistName, titleText))
	 *
	 * @public
	 * @this {Lookup}
	 * @return {String}
	 */
	Lookup.prototype.getValueListName = function() {
		return this.valueListName;
	}
}

/**
 * @private 
 * @param {Lookup} lookup
 * @param {String} dataProvider
 * @constructor
 * @properties={typeid:24,uuid:"99124DEA-4AE1-45B2-8747-002F83924A53"}
 * @AllowToRunInFind
 */
function LookupField(lookup, dataProvider) {

	/**
	 * @protected
	 * @type {String}
	 */
	this.dataProvider = dataProvider;	

	/**
	 * @protected 
	 * @type {Boolean}
	 */
	this.searchable = true;

	/**
	 * @protected
	 * @type {String}
	 */
	this.titleText = dataProvider;

	/**
	 * @protected
	 * @type {String}
	 */
	this.valueListName = null;

	/**
	 * @protected
	 * @type {String}
	 */
	this.format = null;

	/**
	 * @protected
	 * @type {Boolean}
	 */
	this.visible = true;

	/**
	 * @protected
	 * @type {String}
	 */
	this.styleClass = null;

	/**
	 * @protected
	 * @type {String}
	 */
	this.width = 'auto';
	
	/**
	 * @protected 
	 * @type {String}
	 */
	this.headerStyleClass = ''
	
	/**
	 * @protected 
	 * @type {Boolean}
	 */
	this.autoResize = true;
	
	/**
	 * @protected 
	 * @type {Boolean}
	 */
	this.resizable = false;
	
	/**
	 * @protected
	 * @type {String}
	 */
	this.showAs = 'sanitizedHtml';

	/**
	 * @protected
	 * @type {String}
	 */
	this.styleClassDataprovider = null;
	
	/**
	 * @protected
	 * @type {Boolean}
	 */
	this.castIntegerToString = false;
	
	/**
	 * @protected 
	 * @type {Lookup}
	 */
	this.lookup = lookup;

}

/**
 * @constructor 
 * @private 
 *
 * @properties={typeid:24,uuid:"299D7B9B-CE53-42F6-9AE8-95D7B8CF5960"}
 * @AllowToRunInFind
 */
function init_LookupField() {
	
	/**
	 * Gets the data provider for this field
	 * @public
	 * @return {String}
	 * @this {LookupField}
	 */
	LookupField.prototype.getDataProvider = function() {
		return this.dataProvider;
	}

	/**
	 * Indicates if this field is searchable
	 * @public
	 * @param {Boolean} searchable True to make searchable. False to make display-only
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setSearchable = function(searchable) {
		this.searchable = searchable;
		return this;
	}

	/**
	 * Gets the searchability of this field
	 * @public
	 * @return {Boolean}
	 * @this {LookupField}
	 */
	LookupField.prototype.isSearchable = function() {
		return this.searchable;
	}

	/**
	 * Sets the display text for this field
	 * @public
	 * @param {String} titleText
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setTitleText = function(titleText) {
		this.titleText = titleText;
		return this;
	}

	/**
	 * Gets the display text for this field
	 * @public
	 * @return {String}
	 * @this {LookupField}
	 */
	LookupField.prototype.getTitleText = function() {
		return this.titleText;
	}

	/**
	 * Sets the valuelist to use to display this field
	 * @protected
	 * @param {String} vl
	 * @return {LookupField}
	 * @this {LookupField}
	 * @deprecated use setValueListName instead
	 */
	LookupField.prototype.setvalueListName = function(vl) {
		this.valueListName = vl;
		return this;
	}

	/**
	 * Sets the valuelist to use to display this field
	 * @public
	 * @param {String} valueListName
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setValueListName = function(valueListName) {
		this.valueListName = valueListName;
		return this;
	}	

	/**
	 * Gets the value list name for this field
	 * @public
	 * @return {String}
	 * @this {LookupField}
	 */
	LookupField.prototype.getValueListName = function() {
		return this.valueListName;
	}

	/**
	 * Sets this field's visibility in the lookup form
	 * @public
	 * @param {Boolean} visible
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setVisible = function(visible) {
		this.visible = visible;
		return this;
	}

	/**
	 * Indicates if this field should be displayed
	 * @public
	 * @return {Boolean}
	 * @this {LookupField}
	 */
	LookupField.prototype.isVisible = function() {
		return this.visible;
	}

	/**
	 * Sets the display format for this field
	 * @public
	 * @param {String} format
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setFormat = function(format) {
		this.format = format;
		return this;
	}

	/**
	 * Gets the display format for this field;
	 * @public
	 * @return {String}
	 * @this {LookupField}
	 */
	LookupField.prototype.getFormat = function() {
		return this.format;
	}

	/**
	 * Sets the style class of this field
	 * @public
	 * @param {String} styleClass
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setStyleClass = function(styleClass) {
		this.styleClass = styleClass;
		return this;
	}

	/**
	 * Returns the style class of this field
	 * @public
	 * @return {String}
	 * @this {LookupField}
	 */
	LookupField.prototype.getStyleClass = function() {
		return this.styleClass;
	}

	/**
	 * Sets the style class dataProvider of this field
	 * @public
	 * @param {String} styleClassDataprovider
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setStyleClassDataprovider = function(styleClassDataprovider) {
		this.styleClassDataprovider = styleClassDataprovider;
		return this;
	}

	/**
	 * Returns the style class dataProvider of this field
	 * @public
	 * @return {String}
	 * @this {LookupField}
	 */
	LookupField.prototype.getStyleClassDataprovider = function() {
		return this.styleClassDataprovider;
	}
	
	/**
	 * Sets the header style class of this field
	 * @public
	 * @param {String} headerStyleClass
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setHeaderStyleClass = function(headerStyleClass) {
		this.headerStyleClass = headerStyleClass;
		return this;
	}

	/**
	 * Returns the header style class of this field
	 * @public
	 * @return {String}
	 * @this {LookupField}
	 */
	LookupField.prototype.getHeaderStyleClass = function() {
		return this.headerStyleClass;
	}

	/**
	 * Sets the width of this field
	 * @public
	 * @param {String} width Default "auto"
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setWidth = function(width) {
		this.width = width;
		return this;
	}
	
	/**
	 * Sets the autoresize of this field
	 * @public
	 * @param {Boolean} resize Default "true"
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setAutoResize = function(resize) {
		this.autoResize = resize;
		return this;
	}
	
	/**
	 * Returns the autoresize of this field
	 * @public
	 * @return {Boolean}
	 * @this {LookupField}
	 */
	LookupField.prototype.getAutoResize = function() {
		return this.autoResize;
	}
	
	/**
	 * Sets the resizable property of this field
	 * @public
	 * @param {Boolean} resizable Default "false"
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setFieldResizable = function(resizable) {
		this.resizable = resizable;
		return this;
	}
	
	/**
	 * Returns the resizable property of this field
	 * @public
	 * @return {Boolean}
	 * @this {LookupField}
	 */
	LookupField.prototype.getFieldResizable = function() {
		return this.resizable;
	}

	
	/**
	 * Returns the width of this field
	 * @public
	 * @return {String}
	 * @this {LookupField}
	 */
	LookupField.prototype.getWidth = function() {
		return this.width;
	}
	
	/**
	 * Sets the showAs of this field
	 * @public
	 * @param {String} showAs Default "sanitizedHtml"
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setShowAs = function(showAs) {
		this.showAs = showAs;
		return this;
	}
	
	/**
	 * Returns the showAs of this field
	 * @public
	 * @return {String}
	 * @this {LookupField}
	 */
	LookupField.prototype.getShowAs = function() {
		return this.showAs;
	}

	/**
	 * Returns the width of this field as an integer value
	 * @public
	 * @return {Number}
	 * @this {LookupField}
	 */
	LookupField.prototype.getWidthAsInteger = function() {
		if (this.width === 'auto') {
			return null;
		}
		var intValue = parseInt(this.width);
		if (!isNaN(intValue)) {
			return intValue;
		}
		return null;
	}
	
	/**
	 * Cast integer search field to string
	 * @public
	 * @return {LookupField}
	 * @this {LookupField}
	 */
	LookupField.prototype.setCastInteger = function(cast) {
		this.castIntegerToString = cast;
		return this;
	}
	
	/**
	 * Returns if the integer needs to be cast to string
	 * @public
	 * @return {Boolean}
	 * @this {LookupField}
	 */
	LookupField.prototype.getCastInteger = function() {
		return this.castIntegerToString;
	}
}

/**
 * Gets the version of this module
 * @public 
 * @return {String} the version of the module using the format Major.Minor.Revision
 * @properties={typeid:24,uuid:"C2C1198D-B649-48C8-9453-D67FBB348D25"}
 */
function getVersion() {
	return application.getVersionInfo()['svyLookup'];
}

/**
 * @private 
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"824F31B0-59E7-48A3-8721-232D1A0CAA8C",variableType:-4}
 */
var initSvyLookup = (function() {
	init_Lookup();
	init_LookupField();
})();
