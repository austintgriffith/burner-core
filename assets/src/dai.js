const ERC20Asset = require('./ERC20Asset');

module.exports = new ERC20Asset({
  id: 'dai',
  name: 'Dai',
  network: '1',
  address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
  usdPrice: 1,
  icon: 'https://static.burnerfactory.com/icons/dai.svg',
});
