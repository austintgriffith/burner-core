const ERC20Asset = require('./ERC20Asset');

module.exports = new ERC20Asset({
  id: 'usdc',
  name: 'USDC',
  network: '1',
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  usdPrice: 1,
  icon: 'https://static.burnerfactory.com/icons/usdc.svg',
  decimals: 6,
});
