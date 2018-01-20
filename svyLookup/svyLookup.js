/**
 * Creates a lookup object which can be used to show a pop-up form
 * 
 * @public 
 * @param {String|JSFoundSet|JSRecord} dataSource The data source to lookup
 * @return {Lookup}
 * @properties={typeid:24,uuid:"65E8E051-667D-4118-A873-8024C2648F09"}
 */
function createLookup(dataSource){
	/** @type {String} */
	var ds = dataSource;
	if(dataSource instanceof JSRecord || dataSource instanceof JSFoundSet){
		ds = dataSource.getDataSource();
	}
	return new Lookup(ds);
}

/**
 * Creates a lookup object from a valuelist which can be used to show a pop-up form or a modal window
 * NOTE: Valuelist cannot be depends on a database relation or is a global method valuelist.
 * 
 * @public 
 * @param {String} valuelistName
 * @return {Lookup}
 *
 * @properties={typeid:24,uuid:"5FE26179-2276-4689-9101-C642C5C1EC68"}
 */
function createLookupFromValuelist(valuelistName){
	
	// TODO check valuelist items
	//var jsValuelist = solutionModel.getValueList(valuelistName);
	//jsValuelist.getReturnDataProviderIds();
	
	// TODO split displayItem into realItem
	// TODO it can be improved, adding displayValue as default field etc
	// TODO it can be improved, checking the type of values, checking the type of dataprovider. 
	// If is based on a dataset query, can look for more than > 500 values. It could actually run the query on the ds itself. Would the class clush in that case ?
	
	var jsList = solutionModel.getValueList(valuelistName);
	if (!jsList) {
		throw new scopes.svyExceptions.IllegalArgumentException("Cannot use undefined valuelist " + valuelistName);
	}
	if (jsList.valueListType != JSValueList.CUSTOM_VALUES && jsList.valueListType != JSValueList.DATABASE_VALUES) {
		throw new scopes.svyExceptions.IllegalArgumentException("The valuelist " + valuelistName + " must be a valuelist of type CUSTOM_VALUES or DATABASE_VALUE ");
	}

	var items = application.getValueListItems(valuelistName);	
	var dataSource = "mem:valuelist_" + valuelistName;
	if (!databaseManager.dataSourceExists(dataSource)) {
		dataSource = items.createDataSource("valuelist_" + valuelistName, [JSColumn.TEXT, JSColumn.TEXT]);
		// TODO should allow to reset the selected values !?!?
	}
	
	// autoconfigure the valuelist lookup
	var valuelistLookup = createLookup(dataSource);
	valuelistLookup.setLoookupDataprovider("realvalue");
	valuelistLookup.addField("displayvalue");
	
	return valuelistLookup;
}

/**
 * @public 
 * @param {String} datasource
 * @constructor 
 * @properties={typeid:24,uuid:"DC5A7A69-5B84-4438-9BFD-06558632E4E8"}
 */
