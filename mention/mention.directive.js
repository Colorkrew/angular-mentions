"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var core_2 = require("@angular/core");
var mention_list_component_1 = require("./mention-list.component");
var mention_utils_1 = require("./mention-utils");
var user_agent_service_1 = require("./user-agent.service");
var browser_type_1 = require("./browser-type");
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
var KEY_BUFFERED = 229;
var IME_INPUT_STATUS = Object.freeze({
    NONE: 0,
    INPUTTING: 1,
    FIXED: 2
});
/**
 * Angular 2 Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2017 Dan MacFarlane
 */
var MentionDirective = /** @class */ (function () {
    function MentionDirective(_element, _componentResolver, _viewContainerRef, appRef, injector, uaService) {
        var _this = this;
        this._element = _element;
        this._componentResolver = _componentResolver;
        this._viewContainerRef = _viewContainerRef;
        this.appRef = appRef;
        this.injector = injector;
        this.uaService = uaService;
        this.disabledMention = false;
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
        // event emitted when selected item on mention search list
        this.selectedMention = new core_2.EventEmitter();
        // [Goalous Fix] Delete this option because originally there are some bugs if not async operation.
        // option to diable internal filtering. can be used to show the full list returned
        // from an async operation (or allows a custom filter function to be used - in future)
        // private disableSearch = false;
        this.triggerChars = {};
        this.searchString = '';
        this.isComposing = false;
        this.isAndroid = false;
        this.isFirefox = false;
        this.isPcSafari = false;
        this.inComposition = false;
        this.isKeyHandlerDone = false;
        this.isAttachedEventForRemoveMention = false;
        this.isPcSafari = this.uaService.browserType === browser_type_1.BrowserType.SAFARI && this.uaService.isPcDevice();
        this.isAndroid = this.uaService.isAndroid();
    }
    Object.defineProperty(MentionDirective.prototype, "mention", {
        set: function (items) {
            if (this.disabledMention) {
                return;
            }
            this.mentionItems = items;
        },
        enumerable: true,
        configurable: true
    });
    MentionDirective.prototype.addEventForRemoveMention = function () {
        // TODO: GL-7859 is not completed fixing
        // when enter backspace after selected multiple mentions, all mentions are deleted.
        // The cause: `this._element.nativeElement.removeChild(prevEL);` fire new DOMNodeRemoved event
        // How to fix: stop using removeChild and instead, replace html
        // if (!this.isFirefox) {
        //   return;
        // }
        // if (this.isAttachedEventForRemoveMention) {
        //   return;
        // }
        // this._element.nativeElement.addEventListener('DOMNodeRemoved', (e) => {
        //   // e.preventDefault();
        //   // e.stopPropagation();
        //   if (this.keyDownCode !== KEY_BACKSPACE) {
        //     return;
        //   }
        //   const prevEL = prev(e.target);
        //   if (prevEL && prevEL.tagName === 'SPAN') {
        //     this._element.nativeElement.removeChild(prevEL);
        //   }
        //   return true;
        // });
        // this.isAttachedEventForRemoveMention = true;
    };
    MentionDirective.prototype.ngOnChanges = function (changes) {
        if (changes['mention'] || changes['mentionConfig']) {
            this.updateConfig();
        }
    };
    MentionDirective.prototype.updateConfig = function () {
        var _this = this;
        if (this.disabledMention) {
            return;
        }
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
            if (typeof items[0] === 'string') {
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
        if (this.activeConfig && this.activeConfig.triggerChar === config.triggerChar) {
            this.activeConfig = config;
            // this.updateSearchList(false);
            this.updateSearchList();
        }
    };
    MentionDirective.prototype.setIframe = function (iframe) {
        this.iframe = iframe;
    };
    MentionDirective.prototype.stopEvent = function (event) {
        // if (event instanceof Event) { // does not work for iframe
        if (!event.wasClick) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    };
    MentionDirective.prototype.blurHandler = function (event) {
        if (this.disabledMention) {
            return;
        }
        this.stopEvent(event);
        this.stopSearch = true;
        if (this.searchList) {
            this.searchList.hidden = true;
        }
    };
    MentionDirective.prototype.getImeInputStatus = function (keyDownCode, keyUpCode, event) {
        if (this.isPcSafari) {
            if (event.isComposing) {
                return IME_INPUT_STATUS.INPUTTING;
            }
            else if (keyUpCode === KEY_ENTER) {
                return IME_INPUT_STATUS.FIXED;
            }
            return IME_INPUT_STATUS.NONE;
        }
        // [Caution ]On Android, Keycode value is return as 229 for all keys
        if (this.isAndroid) {
            return IME_INPUT_STATUS.NONE;
        }
        if (keyDownCode !== 229) {
            return IME_INPUT_STATUS.NONE;
        }
        return keyUpCode === KEY_ENTER ? IME_INPUT_STATUS.FIXED : IME_INPUT_STATUS.INPUTTING;
    };
    MentionDirective.prototype.inputHandler = function (event, nativeElement) {
        if (nativeElement === void 0) { nativeElement = this._element.nativeElement; }
        if (event.inputType === 'insertText' && event.isComposing === false) {
            var keyCode = event.data.charCodeAt(0);
            this.keyHandler({ keyCode: keyCode, inputEvent: true }, nativeElement);
        }
    };
    MentionDirective.prototype.compositionendHandler = function (event, nativeElement) {
        if (nativeElement === void 0) { nativeElement = this._element.nativeElement; }
        if (event.data) {
            var keyCode = event.data.charCodeAt(0);
            this.keyHandler({ keyCode: keyCode, inputEvent: true }, nativeElement);
        }
    };
    MentionDirective.prototype.onKeyDown = function (event, nativeElement) {
        if (nativeElement === void 0) { nativeElement = this._element.nativeElement; }
        if (this.disabledMention) {
            return;
        }
        this.keyDownCode = event.which || event.keyCode;
        // Enter key on Windows
        var isComposing = event.isComposing;
        if (event.key === 'Process') {
            isComposing = false;
        }
        if (this.isPcSafari && !isComposing) {
            this.isKeyHandlerDone = true;
            this.keyHandler(event, nativeElement, isComposing);
        }
        else if ((this.keyDownCode !== 229 || event.key === 'Process') || this.isAndroid) {
            this.isKeyHandlerDone = true;
            this.keyHandler(event, nativeElement, isComposing);
        }
    };
    MentionDirective.prototype.onKeyUp = function (event, nativeElement) {
        if (nativeElement === void 0) { nativeElement = this._element.nativeElement; }
        if (this.disabledMention) {
            return;
        }
        if (this.isKeyHandlerDone) {
            this.isKeyHandlerDone = false;
            return;
        }
        if (event.isComposing && this.isPcSafari && this.uaService.isPcDevice()) {
            this.isKeyHandlerDone = false;
            return;
        }
        var charCode = event.which || event.keyCode;
        var isComposing = event.isComposing;
        var imeInputStatus = this.getImeInputStatus(this.keyDownCode, charCode, event);
        if (imeInputStatus === IME_INPUT_STATUS.FIXED || event.shiftKey || this.isPcSafari) {
            this.keyHandler(event, nativeElement, isComposing);
        }
        this.isKeyHandlerDone = false;
    };
    MentionDirective.prototype.keyHandler = function (event, nativeElement, isComposing) {
        if (nativeElement === void 0) { nativeElement = this._element.nativeElement; }
        if (isComposing === void 0) { isComposing = false; }
        if (event.isComposing || event.keyCode === KEY_BUFFERED) {
            return;
        }
        var charCode = event.which || event.keyCode;
        // Fix bug: getValue gets all content but originally it is right to get only current row value except html
        var val = mention_utils_1.getElValueExcludeHtml(nativeElement, this.iframe);
        var pos = mention_utils_1.getCaretPosition(nativeElement, this.iframe);
        var charPressed = event.key;
        if (!charPressed) {
            if (!event.shiftKey && (charCode >= 65 && charCode <= 90)) {
                charPressed = String.fromCharCode(charCode + 32);
            }
            else {
                // TODO (dmacfarlane) fix this for non-alpha keys
                // http://stackoverflow.com/questions/2220196/how-to-decode-character-pressed-from-jquerys-keydowns-event-handler?lq=1
                charPressed = String.fromCharCode(charCode);
            }
        }
        if (charCode === KEY_ENTER && event.wasClick && pos < this.startPos) {
            // put caret back in position prior to contenteditable menu click
            pos = this.startNode.length;
            mention_utils_1.setCaretPosition(this.startNode, pos, this.iframe);
        }
        var config = this.triggerChars[charPressed];
        if (config) {
            this.activeConfig = config;
            // this.startPos = event.inputEvent ? pos - 1 : pos;
            this.startPos = pos;
            var tmpChara = val.substring(this.startPos - 1, this.startPos);
            if (tmpChara.length > 0) {
                if (tmpChara === charPressed) {
                    this.startPos--;
                }
            }
            else {
                tmpChara = val.substring(this.startPos + 1, this.startPos + 2);
                if (tmpChara === charPressed) {
                    this.startPos++;
                }
            }
            if (this.startPos < 0) {
                this.startPos = 0;
            }
            this.startNode = (this.iframe ? this.iframe.contentWindow.getSelection() : window.getSelection()).anchorNode;
            this.stopSearch = false;
            this.searchString = null;
            this.showSearchList(nativeElement);
            // this.updateSearchList();
        }
        else if (this.startPos >= 0 && !this.stopSearch) {
            if (pos <= this.startPos) {
                this.searchList.hidden = true;
            }
            else if (charCode !== KEY_SHIFT &&
                !event.metaKey &&
                !event.altKey &&
                !event.ctrlKey &&
                pos > this.startPos) {
                if (charCode === KEY_SPACE) {
                    this.startPos = -1;
                }
                else if (charCode === KEY_BACKSPACE && pos > 0) {
                    pos--;
                    if (pos === this.startPos) {
                        this.stopSearch = true;
                    }
                    this.searchList.hidden = this.stopSearch;
                }
                else if (!this.searchList.hidden) {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopEvent(event);
                        this.searchList.hidden = true;
                        // [Goalous Fix] original fix to support to insert mention html when selected mention item
                        // value is inserted without a trailing space for consistency
                        // between element types (div and iframe do not preserve the space)
                        // insertValue(nativeElement, this.startPos, pos,
                        //   this.activeConfig.mentionSelect(this.searchList.activeItem), this.iframe);
                        // If Android, last input character remain, so should substr include margin character.
                        // this.insertHtml(this.activeConfig.mentionSelect(this.searchList.activeItem), this.startPos, pos);
                        // document.execCommand('insertHTML', false, '&nbsp;');
                        var text = this.activeConfig.mentionSelect(this.searchList.activeItem);
                        mention_utils_1.insertValue(nativeElement, this.startPos, pos, text, this.iframe);
                        this.selectedMention.emit(this.searchList.activeItem);
                        // fire input event so angular bindings are updated
                        if ("createEvent" in document) {
                            var evt = document.createEvent("HTMLEvents");
                            if (this.iframe) {
                                // a 'change' event is required to trigger tinymce updates
                                evt.initEvent("change", true, false);
                            }
                            else {
                                evt.initEvent("input", true, false);
                            }
                            // this seems backwards, but fire the event from this elements nativeElement (not the
                            // one provided that may be in an iframe, as it won't be propogate)
                            this._element.nativeElement.dispatchEvent(evt);
                        }
                        // Reset items
                        this.resetSearchList();
                        // [Goalous Fix] Comment out becuase this cause web page crash
                        // fire input event so angular bindings are updated
                        // if ('createEvent' in document) {
                        //   const evt = document.createEvent('HTMLEvents');
                        //   evt.initEvent('input', false, true);
                        //
                        //   nativeElement.dispatchEvent(evt);
                        // }
                        this.startPos = -1;
                        return false;
                    }
                    else if (charCode === KEY_ESCAPE) {
                        this.stopEvent(event);
                        this.searchList.hidden = true;
                        this.stopSearch = true;
                        return false;
                    }
                    else if (charCode === KEY_DOWN) {
                        this.stopEvent(event);
                        this.searchList.activateNextItem();
                        return false;
                    }
                    else if (charCode === KEY_UP) {
                        this.stopEvent(event);
                        this.searchList.activatePreviousItem();
                        return false;
                    }
                }
                if (charPressed.length !== 1 && event.keyCode !== KEY_BACKSPACE) {
                    this.stopEvent(event);
                    return false;
                }
                else if (!this.stopSearch) {
                    var mention = val.substring(this.startPos + 1, pos);
                    if (event.keyCode !== KEY_BACKSPACE && !event.inputEvent) {
                        mention += charPressed;
                    }
                    if (mention.length > 0) {
                        this.searchString = mention;
                        this.searchTerm.emit(this.activeConfig.triggerChar + this.searchString);
                        this.updateSearchList();
                    }
                    else {
                        this.searchList.items = [];
                    }
                }
            }
        }
    };
    MentionDirective.prototype.insertHtml = function (html, startPos, endPos) {
        var range = void 0, sel = void 0;
        sel = window.getSelection();
        range = document.createRange();
        range.setStart(sel.anchorNode, startPos);
        range.setEnd(sel.anchorNode, endPos);
        range.deleteContents();
        var el = document.createElement('div');
        el.innerHTML = html;
        var frag = document.createDocumentFragment();
        var node = void 0, lastNode = void 0;
        while (node = el.firstChild) {
            lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        // Preserve the selection
        if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };
    MentionDirective.prototype.resetSearchList = function () {
        if (this.activeConfig) {
            this.stopSearch = true;
            this.activeConfig.items = [];
            this.searchList.items = [];
            this.searchList.hidden = true;
        }
    };
    MentionDirective.prototype.updateSearchList = function (changeSearchListHidden) {
        if (changeSearchListHidden === void 0) { changeSearchListHidden = true; }
        var matches = [];
        if (this.activeConfig && this.activeConfig.items) {
            // let objects = this.activeConfig.items;
            // disabling the search relies on the async operation to do the filtering
            // if (!this.disableSearch && this.searchString) {
            //   const searchStringLowerCase = this.searchString.toLowerCase();
            //   objects = objects.filter(e => e[this.activeConfig.labelKey].toLowerCase().startsWith(searchStringLowerCase));
            // }
            matches = this.activeConfig.items;
            if (this.activeConfig.maxItems > 0) {
                matches = matches.slice(0, this.activeConfig.maxItems);
            }
        }
        // update the search list
        if (this.searchList) {
            this.searchList.labelKey = this.activeConfig.labelKey;
            this.searchList.items = matches;
            if (changeSearchListHidden) {
                this.searchList.hidden = matches.length === 0;
            }
        }
    };
    MentionDirective.prototype.appendComponentToBody = function () {
        var componentRef = this._componentResolver
            .resolveComponentFactory(mention_list_component_1.MentionListComponent)
            .create(this.injector);
        this.appRef.attachView(componentRef.hostView);
        var domElem = componentRef.hostView
            .rootNodes[0];
        // Append to body or wherever you want
        document.body.appendChild(domElem);
        return componentRef;
    };
    MentionDirective.prototype.showSearchList = function (nativeElement) {
        var _this = this;
        if (this.searchList == null) {
            var componentRef = this.appendComponentToBody();
            this.searchList = componentRef.instance;
            this.searchList.position(nativeElement, this.iframe, this.activeConfig.dropUp);
            this.searchList.itemTemplate = this.mentionListTemplate;
            componentRef.instance['itemClick'].subscribe(function () {
                nativeElement.focus();
                var fakeKeydown = { 'keyCode': KEY_ENTER, 'wasClick': true };
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
    __decorate([
        core_2.Input(),
        __metadata("design:type", Object)
    ], MentionDirective.prototype, "disabledMention", void 0);
    __decorate([
        core_2.Input('mention'),
        __metadata("design:type", Array),
        __metadata("design:paramtypes", [Array])
    ], MentionDirective.prototype, "mention", null);
    __decorate([
        core_2.Input(),
        __metadata("design:type", Object)
    ], MentionDirective.prototype, "mentionConfig", void 0);
    __decorate([
        core_2.Input(),
        __metadata("design:type", core_1.TemplateRef)
    ], MentionDirective.prototype, "mentionListTemplate", void 0);
    __decorate([
        core_2.Output(),
        __metadata("design:type", Object)
    ], MentionDirective.prototype, "searchTerm", void 0);
    __decorate([
        core_2.Output(),
        __metadata("design:type", Object)
    ], MentionDirective.prototype, "selectedMention", void 0);
    MentionDirective = __decorate([
        core_1.Directive({
            selector: '[mention], [mentionConfig]',
            host: {
                '(keydown)': 'keyHandler($event)',
                '(input)': 'inputHandler($event)',
                '(compositionend)': 'compositionendHandler($event)',
                '(blur)': 'blurHandler($event)',
                'autocomplete': 'off'
            }
        }),
        __metadata("design:paramtypes", [core_1.ElementRef,
            core_1.ComponentFactoryResolver,
            core_1.ViewContainerRef,
            core_1.ApplicationRef,
            core_1.Injector,
            user_agent_service_1.UserAgentService])
    ], MentionDirective);
    return MentionDirective;
}());
exports.MentionDirective = MentionDirective;
