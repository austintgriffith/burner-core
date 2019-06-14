const { eth } = require('@burner-wallet/assets');

after(() => {
  eth.stop();
});
