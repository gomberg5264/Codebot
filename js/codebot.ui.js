/*
	The MIT License (MIT)

	Copyright (c) 2013 Fernando Bevilacqua

	Permission is hereby granted, free of charge, to any person obtaining a copy of
	this software and associated documentation files (the "Software"), to deal in
	the Software without restriction, including without limitation the rights to
	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
	the Software, and to permit persons to whom the Software is furnished to do so,
	subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
	FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
	COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
	IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var CodebotUI = function() {
	var mTabs 				= null;
	var mCurrentTab 		= null;
	var mFilesPanel         = null;
    var mIO                  = null;
    var mSelf               = null;
    
	var transform3d = function(theElementId, theX, theY, theZ) {
		document.getElementById(theElementId).style.WebkitTransform = 'translate3d('+ theX +','+ theY +','+ theZ +')';
	};
	
	var tabClosed = function(theTab) {
		var aData = theTab.data('tabData').data;
		var aEditor = aData.editor;
		var aEditorNode = aEditor ? aEditor.getWrapperElement() : null;
		
		// TODO: make a pretty confirm dialog.
		// TODO: only confirm if content has changed.
		if(aEditor && confirm("Save content before closing?")) {
			mIO.writeFile(aData, aEditor.getDoc().getValue(), function() { console.log('Data written!');} );
		}

		if(aEditorNode) {
            aEditorNode.parentNode.removeChild(aEditorNode);
        }
		aData.editor = null;
		
		console.debug('Tab closed', theTab.index(), ', title:', $.trim(theTab.text()), ', data:', aData);
	};
	
	var tabDeactivated = function(theTab) {
		var aTabEditor = null;
		
		aTabEditor = theTab.data('tabData').data.editor;
        
        if(aTabEditor) {
		  aTabEditor.getWrapperElement().style.display = 'none';
        }
		
		console.debug('Tab deactivated', theTab.index(), ', title:', $.trim(theTab.text()), ', data:', theTab.data('tabData').data);
	};
	
	var tabActivated = function(theTab) {
		var aTabEditor = null;
		
		mCurrentTab = theTab;
		
		// Show the content of the newly active tab.
		aTabEditor = mCurrentTab.data('tabData').data.editor;
        
		if(aTabEditor) {
            aTabEditor.getWrapperElement().style.display = 'block';
        }
		
		// Index: mCurrentTab.index()
		// Title: $.trim(mCurrentTab.text())
		// Data: mCurrentTab.data('tabData').data
		console.debug('Tab activated', mCurrentTab.index(), ', title:', $.trim(mCurrentTab.text()), ', data:', mCurrentTab.data('tabData').data);
	};
	
	// TODO: should receive node instead of data.
    this.openTab = function(theNodeData) {
        var aEditorPrefs = {};
        $.extend(aEditorPrefs, CODEBOT.getPrefs().editor);
        
		mIO.readFile(theNodeData, function(theData) {
            aEditorPrefs['mode']        = 'javascript', // TODO: dynamic mode?
            aEditorPrefs['value']       = theData;
            aEditorPrefs['autofocus']   = true;
                
			mTabs.add({
				favicon: 'file-text-o', // TODO: dynamic icon?
				title: theNodeData.name,
				data: {
					editor: CodeMirror(document.getElementById('working-area'), aEditorPrefs),
					file: theNodeData.name,
					path: theNodeData.path,
                    entry: theNodeData.entry
				}
			});
		});
	};
    
    // TODO: implement a pretty confirm dialog/panel
    this.confirm = function(theMessage) {
        mSelf.log('Confirm? ' + theMessage);
        return true;
    };
    
    this.log = function(theText) {
        $('#console').append(theText + '<br />');
    };
		
	this.showConfigDialog = function(theStatus, theContent) {
		if(theStatus) {
			$('#config-dialog').html(theContent);
			
			// TODO: remove the hardcoded value
			transform3d('content', '-600px', '0', '0');
			transform3d('config-dialog', '-600px', '0', '0');
		} else {
			transform3d('content', '0', '0', '0');
			transform3d('config-dialog', '0', '0', '0');
		}
	};

	this.addPlugin = function(theId, theObj) {
		$('#config-bar').html(
			$('#config-bar').html() +
			'<a href="#" data-plugin="'+theId+'"><i class="fa fa-'+theObj.icon+'"></i></a>'
		);
		
		$('#config-bar a').click(function() {
			CODEBOT.handlePluginClick($(this).data('plugin'));
		});
	};
	
	this.init = function(theIO) {
        console.log('CODEBOT [ui] Building UI');
        
        mSelf       = this;
        mIO         = theIO;
		mFilesPanel = new CodebotFilesPanel();
        
		// get tab context from codebot.ui.tabs.js
		mTabs = window.chromeTabs;
		
		mTabs.init({
			container: '.chrome-tabs-shell',
			minWidth: 20,
			maxWidth: 100,
			
			deactivated: tabDeactivated,
			activated: tabActivated,
			closed: tabClosed
		});
        
        mFilesPanel.init(this, mIO);
        
        // TODO: read data from disk, using last open directory.
		mIO.readDirectory('/Users/fernando/Downloads/codebot_test', mFilesPanel.load);
	};
};