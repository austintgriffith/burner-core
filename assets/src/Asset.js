const { fromWei, toWei } = require('web3-utils');
const pricefeed = require('./pricefeed');
const { toDecimal } = require('./utils/decimals');

const PRICE_POLL_INTERVAL = 15 * 1000;

class Asset {
  constructor({ id, name, network, usdPrice, priceSymbol, type=null, decimals=18 }) {
    this.id = id;
    this.name = name;
    this.network = network;
    this.usdPrice = usdPrice;
    this.priceSymbol = priceSymbol;
    this.type = type;

    this.decimals = decimals;

    this.cleanupFunctions = [];

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
    const displayVal = toDecimal(value.toString(), this.decimals);
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

  startWatchingAddress(address) {
    throw new Error('watching not implemented');
  }

  async send(params) {
    if (params.ether) {
      params.value = toWei(params.ether, 'ether');
      delete params.ether;
    }
    const response = await this._send(params);
    this.core.addHistoryEvent({
      asset: this.id,
      type: 'send',
      value: params.value,
      from: params.from,
      to: params.to,
      tx: response.txHash,
      timestamp: Date.now() / 1000,
    });
    return response;
  }

  async _send({ from, to, value }) {
    throw new Error('send not implemented');
  }

  async _startPricePolling() {
    const interval = setInterval(async () => {
      this.usdPrice = await pricefeed.getPrice(this.priceSymbol);
    }, PRICE_POLL_INTERVAL);
    this.cleanupFunctions.push(() => clearInterval(interval));

    this.usdPrice = await pricefeed.getPrice(this.priceSymbol);
  }

  getWeb3(options) {
    return this.core.getWeb3(this.network, options);
  }

  stop() {
    this.cleanupFunctions.forEach(fn => fn());
  }
}

module.exports = Asset;
