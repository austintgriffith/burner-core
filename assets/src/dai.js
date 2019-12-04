const ERC20Asset = require('./ERC20Asset');

module.exports = new ERC20Asset({
  id: 'dai',
  name: 'Dai',
  network: '1',
  address: '0x6b175474e89094c44da98b954eedeac495271d0f',
  usdPrice: 1,
  icon: 'https://static.burnerfactory.com/icons/mcd.svg',
});
