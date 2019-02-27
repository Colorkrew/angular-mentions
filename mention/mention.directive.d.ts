import { ElementRef, ComponentFactoryResolver, ViewContainerRef, TemplateRef, ApplicationRef, Injector, ComponentRef } from '@angular/core';
import { EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MentionConfig } from './mention-config';
import { MentionListComponent } from './mention-list.component';
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
    constructor(_element: ElementRef, _componentResolver: ComponentFactoryResolver, _viewContainerRef: ViewContainerRef, appRef: ApplicationRef, injector: Injector);
    ngOnChanges(changes: SimpleChanges): void;
    private updateConfig;
    private addConfig;
    setIframe(iframe: HTMLIFrameElement): void;
    stopEvent(event: any): void;
    blurHandler(event: any): void;
    getImeInputStatus(keyDownCode: number, keyUpCode: number): number;
    onKeyDown(event: any, nativeElement?: HTMLInputElement): void;
    onKeyUp(event: any, nativeElement?: HTMLInputElement): void;
    keyHandler(event: any, nativeElement: HTMLInputElement): boolean;
    resetSearchList(): void;
    updateSearchList(changeSearchListHidden?: boolean): void;
    appendComponentToBody(): ComponentRef<MentionListComponent>;
    showSearchList(nativeElement: HTMLInputElement): void;
}
