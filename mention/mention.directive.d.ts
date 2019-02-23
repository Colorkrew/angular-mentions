import { ElementRef, ComponentFactoryResolver, ViewContainerRef, TemplateRef } from "@angular/core";
import { EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { MentionConfig } from "./mention-config";
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
    private mentionItems;
    mention: any[];
    mentionConfig: MentionConfig;
    private activeConfig;
    private DEFAULT_CONFIG;
    mentionListTemplate: TemplateRef<any>;
    searchTerm: EventEmitter<{}>;
    private disableSearch;
    private triggerChars;
    searchString: string;
    startPos: number;
    startNode: any;
    searchList: MentionListComponent;
    stopSearch: boolean;
    iframe: any;
    constructor(_element: ElementRef, _componentResolver: ComponentFactoryResolver, _viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
    private updateConfig();
    private addConfig(config);
    setIframe(iframe: HTMLIFrameElement): void;
    stopEvent(event: any): void;
    blurHandler(event: any): void;
    keyHandler(event: any, nativeElement?: HTMLInputElement): boolean;
    updateSearchList(): void;
    showSearchList(nativeElement: HTMLInputElement): void;
}
