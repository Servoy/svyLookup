/**
 * User input for text searching
 *
 * @protected
 * @type {String}
 *
 * @properties={typeid:35,uuid:"0C32DA9C-BC50-46F9-A8F7-6BB9E86D7370"}
 */
var searchText = '';

/**
 * The MultiLookup object used by this lookup form
 *
 * @protected
 * @type {scopes.svyLookup.MultiLookup}
 * @properties={typeid:35,uuid:"1477F822-48C8-46E2-9FA9-60222FC6B324",variableType:-4}
 */
var MultiLookup = null;

/**
 * Handler for the selection callback
 *
 * @private
 * @type {Function}
 * @properties={typeid:35,uuid:"AEF95A40-FE41-44D7-97D2-AFD10E7D45EC",variableType:-4}
 */
var selectHandler = null;

/**
 * Runs the search. Loads records in the foundset.
 *
 * @protected
 * @properties={typeid:24,uuid:"ECD9F461-ACE8-4DCB-B0F7-5193D7FF4752"}
 * @AllowToRunInFind
 */
function search(txt) {
	var order = 0;
	var size = 0;

	//clear in-memory ds
	foundset.deleteAllRecords();

	//iterate through MultiLookup object and setup search object.
	var mlk = MultiLookup.getAllLookups();
	for (var i in mlk) {
		var lu = MultiLookup.getLookup(i);
		var fs = databaseManager.getFoundSet(i);

		//load all records when search is cleared
		if (!txt) {
			fs.loadAllRecords();
		}

		//create search object and add search providers
		var s = scopes.svySearch.createSimpleSearch(fs);

		// set the search text
		s.setSearchText(txt);

		// iterate through all fields of lookup

		for (var j = 0; j < lu.getFieldCount(); j++) {
			s.addSearchProvider(lu.getField(j).getDataProvider()).setAlias(lu.getField(j).getTitleText());
		}

		s.loadRecords(fs);

		//add data to in-memory datasource
		if (fs.getSize()) {
			foundset.newRecord();
			var nr = foundset.getSelectedRecord();
			nr['rec_type'] = 'svy-multids-header'
			nr['display'] = lu.getHeader()
			nr['rec_order'] = order;
			order++;
		}

		//add display dataproviders records

		for (var k = 1; k <= fs.getSize(); k++) {
			var sr = fs.getRecord(k);
			foundset.newRecord();
			nr = foundset.getSelectedRecord();
			nr['rec_pk'] = sr.getPKs().join(','); //get combo PKS
			nr['rec_ds'] = sr.getDataSource();
			nr['rec_type'] = 'svy-multids-detail'
			nr['display'] = sr[lu.getDisplayField()]
			nr['rec_order'] = order;
			order++;
			size++;
		}

		//save and sort foundset
		databaseManager.saveData(foundset);
		foundset.sort('rec_order asc')

		//update header text with search results
		if (size) {
			elements['table'].getColumn(0).headerText = 'Found ' + size + ' record' + (size > 1 ? 's' : '') + '.';
			//			application.output('Found ' + size + ' record' + (size > 1 ? 's' : '') + '.')
		} else {
			elements['table'].getColumn(0).headerText = 'No results found.';
			//			application.output('No results found.')
		}

	}

}

/**
 * Shows this form as pop-up, returns selection in callback
 *
 * @public
 * @param {Function} callback The function that is called when selection happens
 * @param {RuntimeComponent} target The component which will be shown
 * @param {Number} [width] The width of the pop-up. Optional. Default is component width
 * @param {Number} [height] The height of the pop-up. Optional. Default is form height.
 * @param {String} [initialValue] Initial value in search. Optional. Default is empty.
 *
 * @properties={typeid:24,uuid:"3882A299-CE63-4F09-A85D-E597D90358CA"}
 */
function showPopUp(callback, target, width, height, initialValue) {
	selectHandler = callback;
	var w = !width ? target.getWidth() : width;
	if (initialValue) {
		searchText = initialValue;
		search(searchText);
		foundset.loadAllRecords();
	}
	plugins.window.showFormPopup(target, this, this, 'foobar', w, height);
}

/**
 * Hook for sub form(s) to implement specific sol model additions
 *
 * @protected
 * @param {JSForm} jsForm
 * @properties={typeid:24,uuid:"B0B53EC8-3DD3-4997-B257-DBB4DCA128D2"}
 */
function onCreateInstance(jsForm) {
	// to be overridden
}

/**
 * @public
 * @param {scopes.svyLookup.MultiLookup} multiLookupObj
 * @return {RuntimeForm<AbstractLookup>}
 * @properties={typeid:24,uuid:"75BD5BD0-3CB1-45DC-A75A-A349EB25D22C"}
 */
function newInstance(multiLookupObj) {

	// create JSForm clone
	var formName = application.getUUID().toString();
	var jsForm = solutionModel.cloneForm(formName, solutionModel.getForm(controller.getName()));

	//create an in memory datasource to store data
	var ds = databaseManager.createEmptyDataSet()

	ds.addColumn('display')
	ds.addColumn('rec_type')
	ds.addColumn('rec_ds')
	ds.addColumn('rec_pk')
	ds.addColumn('rec_order')

	var uri = ds.createDataSource('inMemMultiDSLookup', [JSColumn.TEXT, JSColumn.TEXT, JSColumn.TEXT, JSColumn.TEXT, JSColumn.TEXT])

	jsForm.dataSource = uri;

	// pass control to sub form(s)
	onCreateInstance(jsForm);

	/** @type {RuntimeForm<AbstractLookup>} */
	var form = forms[formName];
	form['MultiLookup'] = multiLookupObj;
	return form;
}

/**
 * Callback when item is selected
 * @protected
 * @properties={typeid:24,uuid:"5A59560F-F374-408D-98FB-A8601B7AA54D"}
 */
function onSelect() {
	// dismiss popup
	dismiss();
}

/**
 * Dismisses the popup
 *
 * @protected
 * @properties={typeid:24,uuid:"FEE59FA7-0062-4DE7-8A6C-BEBBCA4A729B"}
 * @AllowToRunInFind
 */
function dismiss() {
	//identify record
	if (foundset.getSelectedRecord()['rec_ds']) {
		var fs = databaseManager.getFoundSet(foundset.getSelectedRecord()['rec_ds']);
		var pk = foundset.getSelectedRecord()['rec_pk'].split(',')
		var pkc = databaseManager.getTable(fs).getRowIdentifierColumnNames()
		fs.find()
		for (var i = 0; i < pkc.length; i++) {
			fs[pkc[i]] = pk[i];
		}
		fs.search()
		// invoke callback
		if (selectHandler) {
			selectHandler.call(this, { searchtext: searchText, record: fs.getSelectedRecord() });
		}
	}
	plugins.window.closeFormPopup(null);
}
