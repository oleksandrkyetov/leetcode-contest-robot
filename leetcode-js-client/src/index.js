require('dotenv').config();

const username = process.env.LEETCODE_USERNAME;
const password = process.env.LEETCODE_PASSWORD;

const contest = process.env.LEETCODE_CONTEST;
const language = process.env.LEETCODE_LANGUAGE;

const server = process.env.LEETCODE_SERVER;

const openaiApiKey = process.env.OPENAI_API_KEY;

const new_line = '\n';

import('chatgpt').then(chatgpt => {
  // Initiate ChatGPT here, as if it does not work, it does not make sense to proceed
  const chatgptApi = new chatgpt.ChatGPTAPI({apiKey: openaiApiKey});

  const consoleLogAndReturn = (json) => {
    console.log(json);
    return json;
  }

  const logIn = (username, password) => {
    console.log('Logging in ...');

    const url = new URL(`${server}/leetcode`);

    const options = {
      method: 'post',
      body: JSON.stringify({username, password}),
      headers: {'Content-Type': 'application/json'},
    }

    return fetch(url, options)
      .then(response => response.json())
      .then(json => consoleLogAndReturn(json));
  }

  const getContestDetails = (contest) => {
    console.log(`Getting "${contest}" contest details ...`);

    const url = new URL(`${server}/leetcode/${contest}`);

    const options = {
      method: 'get',
    }

    return fetch(url, options)
      .then(response => response.json())
      .then(json => consoleLogAndReturn(json));
  }

  const getTaskDetails = (contest, task, language) => {
    console.log(`Getting "${contest}" contest "${task.title}" task details ...`);

    const url = new URL(`${server}/leetcode/${contest}/task?url=${task.url}&language=${language}`);

    const options = {
      method: 'get',
    }

    return fetch(url, options)
      .then(response => response.json())
      .then(json => consoleLogAndReturn(json));
  }

  const getSolution = (contest, task, language, taskDetails) => {
    console.log(`Solving "${contest}" contest "${task.title}" task ...`);

    const message = [
      `Write ${language} algorithm to solve problem below:`,
      taskDetails.description,
      'Use code template below:',
      taskDetails.code
    ].join(new_line);

    return chatgptApi.sendMessage(message)
      .then(answer => answer.text.split(new_line).slice(1, -1).join(new_line))
      .then(solution => consoleLogAndReturn({...taskDetails, solution}));
  }

  const setTaskDetails = (contest, task, language, taskDetails) => {
    console.log(`Setting "${contest}" contest "${task.title}" task details ...`);

    const url = new URL(`${server}/leetcode/${contest}/task?url=${task.url}&language=${language}`);

    const options = {
      method: 'post',
      body: JSON.stringify({...taskDetails}),
      headers: {'Content-Type': 'application/json'},
    }

    return fetch(url, options)
      .then(response => response.json())
      .then(json => consoleLogAndReturn(json));
  }

  logIn(username, password)
    .then(() => getContestDetails(contest))
    .then(contestDetails => {
      const tasks = [...contestDetails];

      const solveTask = (task) => {
        return getTaskDetails(contest, task, language)
          .then(taskDetails => getSolution(contest, task, language, taskDetails))
          .then(taskDetails => setTaskDetails(contest, task, language, taskDetails))
      }

      const solveTasks = (tasks, i = 0) => {
        return new Promise((resolve, _reject) => {
          if (i < tasks.length) {
            resolve(solveTask(tasks[i]).then(() => solveTasks(tasks, i + 1)));
          } else {
            resolve();
          }
        });
      }

      return solveTasks(tasks);
    })
    .catch(error => console.log(error));
});
