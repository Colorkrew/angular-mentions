"use strict";
var core_1 = require("@angular/core");
var core_2 = require("@angular/core");
var mention_list_component_1 = require("./mention-list.component");
var mention_utils_1 = require("./mention-utils");
var KEY_BACKSPACE = 8;
var KEY_TAB = 9;
var KEY_ENTER = 13;
var KEY_SHIFT = 16;
var KEY_ESCAPE = 27;
var KEY_SPACE = 32;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_2 = 50;
/**
 * Angular 2 Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2017 Dan MacFarlane
 */
var MentionDirective = (function () {
    function MentionDirective(_element, _componentResolver, _viewContainerRef) {
        var _this = this;
        this._element = _element;
        this._componentResolver = _componentResolver;
        this._viewContainerRef = _viewContainerRef;
        // the provided configuration object
        this.mentionConfig = { items: [] };
        this.DEFAULT_CONFIG = {
            items: [],
            triggerChar: '@',
            labelKey: 'label',
            maxItems: -1,
            mentionSelect: function (item) { return _this.activeConfig.triggerChar + item[_this.activeConfig.labelKey]; }
        };
        // event emitted whenever the search term changes
        this.searchTerm = new core_2.EventEmitter();
        // option to diable internal filtering. can be used to show the full list returned
        // from an async operation (or allows a custom filter function to be used - in future)
        this.disableSearch = false;
        this.triggerChars = {};
    }
    Object.defineProperty(MentionDirective.prototype, "mention", {
        set: function (items) {
            this.mentionItems = items;
        },
        enumerable: true,
        configurable: true
    });
    MentionDirective.prototype.ngOnChanges = function (changes) {
        // console.log('config change', changes);
        if (changes['mention'] || changes['mentionConfig']) {
            this.updateConfig();
        }
    };
    MentionDirective.prototype.updateConfig = function () {
        var _this = this;
        var config = this.mentionConfig;
        this.triggerChars = {};
        // use items from directive if they have been set
        if (this.mentionItems) {
            config.items = this.mentionItems;
        }
        this.addConfig(config);
        // nested configs
        if (config.mentions) {
            config.mentions.forEach(function (config) { return _this.addConfig(config); });
        }
    };
    // add configuration for a trigger char
    MentionDirective.prototype.addConfig = function (config) {
        // defaults
        var defaults = Object.assign({}, this.DEFAULT_CONFIG);
        config = Object.assign(defaults, config);
        // items
        var items = config.items;
        if (items && items.length > 0) {
            // convert strings to objects
            if (typeof items[0] == 'string') {
                items = items.map(function (label) {
                    var object = {};
                    object[config.labelKey] = label;
                    return object;
                });
            }
            // remove items without an labelKey (as it's required to filter the list)
            items = items.filter(function (e) { return e[config.labelKey]; });
            if (!config.disableSort) {
                items.sort(function (a, b) { return a[config.labelKey].localeCompare(b[config.labelKey]); });
            }
        }
        config.items = items;
        // add the config
        this.triggerChars[config.triggerChar] = config;
        // for async update while menu/search is active
        if (this.activeConfig && this.activeConfig.triggerChar == config.triggerChar) {
            this.activeConfig = config;
            this.updateSearchList();
        }
    };
    MentionDirective.prototype.setIframe = function (iframe) {
        this.iframe = iframe;
    };
    MentionDirective.prototype.stopEvent = function (event) {
        //if (event instanceof KeyboardEvent) { // does not work for iframe
        if (!event.wasClick) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    };
    MentionDirective.prototype.blurHandler = function (event) {
        this.stopEvent(event);
        this.stopSearch = true;
        if (this.searchList) {
            this.searchList.hidden = true;
        }
    };
    MentionDirective.prototype.keyHandler = function (event, nativeElement) {
        if (nativeElement === void 0) { nativeElement = this._element.nativeElement; }
        var val = mention_utils_1.getValue(nativeElement);
        var pos = mention_utils_1.getCaretPosition(nativeElement, this.iframe);
        var charPressed = event.key;
        if (!charPressed) {
            var charCode = event.which || event.keyCode;
            if (!event.shiftKey && (charCode >= 65 && charCode <= 90)) {
                charPressed = String.fromCharCode(charCode + 32);
            }
            else {
                // TODO (dmacfarlane) fix this for non-alpha keys
                // http://stackoverflow.com/questions/2220196/how-to-decode-character-pressed-from-jquerys-keydowns-event-handler?lq=1
                charPressed = String.fromCharCode(event.which || event.keyCode);
            }
        }
        if (event.keyCode == KEY_ENTER && event.wasClick && pos < this.startPos) {
            // put caret back in position prior to contenteditable menu click
            pos = this.startNode.length;
            mention_utils_1.setCaretPosition(this.startNode, pos, this.iframe);
        }
        //console.log("keyHandler", this.startPos, pos, val, charPressed, event);
        var config = this.triggerChars[charPressed];
        if (config) {
            this.activeConfig = config;
            this.startPos = pos;
            this.startNode = (this.iframe ? this.iframe.contentWindow.getSelection() : window.getSelection()).anchorNode;
            this.stopSearch = false;
            this.searchString = null;
            this.showSearchList(nativeElement);
            this.updateSearchList();
        }
        else if (this.startPos >= 0 && !this.stopSearch) {
            if (pos <= this.startPos) {
                this.searchList.hidden = true;
            }
            else if (event.keyCode !== KEY_SHIFT &&
                !event.metaKey &&
                !event.altKey &&
                !event.ctrlKey &&
                pos > this.startPos) {
                if (event.keyCode === KEY_SPACE) {
                    this.startPos = -1;
                }
                else if (event.keyCode === KEY_BACKSPACE && pos > 0) {
                    pos--;
                    if (pos == this.startPos) {
                        this.stopSearch = true;
                    }
                    this.searchList.hidden = this.stopSearch;
                }
                else if (!this.searchList.hidden) {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopEvent(event);
                        this.searchList.hidden = true;
                        // value is inserted without a trailing space for consistency
                        // between element types (div and iframe do not preserve the space)
                        mention_utils_1.insertValue(nativeElement, this.startPos, pos, this.activeConfig.mentionSelect(this.searchList.activeItem), this.iframe);
                        // fire input event so angular bindings are updated
                        if ("createEvent" in document) {
                            var evt = document.createEvent("HTMLEvents");
                            evt.initEvent("input", false, true);
                            nativeElement.dispatchEvent(evt);
                        }
                        this.startPos = -1;
                        return false;
                    }
                    else if (event.keyCode === KEY_ESCAPE) {
                        this.stopEvent(event);
                        this.searchList.hidden = true;
                        this.stopSearch = true;
                        return false;
                    }
                    else if (event.keyCode === KEY_DOWN) {
                        this.stopEvent(event);
                        this.searchList.activateNextItem();
                        return false;
                    }
                    else if (event.keyCode === KEY_UP) {
                        this.stopEvent(event);
                        this.searchList.activatePreviousItem();
                        return false;
                    }
                }
                if (event.keyCode === KEY_LEFT || event.keyCode === KEY_RIGHT) {
                    this.stopEvent(event);
                    return false;
                }
                else {
                    var mention = val.substring(this.startPos + 1, pos);
                    if (event.keyCode !== KEY_BACKSPACE) {
                        mention += charPressed;
                    }
                    this.searchString = mention;
                    this.searchTerm.emit(this.searchString);
                    this.updateSearchList();
                }
            }
        }
    };
    MentionDirective.prototype.updateSearchList = function () {
        var _this = this;
        var matches = [];
        if (this.activeConfig && this.activeConfig.items) {
            var objects = this.activeConfig.items;
            // disabling the search relies on the async operation to do the filtering
            if (!this.disableSearch && this.searchString) {
                var searchStringLowerCase_1 = this.searchString.toLowerCase();
                objects = objects.filter(function (e) { return e[_this.activeConfig.labelKey].toLowerCase().startsWith(searchStringLowerCase_1); });
            }
            matches = objects;
            if (this.activeConfig.maxItems > 0) {
                matches = matches.slice(0, this.activeConfig.maxItems);
            }
        }
        // update the search list
        if (this.searchList) {
            this.searchList.labelKey = this.activeConfig.labelKey;
            this.searchList.items = matches;
            this.searchList.hidden = matches.length == 0;
        }
    };
    MentionDirective.prototype.showSearchList = function (nativeElement) {
        var _this = this;
        if (this.searchList == null) {
            var componentFactory = this._componentResolver.resolveComponentFactory(mention_list_component_1.MentionListComponent);
            var componentRef = this._viewContainerRef.createComponent(componentFactory);
            this.searchList = componentRef.instance;
            this.searchList.position(nativeElement, this.iframe, this.activeConfig.dropUp);
            this.searchList.itemTemplate = this.mentionListTemplate;
            componentRef.instance['itemClick'].subscribe(function () {
                nativeElement.focus();
                var fakeKeydown = { "keyCode": KEY_ENTER, "wasClick": true };
                _this.keyHandler(fakeKeydown, nativeElement);
            });
        }
        else {
            this.searchList.labelKey = this.activeConfig.labelKey;
            this.searchList.activeIndex = 0;
            this.searchList.position(nativeElement, this.iframe, this.activeConfig.dropUp);
            window.setTimeout(function () { return _this.searchList.resetScroll(); });
        }
    };
    return MentionDirective;
}());
MentionDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: '[mention], [mentionConfig]',
                host: {
                    '(keydown)': 'keyHandler($event)',
                    '(blur)': 'blurHandler($event)'
                }
            },] },
];
/** @nocollapse */
MentionDirective.ctorParameters = function () { return [
    { type: core_1.ElementRef, },
    { type: core_1.ComponentFactoryResolver, },
    { type: core_1.ViewContainerRef, },
]; };
MentionDirective.propDecorators = {
    'mention': [{ type: core_2.Input, args: ['mention',] },],
    'mentionConfig': [{ type: core_2.Input },],
    'mentionListTemplate': [{ type: core_2.Input },],
    'searchTerm': [{ type: core_2.Output },],
};
exports.MentionDirective = MentionDirective;
