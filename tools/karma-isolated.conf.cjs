// OS-assigned ephemeral test port: no shared application/dev-server origin.
module.exports = (config) => config.set({
  frameworks: ['jasmine'],
  plugins: [require('karma-jasmine'), require('karma-chrome-launcher')],
  reporters: ['progress'],
  browsers: ['ChromeHeadless'],
  port: 0,
  listenAddress: '127.0.0.1',
  hostname: '127.0.0.1',
  restartOnFileChange: false,
});
