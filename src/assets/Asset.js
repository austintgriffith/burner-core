const { fromWei } = require('web3-utils');
const pricefeed = require('./pricefeed');

const PRICE_POLL_INTERVAL = 15 * 1000;

class Asset {
  constructor({ id, name, network, type='native', usdPrice, priceSymbol }) {
    this.id = id;
    this.name = name;
    this.network = network;
    this.type = type;
    this.usdPrice = usdPrice;
    this.priceSymbol = priceSymbol;
    if (priceSymbol) {
      this._startPricePolling();
    }
  }

  setCore(core) {
    this.core = core;
  }

  async getTx(txHash) {
    throw new Error('Not implemented');
  }

  getDisplayValue(value, decimals=2) {
    const displayVal = fromWei(value.toString(), 'ether');
    return displayVal.substr(0, displayVal.indexOf('.') + decimals + 1);
  }

  getUSDValue(value, decimals=2) {
    if (this.usdPrice) {
      return (+this.getDisplayValue(value, 10) * this.usdPrice).toFixed(decimals);
    }
    throw new Error('USD price not available');
  }

  async getBalance(account) {
    throw new Error('getBalance not implemented');
  }

  async getDisplayBalance(account, decimals=2) {
    const balance = await this.getBalance(account);
    return this.getDisplayValue(balance, decimals);
  }

  async send({ from, to, value }) {
    throw new Error('send not implemented');
  }

  _startPricePolling() {
    setInterval(async () => {
      this.usdPrice = await pricefeed.getPrice(this.priceSymbol);
    }, PRICE_POLL_INTERVAL);
  }
}

module.exports = Asset;
