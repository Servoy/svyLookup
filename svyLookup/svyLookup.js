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
 * @private
 * @param {String} datasource
 * @constructor 
 * @properties={typeid:24,uuid:"DC5A7A69-5B84-4438-9BFD-06558632E4E8"}
 */
function Lookup(datasource){
	
	/**  
	 * @type {Array<LookupField>} 
	 */
	var fields = [];

	/**
	 * Gets the data source for this Lookup object
	 * @public 
	 * @return {String}
	 */
	this.getDataSource = function(){
		return datasource;
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
	 * Shows the lookup
	 * 
	 * @public  
	 * @param {Function} callback The function that will be called when a selection is made
	 * @param {RuntimeComponent} target The component to show relative to
	 * @param {Number} [width] The width of the lookup. Optional. Default is same as target component
	 * @param {Number} [height] The height of the lookup. Optional. Default is implementation-specifc.
	 * @param {String} [initialValue] And initial value to show in the search
	 */
	this.showPopUp = function(callback, target, width, height, initialValue){
		var runtimeForm = forms.svyLookupTable.newInstance(this);
		runtimeForm.showPopUp(callback,target,width,height,initialValue);
	}
}

/**
 * @private 
 * @param {Lookup} lookup
 * @param dataProvider
 * @constructor 
 * @properties={typeid:24,uuid:"298B728E-ED51-4ECD-BB3B-0878B766BCBB"}
 * @AllowToRunInFind
 */
function LookupField(lookup, dataProvider){
	
	/**
	 * @protected 
	 * @type {Boolean}
	 */
	this.searchable = true;
	
	/**
	 * @protected 
	 * @type {String}
	 */
	this.dataProvider = dataProvider;
	
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
	 * Gets the data provider for this field
	 * @public 
	 * @return {String}
	 */
	this.getDataProvider = function(){
		return this.dataProvider;
	}
	
	/**
	 * Indicates if this field is searchable
	 * 
	 * @public 
	 * @param {Boolean} searchable True to make searchable. False to make display-only
	 * @return {LookupField}
	 */
	this.setSearchable = function(searchable){
		this.searchable = searchable;
		return this;
	}
	
	/**
	 * Gets the searchability of this field
	 * @public 
	 * @return {Boolean}
	 */
	this.isSearchable = function(){
		return this.searchable;
	}
	
	/**
	 * Sets the display text for this field
	 * 
	 * @public 
	 * @param {String} titleText
	 * @return {LookupField}
	 */
	this.setTitleText = function(titleText){
		this.titleText = titleText;
		return this;
	}
	
	/**
	 * Gets the display text for this field
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getTitleText = function(){
		return this.titleText;
	}
	
	/**
	 * Sets the valuelist to use to display this field
	 * 
	 * @public 
	 * @param {String} valueListName
	 * @return {LookupField}
	 */
	this.setvalueListName = function(valueListName){
		this.valueListName = valueListName;
		return this;
	}
	
	/**
	 * Gets the value list name for this field
	 * @public 
	 * @return {String}
	 */
	this.getValueListName = function(){
		return this.valueListName;
	}
	
	/**
	 * Sets this field's visibility in the lookup form
	 * @public 
	 * @param {Boolean} visible
	 * @return {LookupField}
	 */
	this.setVisible = function(visible){
		this.visible = visible;
		return this;
	}
	
	/**
	 * Indicates if this field should be displayed
	 * 
	 * @public 
	 * @return {Boolean}
	 */
	this.isVisible = function(){
		return this.visible;
	}
	
	/**
	 * Sets the display format for this field
	 * 
	 * @public 
	 * @param {String} format
	 * @return {LookupField}
	 */
	this.setFormat = function(format){
		this.format = format;
		return this;
	}
	
	/**
	 * Gets the display format for this field;
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getFormat = function(){
		return this.format;
	}
}