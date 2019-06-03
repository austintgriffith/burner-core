const { fromWei } = require('web3-utils');


class Asset {
  constructor({ id, name, network, type='native' }) {
    this.id = id;
    this.name = name;
    this.network = network;
    this.type = type;
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
}

module.exports = Asset;
