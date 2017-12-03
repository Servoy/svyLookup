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
	 * @type {String} 
	 * @private 
	 * */
	var lookupFormProvider;

	/**
	 * @param {RuntimeForm<AbstractLookup>} formProvider
	 *  */
	this.setLookupFormProvider = function (formProvider) {
		if (!formProvider) {
			throw new scopes.svyExceptions.IllegalArgumentException("Illegal argument formProvider. formProvider must be an instance of AbstractLookup form")
		} 
		if (!scopes.svyUI.isJSFormInstanceOf(formProvider,"AbstractLookup")) {
			throw new scopes.svyExceptions.IllegalArgumentException("The given formProvider must be an instance of AbstractLookup form.");
		}
		
		// TODO remove warning
		lookupFormProvider = formProvider.controller.getName();
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
	 * TODO need to set the x,y position instead of being attached to the target element
	 * Shows the lookup in a modal Window
	 * 
	 * @private
	 * @param {Function} callback The function that will be called when a selection is made
	 * @param {RuntimeComponent} target The component to show relative to
	 * @param {Number} [width] The width of the lookup. Optional. Default is same as target component
	 * @param {Number} [height] The height of the lookup. Optional. Default is implementation-specifc.
	 * @param {String} [initialValue] And initial value to show in the search
	 * @SuppressWarnings(wrongparameters) Fixes illegitmate warning
	 */
	this.showModalWindow = function(callback, target, width, height, initialValue){

		/** @type {RuntimeForm<AbstractLookup>} */
		var lookupForm;
		if (lookupFormProvider) {
			lookupForm = forms[lookupFormProvider];
		} else {
			lookupForm = forms.svyLookupTable;
		}
		
		/** @type {RuntimeForm<AbstractLookup>} */
		var runtimeForm = lookupForm.newInstance(this);
		runtimeForm.showModalWindow(callback,target,width,height,initialValue);
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
}