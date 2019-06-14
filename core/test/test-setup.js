const { eth } = require('../../assets/');

after(() => {
  eth.stop();
});
