const { generateSummaryReport } = require('k6-html-reporter');
const path = require('path');

const options = {
  jsonFile: path.resolve(__dirname, '../reports/k6/summary-handleSummary.json'),
  output: path.resolve(__dirname, '../reports/k6'),
};

generateSummaryReport(options);

console.log('Relatório HTML gerado em: reports/k6/index.html');
