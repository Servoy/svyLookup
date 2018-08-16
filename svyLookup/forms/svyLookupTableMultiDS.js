/**
 * Overrides creation hook and adds columns
 * @protected
 * @param {JSForm} jsForm
 * @override
 * @properties={typeid:24,uuid:"1DAC279D-64EE-402D-9801-73A998B021B4"}
 * @AllowToRunInFind
 */
function onCreateInstance(jsForm) {
	var f = solutionModel.getForm(jsForm.name)
	f.getButton('display').dataProviderID = 'display';
	controller.recreateUI();
}

/**
 * Handle focus gained event of the search element. Adds the listener if not added
 * @private
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"3140D5C1-6BB9-4EEC-9B5D-24143D027778"}
 * @AllowToRunInFind
 */
function onFocusGainedSearch(event) {
	search(searchText, 2);
}

/**
 * Callback method for when form is shown.
 * Focuses first field and adds shortcuts
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"4D6F3D0D-1B25-43F3-BD4F-BDBB7B26787B"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) {
	elements.searchBox.requestFocus();
	plugins.window.createShortcut('ESC', dismiss, controller.getName());
	plugins.window.createShortcut('ENTER', onSelect, controller.getName());
}

/**
 * @private
 * handles the keyboard shortcut ENTER and calls select event
 * @properties={typeid:24,uuid:"479174F2-8A95-40E1-938D-1CC40CC0B4CF"}
 */
function onEnter() {
	onSelect();
}

/**
 * Handles the key listener callback event
 *
 * @private
 * @param {JSEvent} event
 * @param {String} value
 * @param {Number} keyCode
 * @param {Number} altKeyCode
 *
 * @properties={typeid:24,uuid:"DF0B5C6F-03A1-4251-BABD-8367C0CB2976"}
 * @AllowToRunInFind
 */
function onKey(event, value, keyCode, altKeyCode) {
	// handle up/down arrow
	if (keyCode == java.awt.event.KeyEvent.VK_DOWN) {
		elements.display.requestFocus();
		return;
	}

	if (keyCode == java.awt.event.KeyEvent.VK_UP) {
		elements.display.requestFocus();
		return;
	}

	// run search
	search(value, 2);
}

/**
 * Handles the action event of the search field
 * Runs search, refocuses on search field
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"2187BFEA-18E9-4DE1-8510-BC643D2DF290"}
 * @AllowToRunInFind
 */
function onActionSearch(event) {
	search(searchText, 2);
	elements.searchBox.requestFocus();
}

/**
 * Callback method when form is (re)loaded.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"53B1D5AD-EF6F-4053-87AF-5E50B5ABDC33"}
 */
function onLoad(event) {
	plugins.keyListener.addKeyListener('keylistener', onKey, true);
}
