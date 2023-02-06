const os = require('os');

const {By, until, Key} = require('selenium-webdriver');

const DescriptionFormatter = require('./formatter/DescriptionFormatter');
const SolutionFormatter = require('./formatter/SolutionFormatter');

class Task {

  driverWaitTimeout = 5000;

  languageOptions = {
    'cpp': 'C++',
    'java': 'Java',
    'python2': 'Python',
    'python3': 'Python3',
    'c': 'C',
    'csharp': 'C#',
    'javascript': 'JavaScript',
    'ruby': 'Ruby',
    'swift': 'Swift',
    'go': 'Go',
    'scala': 'Scala',
    'kotlin': 'Kotlin',
    'rust': 'Rust',
    'php': 'PHP',
    'typescript': 'TypeScript',
    'dart': 'Dart',
  }

  constructor(driver) {
    this.driver = driver;
  }

  _getUrl(url) {
    return this.driver.getCurrentUrl()
      .then(currentUrl => (currentUrl === url) ? {} : this.driver.get(url));
  }

  _getTitle() {
    return this.driver.wait(until.elementLocated(By.css('.question-title > h3 > span')), this.driverWaitTimeout)
      .then(titleElement => titleElement.getText());
  }

  _getDescription() {
    return this.driver.wait(until.elementLocated(By.css('.question-content.default-content')), this.driverWaitTimeout)
      .then(descriptionElement => descriptionElement.getAttribute('innerHTML'))
      .then(description => new DescriptionFormatter(description).format());
  }

  _getCode() {
    return this.driver.wait(until.elementLocated(By.css('.CodeMirror')), this.driverWaitTimeout)
      .then(() => this.driver.executeScript('return document.querySelector(".CodeMirror").CodeMirror.getValue()'));
  }

  _resetEditor(language) {
    return this.driver.wait(until.elementLocated(By.css('.Select')), this.driverWaitTimeout)
      .then(selectElement => selectElement.click())
      .then(() => this.driver.wait(until.elementLocated(By.css('.Select-menu')), this.driverWaitTimeout))
      .then(selectMenuElement => selectMenuElement.findElement(By.css(`.Select-option[aria-label="${this.languageOptions[language]}"]`)))
      .then(selectMenuOptionElement => selectMenuOptionElement.click());
      // TODO Do we need to reset editor code? Not at this time ...
      // .then(() => this.driver.wait(until.elementLocated(By.css('.editor-btn.reset-btn')), this.driverWaitTimeout))
      // .then(resetButton => resetButton.click())
      // .then(() => this.driver.wait(until.elementLocated(By.css('.rc-dialog-content .modal-footer .btn-primary')), this.driverWaitTimeout))
      // .then(resetAcceptButton => resetAcceptButton.click());
  }

  _setSolution(codeMirrorTextareaElement, lines) {
    const generateTypeTimeout = (min = 25, max = 75) => Math.floor(Math.random() * (max - min + 1) + min);

    const typeLine = (codeMirrorTextareaElement, line, i = 0) => {
      return new Promise((resolve, _reject) => {
        if (i < line.length) {
          setTimeout(() => {
            resolve(codeMirrorTextareaElement.sendKeys(line[i]).then(() => typeLine(codeMirrorTextareaElement, line, i + 1)));
          }, generateTypeTimeout());
        } else {
          if (line.endsWith('{')) {
            resolve(codeMirrorTextareaElement.sendKeys(Key.DELETE));
          } else {
            resolve();
          }
        }
      });
    }

    const typeLines = (codeMirrorTextareaElement, lines, i = 0) => {
      return new Promise((resolve, _reject) => {
        if (i < lines.length) {
          setTimeout(() => {
            resolve(typeLine(codeMirrorTextareaElement, lines[i])
              .then(() => codeMirrorTextareaElement.sendKeys(Key.RETURN))
              .then(() => typeLines(codeMirrorTextareaElement, lines, i + 1)));
          }, generateTypeTimeout());
        } else {
          resolve();
        }
      });
    }

    const osTypeKeys = {
      'Linux': Key.CONTROL,
      'Darwin': Key.COMMAND,
      'Windows_NT': Key.CONTROL,
    }

    return codeMirrorTextareaElement.sendKeys(Key.chord(osTypeKeys[os.type()], 'a'), Key.DELETE)
      .then(() => typeLines(codeMirrorTextareaElement, lines));
  }

  getDetails(url, language) {
    return this._getUrl(url)
      .then(() => this._resetEditor(language))
      .then(() => Promise.all([this._getTitle(), this._getDescription(), this._getCode()]))
      .then(([title, description, code]) => ({title, description, code}));
  }

  setDetails(url, language, solution) {
    return this._getUrl(url)
      .then(() => this._resetEditor(language))
      .then(() => this.driver.wait(until.elementLocated(By.css('.CodeMirror')), this.driverWaitTimeout))
      .then(() => this.driver.wait(until.elementLocated(By.css('.CodeMirror .CodeMirror-line')), this.driverWaitTimeout))
      .then(codeMirrorLineElement => codeMirrorLineElement.click())
      .then(() => this.driver.wait(until.elementLocated(By.css('.CodeMirror textarea')), this.driverWaitTimeout))
      .then(codeMirrorTextareaElement => this._setSolution(codeMirrorTextareaElement, new SolutionFormatter(solution).lines()))
      .then(() => Promise.all([this._getTitle(), this._getDescription(), this._getCode()]))
      .then(([title, description, code]) => ({title, description, code}));
  }
}

module.exports = Task;
