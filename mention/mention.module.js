"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var mention_directive_1 = require("./mention.directive");
var mention_list_component_1 = require("./mention-list.component");
require("hammerjs");
var user_agent_service_1 = require("./user-agent.service");
var MentionModule = /** @class */ (function () {
    function MentionModule() {
    }
    MentionModule_1 = MentionModule;
    MentionModule.forRoot = function () {
        return {
            ngModule: MentionModule_1
        };
    };
    var MentionModule_1;
    MentionModule = MentionModule_1 = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule
            ],
            exports: [
                mention_directive_1.MentionDirective,
                mention_list_component_1.MentionListComponent
            ],
            entryComponents: [
                mention_list_component_1.MentionListComponent
            ],
            declarations: [
                mention_directive_1.MentionDirective,
                mention_list_component_1.MentionListComponent
            ],
            providers: [user_agent_service_1.UserAgentService]
        })
    ], MentionModule);
    return MentionModule;
}());
exports.MentionModule = MentionModule;
