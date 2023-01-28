const {By, until} = require('selenium-webdriver');

class Leetcode {

  driverWaitTimeout = 5000;

  url = 'https://leetcode.com';

  constructor(driver) {
    this.driver = driver;
  }

  _signIn(username, password) {
    return this.driver.get(`${this.url}/accounts/login/`)
      .then(() => this.driver.wait(until.elementLocated(By.css('#initial-loading')), this.driverWaitTimeout))
      .then(initialLoadingElement => this.driver.wait(until.stalenessOf(initialLoadingElement), this.driverWaitTimeout * 3))
      .then(() => Promise.all([
        this.driver.wait(until.elementLocated(By.css('#id_login')), this.driverWaitTimeout),
        this.driver.wait(until.elementLocated(By.css('#id_password')), this.driverWaitTimeout),
      ]))
      .then(([usernameElement, passwordElement]) => Promise.all([
        usernameElement.clear().then(() => usernameElement.sendKeys(username)),
        passwordElement.clear().then(() => passwordElement.sendKeys(password)),
      ]))
      .then(() => this.driver.wait(until.elementLocated(By.css('#signin_btn')), this.driverWaitTimeout))
      .then(buttonElement => buttonElement.click());
  }

  open(username, password) {
    return this.driver.get(this.url)
      .then(() => this.driver.wait(until.elementLocated(By.css('a[href="/accounts/login/"]')), this.driverWaitTimeout).then(() => true).catch(() => false))
      .then(isRequireSignIn => isRequireSignIn ? this._signIn(username, password) : {})
      .then(() => this.driver.wait(until.elementLocated(By.css('#navbar-right-container .ant-dropdown-link')), this.driverWaitTimeout));
  }
}

module.exports = Leetcode;
