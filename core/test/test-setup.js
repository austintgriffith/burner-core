const log = require('why-is-node-running')
const { eth } = require('@burner-wallet/assets');

after(() => {
  eth.stop();

  setTimeout(() => {
    console.error('Tests have not exited gracefully');
    log();
    process.exit(1);
  }, 10000).unref();
});
