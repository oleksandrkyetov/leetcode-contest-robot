const jsdom = require('jsdom');
const {JSDOM} = jsdom;

class DescriptionFormatter {

  new_line = '\n';

  constructor(description) {
    this.description = description;
  }

  format() {
    return this.lines().join(this.new_line);
  }

  lines() {
    const nbspMapper = (line) => line.replaceAll('&nbsp;', ' ');

    const supMatchConverter = (match) => {
      const sups = match.replace('</sup>', '').split('<sup>').map(sup => Number(sup));
      return Math.pow(sups[0], sups[1]);
    }
    const supMapper = (line) => (line.match(/\d+<sup>\d+?<\/sup>/g) || [])
      .reduce((accumulator, match) => accumulator.replace(match, supMatchConverter(match)), line);

    const codeMatchConverter = (match) => match.replace('<code>', '`').replace('</code>', '`');
    const codeMapper = (line) => (line.match(/<code>.+?<\/code>/g) || [])
      .reduce((accumulator, match) => accumulator.replace(match, codeMatchConverter(match)), line);

    // const newLineReducer = (accumulator, currentValue) => {
    //   if (/(Constraints|Example \d+):/g.test(currentValue)) {
    //     accumulator.push(this.new_line);
    //   }
    //   return accumulator.concat(currentValue);
    // }

    return this.description.trim().split(this.new_line)
      .map(line => nbspMapper(line))
      .map(line => supMapper(line))
      .map(line => codeMapper(line))
      // .map(line => new DOMParser().parseFromString(line, 'text/html').body.textContent)
      .map(line => new JSDOM(line).window.document.body.textContent)
      .filter(line => line.trim().length);
      // .reduce(newLineReducer, []);
  }
}

module.exports = DescriptionFormatter;
