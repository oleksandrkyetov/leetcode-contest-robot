const os = require('os');
const fs = require('fs');

const cryptoJs = require('crypto-js');

const express = require('express');

const selenium = require('selenium-webdriver');
const seleniumChrome = require('selenium-webdriver/chrome');

const secret = fs.readFileSync(`${os.homedir()}/.secret`).toString();

const Leetcode = require('./leetcode/leetcode');
const Contest = require('./leetcode/contest');
const Task = require('./leetcode/task');

const res500 = (res, error) => {
  console.log(error);
  res.status(500).json({message: error.message});
}

const options = new seleniumChrome.Options().addExtensions(`${__dirname}/../extension/chrome-extension-blur.crx`);
const driverBuilder = new selenium.Builder().forBrowser(selenium.Browser.CHROME).setChromeOptions(options);

Promise.resolve(driverBuilder.build())
  .then(driver => {
    const app = express();
    const port = 3000;

    const requestTimeout = 1000;

    app.use(express.text(), express.json());
    app.use(express.urlencoded({extended: true}));

    app.post('/leetcode', (req, res) => {
      const password = cryptoJs.AES.decrypt(req.body.password, secret).toString(cryptoJs.enc.Utf8);
      const username = cryptoJs.AES.decrypt(req.body.username, secret).toString(cryptoJs.enc.Utf8);

      setTimeout(() => {
        new Leetcode(driver).open(username, password)
          .then(() => res.json({}))
          .catch(error => res500(res, error));
      }, requestTimeout);
    });

    /**
     * Get contest details (titles and urls of tasks from the contest)
     * Expect that user is logged when calling this endpoint
     */
    app.get('/leetcode/:contest', (req, res) => {
      const contest = req.params.contest;

      setTimeout(() => {
        new Contest(driver).getDetails(contest)
          .then(contestDetails => res.json(contestDetails))
          .catch(error => res500(res, error));
      }, requestTimeout);
    });

    /**
     * Get task details (title, description and code of the task)
     * Expect that user is logged when calling this endpoint
     */
    app.get('/leetcode/:contest/task', (req, res) => {
      const url = req.query.url;
      const language = req.query.language;

      setTimeout(() => {
        new Task(driver).getDetails(url, language)
          .then(taskDetails => res.json(taskDetails))
          .catch(error => res500(res, error));
      }, requestTimeout);
    });

    /**
     * Post solution and get task details (title, description and code of the task)
     * Expect that user is logged when calling this endpoint
     */
    app.post('/leetcode/:contest/task', (req, res) => {
      const url = req.query.url;
      const language = req.query.language;

      const solution = req.body.solution;

      setTimeout(() => {
        new Task(driver).setDetails(url, language, solution)
          .then(taskDetails => res.json(taskDetails))
          .catch(error => res500(res, error));
      }, requestTimeout);
    });

    app.listen(port, () => {
      console.log(`${process.env.npm_package_description} is listening at http://localhost:${port}`);
    });
  });
