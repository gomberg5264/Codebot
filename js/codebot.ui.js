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
    // Private properties
	var mTabs 				= null;
	var mFilesPanel         = null;
	var mSlidePanel        = null;
    var mIO                 = null;
    var mSelf               = null;
            
    // TODO: implement a pretty confirm dialog/panel
    this.confirm = function(theMessage) {
        mSelf.showDialog({
            keyboard: true,
            title: 'Confirm?',
            content: 'Confirm something',
            buttons: {
                'Label': {css: 'btn-default', dismiss: true, callback: function() { console.log('hey!'); }}
            }
        });
    };
    
    this.log = function(theText) {
        $('#console').append(theText + '<br />');
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
    
    /**
     * Shows a dialog in the screen.
     *
     * @param Object theConfig how the dialog should be displayed. The structure is:
     * {
     *  backdrop: boolean | 'static' // Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click.
     *  keyboard: boolean, // Closes the modal when escape key is pressed
     *  title: string, // Dialog title
     *  content: string, // Dialog content
     *  buttons: {
     *      'label': {css: string, dismiss: boolean, callback: Function},
     *      'label1': {css: string, dismiss: boolean, callback: Function},
     *      (...)
     *  }
     * }
     */
    this.showDialog = function(theConfig) {
        var aText = '';
        
        $('#defaultModal .modal-body').html(theConfig.content || '');
        $('#defaultModal .modal-title').html(theConfig.title || '');
        $('#defaultModal .modal-footer').empty();
        
        if(theConfig.buttons) {
            for(var i in theConfig.buttons) {
                aText += '<button type="button" class="btn '+theConfig.buttons[i].css+'" ' + 
                         (theConfig.buttons[i].dismiss ? 'data-dismiss="modal"' : '') + 
                         '>'+i+'</button>';
            }
            $('#defaultModal .modal-footer').html(aText);
            
            $('#defaultModal .modal-footer button').click(function(theEvent) {
                var aLabel = $(theEvent.currentTarget).html();

                if(theConfig.buttons[aLabel].callback) {
                    theConfig.buttons[aLabel].callback();
                }
            });
        }
        
        $('#defaultModal').modal(theConfig);
    }
	
	this.init = function(theIO, theEditors) {
        console.log('CODEBOT [ui] Building UI');
        
        mSelf           = this;
        mIO             = theIO;
		mFilesPanel     = new CodebotFilesPanel();
        mTabs           = new CodebotTabs();
        mSlidePanel     = new CodebotSlidePanel();
		
        mFilesPanel.init(this, mIO, theEditors);
        mTabs.init(this);
        mSlidePanel.init(this);
        
        // TODO: read data from disk, using last open directory.
        
        // Ugly hack to achieve 100% height.
        $(window).resize(function() {
            var aHeight = $(window).height();
            $('#working-area').height(aHeight - 28);
            $('#files-panel').height(aHeight);
            $('#folders').height(aHeight - 20);
        });
        $(window).trigger('resize');
	};
    
    // getters
    this.__defineGetter__("tabs", function(){
        return mTabs;
    });
    
    this.__defineGetter__("filesPanel", function(){
        return mFilesPanel;
    });
    
    this.__defineGetter__("slidePanel", function(){
        return mSlidePanel;
    });
};