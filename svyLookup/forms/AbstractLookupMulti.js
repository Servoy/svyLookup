/**
 * Adds the given record to the selected records
 * 
 * @param {JSRecord} record
 * @protected 
 *
 * @properties={typeid:24,uuid:"E5C5D453-3606-4567-82E4-B42FA636583D"}
 */
function selectRecord(record) {
	lookup.addSelectedRecord(record);
	record['svy_lookup_selected'] = "true";
	onRecordSelected(record);
}

/**
 * Implement this to select all records
 * @protected 
 * @properties={typeid:24,uuid:"C2698839-E2AB-4E6E-8F34-FAF3C0223F79"}
 */
function selectAllRecords() {
	var fs = foundset.duplicateFoundSet();
	fs.loadAllRecords();
	var result = [];
	for (var index = 1; index <= fs.getSize(); index++) {
		var record = fs.getRecord(index);
		selectRecord(record);
	}
	return result;
}

/**
 * Removes the given record from the selected records
 * 
 * @param {JSRecord} record
 *
 * @properties={typeid:24,uuid:"A8C12ECA-BFDB-4931-A53C-85BB0D7AAE76"}
 */
function deselectRecord(record) {
	lookup.removeSelectedRecord(record);
	record['svy_lookup_selected'] = " ";
	onRecordDeselected(record);
}

/**
 * Removes the record with the given PK(s) from the selected records
 * 
 * @param {Array<*>} pks
 *
 * @properties={typeid:24,uuid:"E8777377-C694-4653-8B90-F63EBC981AB9"}
 */
function deselectPks(pks) {
	var selectedRecords = lookup.getSelectedRecords();
	for (var i = 0; i < selectedRecords.length; i++) {
		if (scopes.svyJSUtils.areObjectsEqual(selectedRecords[i].getPKs(), pks)) {
			deselectRecord(selectedRecords[i]);
		}
	}
}

/**
 * Toggles the selection state of the given record
 * 
 * @param {JSRecord} record
 *
 * @properties={typeid:24,uuid:"964B67E9-1D9C-44F0-92BF-09473033DE23"}
 */
function toggleRecordSelection(record) {
	if (record['svy_lookup_selected'] === 'true') {
		deselectRecord(record);
	} else {
		selectRecord(record);
	}
}

/**
 * Implement this to de-select all records
 * @protected 
 * @properties={typeid:24,uuid:"0AAC4CAD-309E-4B2A-AE9F-D364A59193B1"}
 */
function deselectAllRecords() {
	var selectedRecords = getSvyLookupSelectedRecords();
	for (var c = 0; c < selectedRecords.length; c++) {
		deselectRecord(selectedRecords[c]);
	}
	lookup.clearSelectedRecords();
}

/**
 * Implement this to run custom logic whenever a record is added to the selection
 * @param {JSRecord} record
 * @protected 
 * @properties={typeid:24,uuid:"FD820C65-7334-4664-9787-00824C2C99CE"}
 */
function onRecordSelected(record) {
}

/**
 * Implement this to run custom logic whenever a record is removed from the selection
 * @param {JSRecord} record
 * @protected 
 * @properties={typeid:24,uuid:"CD0C7B29-E979-45A3-8BFD-D5132B1C8F02"}
 */
function onRecordDeselected(record) {
}

/**
 * Returns the selected records
 *
 * @return {Array<JSRecord>}
 * @override
 *
 * @properties={typeid:24,uuid:"4CC09BB5-DCDE-4B5F-8E3A-69694E0F0B57"}
 */
function getSvyLookupSelectedRecords() {
	return lookup.getSelectedRecords();
}


/**
*
* @return {Array<String|Date|Number>}
* @override
*
* @properties={typeid:24,uuid:"3D715F03-7123-4F9B-BD7E-BD2A4C3C5189"}
*/
function getSvyLookupSelectedValues() {
	var lookupValues;
	var lookupDataprovider = lookup.getLookupDataProvider();
	if (lookupDataprovider) {
		var records = getSvyLookupSelectedRecords();
		lookupValues = [];
		if (records && lookupDataprovider) {
			for (var i = 0; i < records.length; i++) {
				lookupValues.push(records[i][lookupDataprovider]);
			}
		}
	} 
	return lookupValues;
}

/**
 * @param {JSEvent} event
 *
 * @return {Boolean}
 * @override
 *
 * @properties={typeid:24,uuid:"193DD836-C0AD-495A-B298-518DB2EBC2CE"}
 */
function onHide(event) {
	var selectedRecords = lookup.getSelectedRecords();
	for (var s = 0; s < selectedRecords.length; s++) {
		selectedRecords[s]['svy_lookup_selected'] = ' ';
		onRecordDeselected(selectedRecords[s]);
	}
	return _super.onHide(event);
}

/**
 * @protected
 * @param {Boolean} firstShow
 * @param {JSEvent} event
 * @override
 *
 * @properties={typeid:24,uuid:"6521DD2A-7497-49B6-921D-36F30E11D163"}
 */
function onShow(firstShow, event) {	
	_super.onShow(firstShow, event);
	
	var selectedRecords = lookup.getSelectedRecords();
	if (selectedRecords.length > 0) {
		for (var s = 0; s < selectedRecords.length; s++) {
			selectedRecords[s]['svy_lookup_selected'] = 'true';
			onRecordSelected(selectedRecords[s]);
		}
	}	
}
