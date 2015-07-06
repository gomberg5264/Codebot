/*
	The MIT License (MIT)

	Copyright (c) 2015 Fernando Bevilacqua

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

/**
 * Search for assets from within Codebot.
 */
var AssetFinderPlugin = function() {
    this.id             = 'cc.codebot.asset.finder';
    var mSelf           = this;
    var mContext        = null;
    var mInfoPanel      = null;

    var findProjectTopFolders = function() {
        var aRoot = mContext.ui.filesPanel.tree,
            aRet = [];
            i = 0;

        for(i = 0; i < aRoot.children.length; i++) {
            if(aRoot.children[i].folder) {
                aRet.push(aRoot.children[i].data);
            }
        }

        return aRet;
    };

    var showItemInfo = function(theItemId) {
        var aIde, aPanel, aFolder, aContent, aProjectFolders, aFoldersText = '';

        aIde = mContext.getPlugin('cc.codebot.ide.web');

        mInfoPanel.html('<i class="fa fa-circle-o-notch fa-spin"></i>');
        mInfoPanel.fadeIn();

        aIde.api('assets', 'info', {item: theItemId}, function(theData) {
            aPanel = new CodebotFancyPanel(theData.title);

            aFolder = aPanel.addFolder('Preview', 'preview');
            aFolder.add('<img src="'+theData.preview[0]+'" style="width: 100%; height: auto;"/>', 'id', 'raw');

            aProjectFolders = findProjectTopFolders();
            for(var i = 0, aTotal = aProjectFolders.length; i < aTotal; i++) {
                aFoldersText += '<option value="' + aProjectFolders[i].path + '">/' + aProjectFolders[i].name + '</option>';
            }
            aFolder = aPanel.addFolder('Download', 'actions');
            aFolder.add('<select id="assetDestinationDir"><option value="/">/</option>'+aFoldersText+'</select> <a href="javascript:void(0)" id="assetDownloadLink"><i class="fa fa-download"></i> DOWNLOAD</a>', 'Save to');

            aFolder = aPanel.addFolder('Details', 'details');
            aFolder.add(theData.author, 'Author');
            aFolder.add(theData.license, 'License');
            aFolder.add(theData.channel, 'Channel');

            aFolder = aPanel.addFolder('Description', 'description');
            aFolder.add(theData.description);

            mInfoPanel.html(aPanel.html());

            mInfoPanel.find('a#assetDownloadLink').click(function() {
                mInfoPanel.fadeOut();
                mContext.ui.filesPanel.addPendingActivity('downloading' + theItemId, 'Downloading asset', 'Fetching item to "' + mInfoPanel.find('select#assetDestinationDir').val() + '"');

                aIde.api('assets', 'fetch', {item: theItemId, project: aIde.getActiveProject().id, destination: mInfoPanel.find('select#assetDestinationDir').val()}, function(theData) {
                    mContext.ui.filesPanel.removePendingActivity('downloading' + theItemId);

                    if(theData.success) {
                        aIde.refreshProjectFileList();

                    } else {
                        // TODO: show the error somewhere.
                        console.error(theData.message);
                    }
                });
            });
        });
    };

    var doSearch = function() {
        var i, aContent = '', aIde;

        aIde = mContext.getPlugin('cc.codebot.ide.web');

        $('#assets-finder-browse-area').html('<i class="fa fa-circle-o-notch fa-spin"></i>');

        aIde.api('assets', 'search', $('#asset-finder-main').serialize(), function(theData) {
            if(theData.success) {
                for(i = 0; i < theData.items.length; i++) {
                    aContent += '<a href="javascript:void(0)" data-item="'+theData.items[i].id+'"><img src="'+theData.items[i].thumbnail+'" alt="Preview" style="width: 90px; height: 90px; padding: 2px;"></a>';

                }
                $('#assets-finder-browse-area').html(aContent);

                $('#assets-finder-browse-area a').click(function() {
                    showItemInfo($(this).data('item'));
                });
            }
        });
    }

    var loadMoreSearchResults = function() {
        // TODO: implement this.
        console.log('loadMoreSearchResults?');
    };

    this.mainPanel = function(theContainer, theContext) {
        var aContent = '';
        var aPanel = new CodebotFancyPanel('Asset Finder');

        var aFolder = aPanel.addFolder('Options', 'options');

        aFolder.add('<input type="text" name="query" value="" />', 'Search');

        aFolder.add(
            '<select name="license">' +
                '<option value="1">CC-BY 3.0</option>' +
                '<option value="2">CC-BY-SA 3.0</option>' +
                '<option value="4">GPL 3.0</option>' +
            '</select>',
            'License'
        );

        var aFolder = aPanel.addFolder('Results', 'results');
        aFolder.add('<div id="assets-finder-browse-area" style="width: 100%; height: 635px; overflow: scroll;">Nothing to show yet.</div>');

        aContent += '<form action="#" id="asset-finder-main">';
        aContent += aPanel.html();
        aContent += '<input type="hidden" name="start" value="0">';
        aContent += '<input type="hidden" name="limit" value="50">';
        aContent += '</form>';

        theContainer.append(aContent);

        $('#asset-finder-main').submit(function(theEvent) {
            doSearch();
            theEvent.preventDefault();
            return false;
        });

        // TODO: improve this.
        $("#assets-finder-browse-area").scroll(function() {
            var aHasReachedBottom = $(this)[0].scrollHeight - $(this).scrollTop() <= $(this).outerHeight();

            if(aHasReachedBottom) {
                loadMoreSearchResults();
            }
        });
    };

    this.init = function(theContext) {
        console.debug('AssetFinderPlugin:init()');

        mContext = theContext;
        mContext.ui.addButton({ icon: '<i class="fa fa-picture-o"></i>', panel: mSelf.mainPanel });

        $('body').append('<div id="asset-info-item-description" style="display: none; position: absolute; top:0; right: 333px; width: 600px; height: 100%; background: #3d3d3d; overflow: hidden;"></div>');
        mInfoPanel = $('#asset-info-item-description');

        mContext.signals.beforeLastSlidePanelClose.add(function() {
            mInfoPanel.fadeOut();
        });
    };
};

CODEBOT.addPlugin(new AssetFinderPlugin());
