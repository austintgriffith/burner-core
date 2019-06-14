class Gateway {
  isAvailable() {
    return false;
  }

  getNetworks() {
    return [];
  }

  send(network, message, params) {
    throw new Error('send() not implemented');
  }

  stop() {}
}

module.exports = Gateway;
