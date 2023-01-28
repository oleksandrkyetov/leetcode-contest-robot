const {By, until} = require('selenium-webdriver');

class Contest {

  driverWaitTimeout = 5000;

  url = 'https://leetcode.com';

  constructor(driver) {
    this.driver = driver;
  }

  _getUrl(url) {
    return this.driver.getCurrentUrl()
      .then(currentUrl => (currentUrl === url) ? {} : this.driver.get(url));
  }

  getDetails(contest) {
    return this._getUrl(`${this.url}/contest/${contest}/`)
      .then(() => this.driver.wait(until.elementsLocated(By.css('.contest-question-list .list-group-item a')), this.driverWaitTimeout))
      .then(linkElements => Promise.all([
        Promise.all(linkElements.map(linkElement => linkElement.getText())),
        Promise.all(linkElements.map(linkElement => linkElement.getAttribute('href').then(url => `${url}/`))),
      ]))
      .then(([titles, urls]) => titles.map((title, i) => ({title, url: urls[i]})));
  }
}

module.exports = Contest;
