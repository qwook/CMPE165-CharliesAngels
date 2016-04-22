Package.describe({
  name: 'qwook:cmpe165-charliesangels',
  version: '0.0.1',
  summary: 'gigsearch',
  git: '',
  documentation: 'README.md'
});

Package.onTest(function (api) {
  api.use('practicalmeteor:mocha-console-runner');

  // Add any files with mocha tests.
  api.addFiles('tests/app.test.js');
});