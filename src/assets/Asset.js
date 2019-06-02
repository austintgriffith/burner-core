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

  async getBalance(account) {
    throw new Error('getBalance not implemented');
  }

  async getDisplayBalance(account, decimals=2) {
    const balance = await this.getBalance(account);
    const nativeUnit = fromWei(balance, 'ether');
    return nativeUnit.substr(0, nativeUnit.indexOf('.') + decimals + 1);
  }

  async send({ from, to, value }) {
    throw new Error('send not implemented');
  }
}

module.exports = Asset;
