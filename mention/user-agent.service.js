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
var _a;
var MobileDetect = require("mobile-detect");
var browser_type_1 = require("./browser-type");
var core_1 = require("@angular/core");
var Browser;
(function (Browser) {
    Browser[Browser["IE"] = 0] = "IE";
})(Browser = exports.Browser || (exports.Browser = {}));
var userAgentMapping = (_a = {},
    _a[Browser.IE] = /trident\/7.0;.*rv:11/i,
    _a);
var UserAgentService = /** @class */ (function () {
    function UserAgentService() {
        this.ua = '';
        this.ua = window.navigator.userAgent;
        this.mobileDetect = new MobileDetect(this.ua);
        this.judgeBrowser();
    }
    UserAgentService.prototype.judgeBrowser = function () {
        if (this.ua.toLowerCase().indexOf('firefox') !== -1) {
            this.browserType = browser_type_1.BrowserType.FIREFOX;
            return;
        }
        if (this.ua.toLowerCase().indexOf('msie') !== -1 ||
            this.ua.toLowerCase().indexOf('trident') !== -1) {
            this.browserType = browser_type_1.BrowserType.IE;
            return;
        }
        if (this.ua.toLowerCase().indexOf('edge') !== -1) {
            this.browserType = browser_type_1.BrowserType.EDGE;
            return;
        }
        if (this.ua.toLowerCase().indexOf('chrome') !== -1) {
            this.browserType = browser_type_1.BrowserType.CHROME;
            return;
        }
        if (this.ua.toLowerCase().indexOf('safari') !== -1) {
            this.browserType = browser_type_1.BrowserType.SAFARI;
            return;
        }
        this.browserType = browser_type_1.BrowserType.OTHER;
    };
    UserAgentService.prototype.isMobileDevice = function () {
        return !!this.mobileDetect.mobile();
    };
    UserAgentService.prototype.isTabletDevice = function () {
        return !!this.mobileDetect.tablet();
    };
    UserAgentService.prototype.isPcDevice = function () {
        if (!!this.mobileDetect.mobile() || !!this.mobileDetect.tablet()) {
            return false;
        }
        return true;
    };
    UserAgentService.prototype.isBrowser = function (browser) {
        var regex = userAgentMapping[browser];
        if (!regex) {
            throw new Error("No definition for " + Browser[browser] + " found.");
        }
        return regex.test(this.ua);
    };
    UserAgentService.prototype.isIOS = function () {
        return 'iOS' === this.mobileDetect.os();
    };
    UserAgentService.prototype.isAndroid = function () {
        return 'AndroidOS' === this.mobileDetect.os();
    };
    UserAgentService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], UserAgentService);
    return UserAgentService;
}());
exports.UserAgentService = UserAgentService;