function Lookup(datasource){
	
	/**
	 * @private   
	 * @type {Array<LookupField>} 
	 */
	var fields = [];
	
	/** 
	 * @private 
	 * @type {Array} */
	var params = [];

	/** 
	 * @private 
	 * @type {String} */
	var lookupDataprovider;

	
	/** 
	 * @type {String} 
	 * @private 
	 * */
	var lookupFormProvider;
	

	// TODO var sort
	
	// TODO lookup provider
	
	// TODO datasource could be an existing foundset, used to filter lookup data ?
	
	/**
	 * Sets the lookup form. The lookup form must be an instance of the AbstractLookup form.
	 * 
	 * @public 
	 * @param {RuntimeForm<AbstractLookup>} formProvider
	 *  */
	this.setLookupFormProvider = function (formProvider) {
		if (!formProvider) {
			throw new scopes.svyExceptions.IllegalArgumentException("Illegal argument formProvider. formProvider must be an instance of AbstractLookup form")
		} 
		if (!scopes.svyUI.isJSFormInstanceOf(formProvider,"AbstractLookup")) {
			throw new scopes.svyExceptions.IllegalArgumentException("The given formProvider must be an instance of AbstractLookup form.");
		}
		
		lookupFormProvider = formProvider['controller'].getName();
	} 

	/**
	 * Gets the data source for this Lookup object
	 * @public 
	 * @return {String}
	 */
	this.getDataSource = function(){
		return datasource;
	}
	
	/**
	 * Sets the lookup dataprovider
	 * 
	 * @public 
	 * @param {String} dataProvider
	 */
	this.setLoookupDataprovider = function(dataProvider){
		lookupDataprovider = dataProvider;
	}
	
	/**
	 * Gets the lookup dataprovider
	 * @public 
	 * @return {String}
	 */
	this.getLookupDataprovider = function(){
		return lookupDataprovider;
	}
	
	/**
	 * Adds a field to the lookup object
	 * 
	 * @public 
	 * @param {String} dataProvider
	 * @return {LookupField}
	 */
	this.addField = function(dataProvider){
		var provider = new LookupField(this,dataProvider);
		fields.push(provider);
		return provider;
	}
	
	/**
	 * Gets the field at the specified index
	 * @public 
	 * @param {Number} index
	 * @return {LookupField}
	 */
	this.getField = function(index){
		return fields[index];
	}
	
	/**
	 * Removes a field at the specified index
	 * @public 
	 * @param {Number} index
	 */
	this.removeField = function(index){
		fields.splice(index,1);
	}
	
	/**
	 * Gets the number of fields in the lookup object
	 * @public 
	 * @return {Number}
	 */
	this.getFieldCount = function(){
		return fields.length;
	}
	
	/** 
	 * Add a params to be added into the onSelect callback arguments
	 * @param {Object} param
	 * @public 
	 * */
	this.addParam = function(param) {
		params.push(param);
	}
	
	/** 
	 * @public 
	 * @return {Array}
	 * */
	this.getParams = function() {
		return params;
	}
	
	/**
	 * Removes a param at the specified index
	 * @public 
	 * @param {Number} index
	 */
	this.removeParam = function(index){
		params.splice(index,1);
	}
	
	/**
	 * Clear the params
	 * @public 
	 */
	this.clearParams = function(){
		params = [];
	}

	/**
	 * Shows the lookup
	 * 
	 * @public  
	 * @param {Function} callback The function that will be called when a selection is made; the callback returns the following arguments: {Array|Array<JSRecord>} record, {Array} param, {String|Date|Number|Array<String|Date|Number>} [lookupValue] , {String} [lookupDataprovider]
	 * @param {RuntimeComponent} target The component to show relative to
	 * @param {Number} [width] The width of the lookup. Optional. Default is same as target component
	 * @param {Number} [height] The height of the lookup. Optional. Default is implementation-specifc.
	 * @param {String} [initialValue] And initial value to show in the search
	 * @SuppressWarnings(wrongparameters) Fixes illegitmate warning
	 */
	this.showPopUp = function(callback, target, width, height, initialValue){

		/** @type {RuntimeForm<AbstractLookup>} */
		var lookupForm;
		if (lookupFormProvider) {
			lookupForm = forms[lookupFormProvider];
		} else {
			lookupForm = forms.svyLookupTable;
		}
		
		/** @type {RuntimeForm<AbstractLookup>} */
		var runtimeForm = lookupForm.newInstance(this);
		runtimeForm.showPopUp(callback,target,width,height,initialValue);
	}
	
	/**
	 * TODO can create an object insted of passing all params ?
	 * 
	 * Shows the lookup in a modal Window
	 * 
	 * @public
	 * @param {Function} [callback] The function that will be called when a selection is made; the callback returns the following arguments: {Array|Array<JSRecord>} record, {Array} param, {String|Date|Number|Array<String|Date|Number>} [lookupValue], {String} [lookupDataprovider]
	 * @param {Number} [x]
	 * @param {Number} [y]
	 * @param {Number} [width] The width of the lookup. Optional. Default is same as target component
	 * @param {Number} [height] The height of the lookup. Optional. Default is implementation-specifc.
	 * @param {String} [initialValue] And initial value to show in the search
	 * @SuppressWarnings(wrongparameters) Fixes illegitmate warning
	 */
	this.showModalWindow = function(callback, x, y, width, height, initialValue){

		/** @type {RuntimeForm<AbstractLookup>} */
		var lookupForm;
		if (lookupFormProvider) {
			lookupForm = forms[lookupFormProvider];
		} else {
			lookupForm = forms.svyLookupTable;
		}
		
		/** @type {RuntimeForm<AbstractLookup>} */
		var runtimeForm = lookupForm.newInstance(this);
		
		// TODO return the actual values, no need of params
		runtimeForm.showModalWindow(callback,x,y,width,height,initialValue);
	}
	
}

