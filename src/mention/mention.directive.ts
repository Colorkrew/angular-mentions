import {
  Directive,
  ElementRef,
  ComponentFactoryResolver,
  ViewContainerRef,
  TemplateRef,
  ApplicationRef,
  Injector, EmbeddedViewRef, ComponentRef, HostListener
} from '@angular/core';
import { Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';

import { MentionConfig } from './mention-config';
import { MentionListComponent } from './mention-list.component';
import { getValue, insertValue, getCaretPosition, setCaretPosition } from './mention-utils';

const KEY_BACKSPACE = 8;
const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_SHIFT = 16;
const KEY_ESCAPE = 27;
const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_2 = 50;

const IME_INPUT_STATUS = Object.freeze({
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
@Directive({
  selector: '[mention], [mentionConfig]',
})
export class MentionDirective implements OnChanges {

  // @Input()
  // onNext: (searchKeyword: string) => any;

  // stores the items passed to the mentions directive and used to populate the root items in mentionConfig
  private mentionItems: any[];

  @Input('mention') set mention(items: any[]) {
    this.mentionItems = items;

  }

  // the provided configuration object
  @Input() mentionConfig: MentionConfig = {items: []};

  private activeConfig: MentionConfig; // = this.DEFAULT_CONFIG;

  private DEFAULT_CONFIG: MentionConfig = {
    items: [],
    triggerChar: '@',
    labelKey: 'label',
    maxItems: -1,
    mentionSelect: (item: any) => this.activeConfig.triggerChar + item[this.activeConfig.labelKey]
  };

  // template to use for rendering list items
  @Input() mentionListTemplate: TemplateRef<any>;

  // event emitted whenever the search term changes
  @Output() searchTerm = new EventEmitter();

  // event emitted when selected item on mention search list
  @Output() selectedMention = new EventEmitter();

  // option to diable internal filtering. can be used to show the full list returned
  // from an async operation (or allows a custom filter function to be used - in future)
  private disableSearch = false;

  private triggerChars: {[key: string]: MentionConfig} = {};

  searchString = '';
  startPos: number;
  startNode;
  searchList: MentionListComponent;
  stopSearch: boolean;
  iframe: any; // optional
  keyDownCode: number;

  constructor(
    private _element: ElementRef,
    private _componentResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    // console.log('config change', changes);
    if (changes['mention'] || changes['mentionConfig']) {
      this.updateConfig();
    }
  }

  private updateConfig() {
    const config = this.mentionConfig;
    this.triggerChars = {};
    // use items from directive if they have been set
    if (this.mentionItems) {
      config.items = this.mentionItems;
    }
    this.addConfig(config);
    // nested configs
    if (config.mentions) {
      config.mentions.forEach(config => this.addConfig(config));
    }
  }

  // add configuration for a trigger char
  private addConfig(config: MentionConfig) {
    // defaults
    const defaults = Object.assign({}, this.DEFAULT_CONFIG);
    config = Object.assign(defaults, config);
    // items
    let items = config.items;
    if (items && items.length > 0) {
      // convert strings to objects
      if (typeof items[0] === 'string') {
        items = items.map((label) => {
          const object = {};
          object[config.labelKey] = label;
          return object;
        });
      }
      // remove items without an labelKey (as it's required to filter the list)
      items = items.filter(e => e[config.labelKey]);
      if (!config.disableSort) {
        items.sort((a, b) => a[config.labelKey].localeCompare(b[config.labelKey]));
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
  }

  setIframe(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }

  stopEvent(event: any) {
    // if (event instanceof Event) { // does not work for iframe
    if (!event.wasClick) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }

  @HostListener('blur', ['$event'])
  blurHandler(event: any) {
    this.stopEvent(event);
    this.stopSearch = true;
    if (this.searchList) {
      this.searchList.hidden = true;
    }
  }

  getImeInputStatus(keyDownCode: number, keyUpCode: number) {
    if (keyDownCode !== 229) {
      return IME_INPUT_STATUS.NONE;
    }
    return keyUpCode === KEY_ENTER ? IME_INPUT_STATUS.FIXED : IME_INPUT_STATUS.INPUTTING;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: any, nativeElement: HTMLInputElement = this._element.nativeElement) {
    this.keyDownCode = event.which || event.keyCode;
    if (this.keyDownCode !== 229) {
      this.keyHandler(event, nativeElement);
    }
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event: any, nativeElement: HTMLInputElement = this._element.nativeElement) {
    const charCode = event.which || event.keyCode;
    const imeInputStatus = this.getImeInputStatus(this.keyDownCode, charCode);
    if (imeInputStatus === IME_INPUT_STATUS.FIXED) {
      this.keyHandler(event, nativeElement);
    }
  }

  keyHandler(event: any, nativeElement: HTMLInputElement, ) {
    const charCode = event.which || event.keyCode;
    const imeInputStatus = this.getImeInputStatus(this.keyDownCode, charCode);
    console.log({imeInputStatus});
    // During IME input
    const val: string = getValue(nativeElement);
    let pos = getCaretPosition(nativeElement, this.iframe);
    let charPressed = event.key;
    if (!charPressed) {
      if (!event.shiftKey && (charCode >= 65 && charCode <= 90)) {
        charPressed = String.fromCharCode(charCode + 32);
      }
      // else if (event.shiftKey && charCode === KEY_2) {
      //   charPressed = this.config.triggerChar;
      // }
      else {
        // TODO (dmacfarlane) fix this for non-alpha keys
        // http://stackoverflow.com/questions/2220196/how-to-decode-character-pressed-from-jquerys-keydowns-event-handler?lq=1
        charPressed = String.fromCharCode(charCode);
      }
    }
    if (event.keyCode == KEY_ENTER && event.wasClick && pos < this.startPos) {
      // put caret back in position prior to contenteditable menu click
      pos = this.startNode.length;
      setCaretPosition(this.startNode, pos, this.iframe);
    }
    //console.log("keyHandler", this.startPos, pos, val, charPressed, event);

    const config = this.triggerChars[charPressed];
    if (config) {
      this.activeConfig = config;
      this.startPos = pos;
      this.startNode = (this.iframe ? this.iframe.contentWindow.getSelection() : window.getSelection()).anchorNode;
      this.stopSearch = false;
      this.searchString = '';
      this.showSearchList(nativeElement);
      // Comment outt prevent to show search list when just input triggerChara
      // this.updateSearchList();
      // this.activeConfig.items = [];
    }
    else if (this.startPos >= 0 && !this.stopSearch) {
      if (pos <= this.startPos) {
        this.searchList.hidden = true;
      }
      // ignore shift when pressed alone, but not when used with another key
      else if (event.keyCode !== KEY_SHIFT &&
        !event.metaKey &&
        !event.altKey &&
        !event.ctrlKey &&
        pos > this.startPos
      ) {
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
          if (event.keyCode === KEY_TAB || (event.keyCode === KEY_ENTER && imeInputStatus === IME_INPUT_STATUS.NONE)) {
            this.stopEvent(event);
            this.searchList.hidden = true;
            // value is inserted without a trailing space for consistency
            // between element types (div and iframe do not preserve the space)
            insertValue(nativeElement, this.startPos, pos,
              this.activeConfig.mentionSelect(this.searchList.activeItem), this.iframe);
            document.execCommand('insertText', false, ' ');
            this.selectedMention.emit(this.searchList.activeItem);

            // Reset items
            this.activeConfig.items = [];
            this.searchList.items = [];

            // fire input event so angular bindings are updated
            if ('createEvent' in document) {
              const evt = document.createEvent('HTMLEvents');
              evt.initEvent('input', false, true);
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
          let mention = val.substring(this.startPos + 1, pos);
          // console.log({mention, charPressed});
          if (event.keyCode !== KEY_BACKSPACE && imeInputStatus === IME_INPUT_STATUS.NONE) {
            mention += charPressed;
          }
          this.searchString = mention;
          this.searchTerm.emit(this.searchString);
          this.updateSearchList();
        }
      }
    }
  }

  updateSearchList(changeSearchListHidden = true) {
    let matches: any[] = [];
    // console.log('updateSearchList');
    if (this.activeConfig && this.activeConfig.items) {
      // console.log(this.activeConfig.items);
      //   let objects = this.activeConfig.items;
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
  }
  appendComponentToBody(): ComponentRef<MentionListComponent> {
    const componentRef = this._componentResolver
      .resolveComponentFactory(MentionListComponent)
      .create(this.injector);
    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    // Append to body or wherever you want
    document.body.appendChild(domElem);
    return componentRef;
  }
  showSearchList(nativeElement: HTMLInputElement) {
    if (this.searchList == null) {
      const componentRef = this.appendComponentToBody();
      this.searchList = componentRef.instance;
      this.searchList.position(nativeElement, this.iframe, this.activeConfig.dropUp);
      this.searchList.itemTemplate = this.mentionListTemplate;
      componentRef.instance['itemClick'].subscribe(() => {
        nativeElement.focus();
        const fakeKeydown = {'keyCode': KEY_ENTER, 'wasClick': true};
        this.keyHandler(fakeKeydown, nativeElement);
      });
    }
    else {
      this.searchList.labelKey = this.activeConfig.labelKey;
      this.searchList.activeIndex = 0;
      this.searchList.position(nativeElement, this.iframe, this.activeConfig.dropUp);
      window.setTimeout(() => this.searchList.resetScroll());
    }
  }
}
