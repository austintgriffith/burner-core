const { fromWei, toWei } = require('web3-utils');
const pricefeed = require('./pricefeed');

const PRICE_POLL_INTERVAL = 15 * 1000;

class Asset {
  constructor({ id, name, network, usdPrice, priceSymbol, type=null }) {
    this.id = id;
    this.name = name;
    this.network = network;
    this.usdPrice = usdPrice;
    this.priceSymbol = priceSymbol;
    this.type = type;

    if (priceSymbol) {
      this._startPricePolling();
    }
  }

  setCore(core) {
    this.core = core;
  }

  supportsMessages() {
    return false;
  }

  async getTx(txHash) {
    throw new Error('Not implemented');
  }

  getDisplayValue(value, decimals=2) {
    const displayVal = fromWei(value.toString(), 'ether');
    if (displayVal.indexOf('.') !== -1) {
      return displayVal.substr(0, displayVal.indexOf('.') + decimals + 1);
    }
    return displayVal;
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

  async getUSDBalance(account, decimals=2) {
    const balance = await this.getBalance(account);
    return this.getUSDValue(balance, decimals);
  }

  send(params) {
    if (params.ether) {
      params.value = toWei(params.ether, 'ether');
      delete params.ether;
    }
    return this._send(params);
  }

  async _send({ from, to, value }) {
    throw new Error('send not implemented');
  }

  async _startPricePolling() {
    this.pollInterval = setInterval(async () => {
      this.usdPrice = await pricefeed.getPrice(this.priceSymbol);
    }, PRICE_POLL_INTERVAL);
    this.usdPrice = await pricefeed.getPrice(this.priceSymbol);
  }

  getWeb3(options) {
    return this.core.getWeb3(this.network, options);
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }
}

module.exports = Asset;
