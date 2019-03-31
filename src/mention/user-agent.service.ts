import * as MobileDetect from 'mobile-detect';
import { BrowserType } from './browser-type';
import { Injectable } from '@angular/core';

export enum Browser {
  IE
}

const userAgentMapping = {
  [Browser.IE]: /trident\/7.0;.*rv:11/i
};

@Injectable()
export class UserAgentService {
  private mobileDetect: MobileDetect;
  public ua = '';
  public browserType;
  constructor() {
    this.ua = window.navigator.userAgent;
    this.mobileDetect = new MobileDetect(this.ua);
    this.judgeBrowser();
  }

  judgeBrowser() {
    if (this.ua.toLowerCase().indexOf('firefox') !== -1) {
      this.browserType = BrowserType.FIREFOX;
      return;
    }
    if (this.ua.toLowerCase().indexOf('msie') !== -1 ||
      this.ua.toLowerCase().indexOf('trident') !== -1) {
      this.browserType = BrowserType.IE;
      return;
    }
    if (this.ua.toLowerCase().indexOf('edge') !== -1) {
      this.browserType = BrowserType.EDGE;
      return;
    }
    if (this.ua.toLowerCase().indexOf('chrome') !== -1) {
      this.browserType = BrowserType.CHROME;
      return;
    }
    if (this.ua.toLowerCase().indexOf('safari') !== -1) {
      this.browserType = BrowserType.SAFARI;
      return;
    }
    this.browserType = BrowserType.OTHER;
  }

  isMobileDevice() {
    return !!this.mobileDetect.mobile();
  }

  isTabletDevice() {
    return !!this.mobileDetect.tablet();
  }

  isPcDevice() {
    if (!!this.mobileDetect.mobile() || !!this.mobileDetect.tablet()) {
      return false;
    }
    return true;
  }

  isBrowser(browser: Browser) {
    const regex = userAgentMapping[browser];
    if (!regex) {
      throw new Error(`No definition for ${Browser[browser]} found.`);
    }
    return regex.test(this.ua);
  }

  isIOS() {
    return 'iOS' === this.mobileDetect.os();
  }

  isAndroid() {
    return 'AndroidOS' === this.mobileDetect.os();
  }
}
