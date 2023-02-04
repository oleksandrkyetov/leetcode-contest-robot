## Intro

Robot which solves [LeetCode Contest](https://leetcode.com/contest/) problems using [ChatGPT](https://openai.com/blog/chatgpt) and [Selenium WebDriver](https://www.selenium.dev/documentation/webdriver/).

## Usage

Sign up for a [LeetCode](https://leetcode.com/) and set `LEETCODE_USERNAME` and `LEETCODE_PASSWORD` env variables.

Sign up for an [OpenAI API key](https://platform.openai.com/overview) and set `OPENAI_API_KEY` env variable.

NOTE: For the complete list of env variables see `.leetcode-js-client/.env.sample`.

Run [Selenium WebDriver JS Server](https://github.com/oleksandrkyetov/leetcode-contest-robot/tree/main/selenium-webdriver-js-server):
```shell
cd selenium-webdriver-js-server
yarn install
yarn start
```

Run [Leetcode JS Client](https://github.com/oleksandrkyetov/leetcode-contest-robot/tree/main/leetcode-js-client):
```shell
cd leetcode-js-client
yarn install
yarn start
```

## Disclaimer

Use it at your own risk.
