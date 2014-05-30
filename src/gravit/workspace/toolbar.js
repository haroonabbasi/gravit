(function (_) {
    /**
     * The global toolbar class
     * @class GToolbar
     * @constructor
     */
    function GToolbar(htmlElement) {
        this._htmlElement = htmlElement;
        htmlElement
            .append($('<div></div>')
                .addClass('section sidebars')
                .append($('<button></button>')
                    //.prop('disabled', true)
                    .addClass('g-active')
                    .append($('<span></span>')
                        .addClass('fa fa-files-o')
                        // TODO : I18N
                        .attr('title', 'Pages')))
                .append($('<button></button>')
                    .prop('disabled', true)
                    .append($('<span></span>')
                        .addClass('fa fa-leaf')
                        // TODO : I18N
                        .attr('title', 'Components')))
                .append($('<button></button>')
                    .prop('disabled', true)
                    .append($('<span></span>')
                        .addClass('fa fa-sitemap')
                        // TODO : I18N
                        .attr('title', 'Structure'))))
            .append($('<div></div>')
                .addClass('section toolpanel'))
            .append($('<div></div>')
                .addClass('section')
                .append($('<button></button>')
                    .attr('data-color-button', 'fill')
                    // TODO : I18N
                    .attr('title', 'Fill Color')
                    .append($('<span></span>'))
                    .gColorButton({
                        swatch: false,
                        dropdown: false,
                        clearColor: true
                    })
                    .on('change', function (evt, color) {
                        this._assignCurrentColor(IFEditor.CurrentColorType.Fill, color);
                    }.bind(this)))
                .append($('<button></button>')
                    .attr('data-color-button', 'stroke')
                    // TODO : I18N
                    .attr('title', 'Stroke Color')
                    .append($('<span></span>'))
                    .gColorButton({
                        swatch: false,
                        dropdown: false,
                        clearColor: true
                    })
                    .on('change', function (evt, color) {
                        this._assignCurrentColor(IFEditor.CurrentColorType.Stroke, color);
                    }.bind(this))));

        this._toolTypeToButtonMap = {};

        this._updateColorButtons();
    };

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GToolbar.prototype._htmlElement = null;

    /**
     * Map of Tool -> Button Html Element
     * @type {Object}
     * @private
     */
    GToolbar.prototype._toolTypeToButtonMap = null;

    /**
     * Called from the workspace to initialize
     */
    GToolbar.prototype.init = function () {
        // Init and add tools
        var toolpanel = this._htmlElement.find('.toolpanel');
        var _addToolButton = function (tool) {
            var button = $("<button></button>")
                .attr('class', tool.instance == gApp.getToolManager().getActiveTool() ? 'g-active' : '')
                .append($(tool.icon).attr('width', '18px').attr('height', '18px'))
                .appendTo(toolpanel)
                .on('click', function () {
                    gApp.getToolManager().activateTool(tool.instance);
                }.bind(this));

            // Concat/read the tool's title
            var title = tool.title;
            if (tool.keys && tool.keys.length > 0) {
                for (var i = 0; i < tool.keys.length; ++i) {
                    if (i == 0) {
                        title += " (";
                    } else {
                        title += ", ";
                    }
                    title += tool.keys[i];
                }
                title += ")";
            }
            button.attr('title', title);

            this._toolTypeToButtonMap[IFObject.getTypeId(tool.instance)] = button;
        }.bind(this);

        // Append all tools now
        var lastGroup = null;
        for (var i = 0; i < gravit.tools.length; ++i) {
            var tool = gravit.tools[i];
            if (tool.group != lastGroup) {
                if (i > 0) {
                    // Add a divider, first
                    toolpanel.append(
                        $("<div></div>")
                            .addClass('divider'));
                }
                lastGroup = tool.group;
            }
            _addToolButton(tool);
        }

        // Subscribe to some events
        gApp.addEventListener(GApplication.DocumentEvent, this._documentEvent, this);
        gApp.getToolManager().addEventListener(IFToolManager.ToolChangedEvent, this._toolChanged, this);
    };

    /**
     * Called from the workspace to relayout
     */
    GToolbar.prototype.relayout = function () {
        // NO-OP
    };

    /**
     * Called whenever the active tool has been changed
     * @param event
     * @private
     */
    GToolbar.prototype._toolChanged = function (event) {
        if (event.previousTool && this._toolTypeToButtonMap[IFObject.getTypeId(event.previousTool)]) {
            this._toolTypeToButtonMap[IFObject.getTypeId(event.previousTool)].removeClass('g-active');
        }
        if (event.newTool && this._toolTypeToButtonMap[IFObject.getTypeId(event.newTool)]) {
            this._toolTypeToButtonMap[IFObject.getTypeId(event.newTool)].addClass('g-active');
        }
    };

    /**
     * @param {GApplication.DocumentEvent} event
     * @private
     */
    GToolbar.prototype._documentEvent = function (event) {
        switch (event.type) {
            case GApplication.DocumentEvent.Type.Activated:
                this._registerDocument(event.document);
                this._updateColorButtons();
                break;
            case GApplication.DocumentEvent.Type.Deactivated:
                this._unregisterDocument(event.document);
                this._updateColorButtons();
                break;
            case GApplication.DocumentEvent.Type.Removed:
                this._updateColorButtons();
                break;

            default:
                break;
        }
    };

    /**
     * @param {GDocument} document
     * @private
     */
    GToolbar.prototype._registerDocument = function (document) {
        var editor = document.getEditor();

        // Subscribe to editor changes
        editor.addEventListener(IFEditor.SelectionChangedEvent, this._selectionChangedEvent, this);
    };

    /**
     * @param {GDocument} document
     * @private
     */
    GToolbar.prototype._unregisterDocument = function (document) {
        var editor = document.getEditor();

        // Unsubscribe from editor changes
        editor.removeEventListener(IFEditor.SelectionChangedEvent, this._selectionChangedEvent);
    };

    /**
     * @param {IFEditor.SelectionChangedEvent} event
     * @private
     */
    GToolbar.prototype._selectionChangedEvent = function (event) {
        this._updateColorButtons();
    };

    /**
     * @private
     */
    GToolbar.prototype._updateColorButtons = function () {
        var fillButton = this._htmlElement.find('[data-color-button="fill"]');
        var strokeButton = this._htmlElement.find('[data-color-button="stroke"]');

        var editor = gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor() : null;

        fillButton.prop('disabled', !editor);
        strokeButton.prop('disabled', !editor);

        if (editor) {
            var selection = editor.getSelection();

            var fillColor = editor.getCurrentColor(IFEditor.CurrentColorType.Fill);
            var strokeColor = editor.getCurrentColor(IFEditor.CurrentColorType.Stroke);

            // If there's a selection, take fill and stroke color from it.
            // If selection is more than one, set both to null
            if (selection) {
                fillColor = null;
                strokeColor = null;

                if (selection.length === 1 && selection[0].hasMixin(IFElement.Attributes)) {
                    var attributes = selection[0].getAttributes();
                    if (attributes.hasMixin(IFAttributes.Pattern)) {
                        fillColor = attributes.getFillColor();
                        strokeColor = attributes.getStrokeColor();
                    }
                }
            }

            fillButton.gColorButton('value', fillColor);
            strokeButton.gColorButton('value', strokeColor);

            fillButton.find('> span:first-child')
                .css('color', fillColor ? fillColor.asCSSString() : '')
                .attr('class', 'fa fa-' + (fillColor ? 'circle' : 'ban'));

            strokeButton.find('> span:first-child')
                .css('color', strokeColor ? strokeColor.asCSSString() : '')
                .attr('class', 'fa fa-' + (strokeColor ? 'circle-o' : 'ban'));
        }
    };

    /**
     * @private
     */
    GToolbar.prototype._assignCurrentColor = function (type, color) {
        var editor = gApp.getActiveDocument().getEditor();
        var selection = editor.getSelection();

        if (selection && selection.length > 0) {
            // If there's a selection then assign color to selection instead
            editor.beginTransaction();
            try {
                for (var i = 0; i < selection.length; ++i) {
                    var element = selection[i];
                    if (element.hasMixin(IFElement.Attributes)) {
                        var attributes = element.getAttributes();
                        if (attributes.hasMixin(IFAttributes.Pattern)) {
                            if (type === IFEditor.CurrentColorType.Fill) {
                                attributes.setFillColor(color);
                            } else if (type === IFEditor.CurrentColorType.Stroke) {
                                attributes.setStrokeColor(color);
                            }
                        }
                    }
                }
            } finally {
                // TODO : I18N
                editor.commitTransaction('Apply Color');
            }
        } else {
            // Otherwise without selection assign the current color
            editor.setCurrentColor(type, color);
        }

        this._updateColorButtons();
    };

    _.GToolbar = GToolbar;
})(this);