/**
 * @public  
 * @param {Lookup} lookup
 * @param dataProvider
 * @constructor 
 * @properties={typeid:24,uuid:"298B728E-ED51-4ECD-BB3B-0878B766BCBB"}
 * @AllowToRunInFind
 */
function LookupField(lookup, dataProvider){
	
	/**
	 * @private  
	 * @type {Boolean}
	 */
	 var searchable = true;
	
	/**
	 * @private 
	 * @type {String}
	 */
	var titleText = dataProvider;
	
	/**
	 * @private 
	 * @type {String}
	 */
	var valueListName = null;
	
	/**
	 * @private 
	 * @type {String}
	 */
	var format = null;
	
	/**
	 * @private 
	 * @type {Boolean}
	 */
	var visible = true;
	
	/**
	 * @private 
	 * @type {String}
	 */	
	var styleClass;
	
	/**
	 * @private 
	 * @type {String}
	 */	
	var styleClassDataprovider;
	
	/**
	 * Gets the data provider for this field
	 * @public 
	 * @return {String}
	 */
	this.getDataProvider = function(){
		return dataProvider;
	}
	
	/**
	 * Indicates if this field is searchable
	 * 
	 * @public 
	 * @param {Boolean} b True to make searchable. False to make display-only
	 * @return {LookupField}
	 */
	this.setSearchable = function(b){
		searchable = b;
		return this;
	}
	
	/**
	 * Gets the searchability of this field
	 * @public 
	 * @return {Boolean}
	 */
	this.isSearchable = function(){
		return searchable;
	}
	
	/**
	 * Sets the display text for this field
	 * 
	 * @public 
	 * @param {String} txt
	 * @return {LookupField}
	 */
	this.setTitleText = function(txt){
		titleText = txt;
		return this;
	}
	
	/**
	 * Gets the display text for this field
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getTitleText = function(){
		return titleText;
	}
	
	/**
	 * Sets the valuelist to use to display this field
	 * 
	 * @public 
	 * @param {String} vl
	 * @return {LookupField}
	 */
	this.setvalueListName = function(vl){
		valueListName = vl;
		return this;
	}
	
	/**
	 * Gets the value list name for this field
	 * @public 
	 * @return {String}
	 */
	this.getValueListName = function(){
		return valueListName;
	}
	
	/**
	 * Sets this field's visibility in the lookup form
	 * @public 
	 * @param {Boolean} b
	 * @return {LookupField}
	 */
	this.setVisible = function(b){
		visible = b;
		return this;
	}
	
	/**
	 * Indicates if this field should be displayed
	 * 
	 * @public 
	 * @return {Boolean}
	 */
	this.isVisible = function(){
		return visible;
	}
	
	/**
	 * Sets the display format for this field
	 * 
	 * @public 
	 * @param {String} f
	 * @return {LookupField}
	 */
	this.setFormat = function(f){
		format = f;
		return this;
	}
	
	/**
	 * Gets the display format for this field;
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getFormat = function(){
		return format;
	}
	
	/**
	 * 
	 * @public 
	 * @param {String} classes
	 * @return {LookupField}
	 */
	this.setStyleClass = function(classes){
		styleClass = classes;
		return this;
	}
	
	/**
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getStyleClass = function(){
		return styleClass;
	}
	
	/**
	 * 
	 * @public 
	 * @param {String} classProvider
	 * @return {LookupField}
	 */
	this.setStyleClassDataprovider = function(classProvider){
		styleClassDataprovider = classProvider;
		return this;
	}
	
	/**
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getStyleClassDataprovider = function(){
		return styleClassDataprovider;
	}
	
}