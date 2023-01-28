class SolutionFormatter {

  new_line = '\n';

  constructor(solution) {
    this.solution = solution;
  }

  format() {
    return this.lines.join(this.new_line);
  }

  lines() {
    return this.solution.split(this.new_line)
      .map(line => line.trim())
      .filter(line => !line.startsWith('//'))
      .filter(line => !line.startsWith('/*'))
      .filter(line => !line.startsWith('*'))
      .filter(line => !line.startsWith('*/'));
  }
}

module.exports = SolutionFormatter;
