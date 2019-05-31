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

  async send({ from, to, value }) {
    throw new Error('send not implemented');
  }
}

module.exports = Asset;
