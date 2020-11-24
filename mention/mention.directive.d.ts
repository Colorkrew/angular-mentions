import { ElementRef, ComponentFactoryResolver, ViewContainerRef, TemplateRef, ApplicationRef, Injector, ComponentRef } from '@angular/core';
import { EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MentionConfig } from './mention-config';
import { MentionListComponent } from './mention-list.component';
import { UserAgentService } from './user-agent.service';
/**
 * Angular 2 Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2017 Dan MacFarlane
 */
export declare class MentionDirective implements OnChanges {
    private _element;
    private _componentResolver;
    private _viewContainerRef;
    private appRef;
    private injector;
    private uaService;
    disabledMention: boolean;
    private mentionItems;
    mention: any[];
    mentionConfig: MentionConfig;
    private activeConfig;
    private DEFAULT_CONFIG;
    mentionListTemplate: TemplateRef<any>;
    searchTerm: EventEmitter<{}>;
    selectedMention: EventEmitter<{}>;
    private triggerChars;
    searchString: string;
    startPos: number;
    startNode: any;
    searchList: MentionListComponent;
    stopSearch: boolean;
    iframe: any;
    keyDownCode: number;
    isComposing: boolean;
    isAndroid: boolean;
    isFirefox: boolean;
    isPcSafari: boolean;
    inComposition: boolean;
    isKeyHandlerDone: boolean;
    isAttachedEventForRemoveMention: boolean;
    private lastKeyCode;
    constructor(_element: ElementRef, _componentResolver: ComponentFactoryResolver, _viewContainerRef: ViewContainerRef, appRef: ApplicationRef, injector: Injector, uaService: UserAgentService);
    addEventForRemoveMention(): void;
    ngOnChanges(changes: SimpleChanges): void;
    private updateConfig;
    private addConfig;
    setIframe(iframe: HTMLIFrameElement): void;
    stopEvent(event: any): void;
    blurHandler(event: any): void;
    getImeInputStatus(keyDownCode: number, keyUpCode: number, event: any): number;
    inputHandler(event: any, nativeElement?: HTMLInputElement): void;
    compositionendHandler(event: any, nativeElement?: HTMLInputElement): void;
    onKeyDown(event: any, nativeElement?: HTMLInputElement): void;
    onKeyUp(event: any, nativeElement?: HTMLInputElement): void;
    keyHandler(event: any, nativeElement?: HTMLInputElement, isComposing?: boolean): boolean;
    insertHtml(html: any, startPos: any, endPos: any): void;
    resetSearchList(): void;
    updateSearchList(changeSearchListHidden?: boolean): void;
    appendComponentToBody(): ComponentRef<MentionListComponent>;
    showSearchList(nativeElement: HTMLInputElement): void;
}
