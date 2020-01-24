class Gateway {
  constructor(networks = []) {
    this.networks = networks;
    this.core = null;
  }

  setCore(core) {
    this.core = core;
  }

  isAvailable() {
    return false;
  }

  getNetworks() {
    return this.networks;
  }

  sendTx(network, payload) {
    return this.send(network, {
      ...payload,
      params: [payload.params[0].signedTransaction],
    });
  }

  send(network, payload) {
    throw new Error('send() not implemented');
  }

  stop() {}
}

module.exports = Gateway;
