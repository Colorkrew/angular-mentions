import { Ng2MentionsPage } from './app.po';

describe('ng2-mentions App', function() {
  var EC = protractor.ExpectedConditions;
  let page: Ng2MentionsPage;

  beforeEach(() => {
    page = new Ng2MentionsPage();
  })

  it('two mentions text field', () => {
    page.navigateTo();
    expect(page.getHeadingText()).toEqual('Angular 2 Mentions');
    let el = element(by.css('input'));
    testTwoMentions(el);
  });

  it('two mentions text area', () => {
    page.navigateTo();
    expect(page.getHeadingText()).toEqual('Angular 2 Mentions');
    let el = element.all(by.css('textarea')).first();
    testTwoMentions(el);
  });

  it('two mentions div', () => {
    page.navigateTo();
    expect(page.getHeadingText()).toEqual('Angular 2 Mentions');
    let el = element.all(by.css('div')).first();
    testTwoMentions(el);
  });

  it('two mentions iframe', () => {
    page.navigateTo();
    expect(page.getHeadingText()).toEqual('Angular 2 Mentions');
    let el = element.all(by.id('tmce_ifr'));
    testTwoMentions(el);
  });

  function testTwoMentions(el){
    el.getTagName().then(function(tagName){
      let menu = element(by.css('.dropdown-menu'));      
      el.click();
            
      // popup menu
      el.sendKeys('Hello @');
      browser.sleep(500);
      //browser.wait(EC.textToBePresentInElementValue(el, 'Hello @'), 1000);
      expect(menu.isDisplayed()).toBe(true);
      expect(getValue(el, tagName)).toEqual('Hello @');
            
      // select menion
      el.sendKeys(protractor.Key.ARROW_DOWN, protractor.Key.ENTER);
      browser.sleep(500);
      expect(menu.isDisplayed()).toBe(false);
      expect(getValue(el, tagName)).toEqual('Hello @Aaron ');
      
      // select another mention
      el.sendKeys('and @gav', protractor.Key.ENTER);
      browser.sleep(500);
      expect(menu.isDisplayed()).toBe(false);
      expect(getValue(el, tagName)).toEqual('Hello @Aaron and @Gavin ');
      
      // start another mention
      el.sendKeys('and @e');
      browser.sleep(500);
      expect(menu.isDisplayed()).toBe(true);
      expect(getValue(el, tagName)).toEqual('Hello @Aaron and @Gavin and @e');
      
      // but press escape instead
      el.sendKeys(protractor.Key.ESCAPE);
      browser.sleep(500);
      expect(menu.isDisplayed()).toBe(false);
      expect(getValue(el, tagName)).toEqual('Hello @Aaron and @Gavin and @e');
      
      // remove the escaped entry
      el.sendKeys('!!', protractor.Key.ARROW_LEFT, protractor.Key.ARROW_LEFT);
      el.sendKeys(protractor.Key.BACK_SPACE, protractor.Key.BACK_SPACE);
      browser.sleep(500);
      expect(getValue(el, tagName)).toEqual('Hello @Aaron and @Gavin and !!');
      
      // and insert another mention
      el.sendKeys('@he', protractor.Key.ENTER, protractor.Key.BACK_SPACE);
      browser.sleep(500);
      expect(menu.isDisplayed()).toBe(false);
      expect(getValue(el, tagName)).toEqual('Hello @Aaron and @Gavin and @Henry!!');
    });  
  }
  
  function getValue(el, tagName) {
    if (tagName=="input" || tagName=="textarea") {    
      return el.getAttribute('value');
    }
    else if (tagName.length>0 && tagName[0]=='iframe') {
      return browser.switchTo().frame('tmce_ifr').then( () => {
        let el = browser.driver.findElement(by.id('tinymce'));
        let text = el.getText();
        browser.switchTo().defaultContent();
        browser.waitForAngular();
        return text;
      });              
    }
    else {
      return el.getText();
    }    
  }
});
