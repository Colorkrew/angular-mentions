export declare enum Browser {
    IE = 0
}
export declare class UserAgentService {
    private mobileDetect;
    ua: string;
    browserType: any;
    constructor();
    judgeBrowser(): void;
    isMobileDevice(): boolean;
    isTabletDevice(): boolean;
    isPcDevice(): boolean;
    isBrowser(browser: Browser): boolean;
    isIOS(): boolean;
    isAndroid(): boolean;
}
