class Relayer {
  isAvailable() {
    return false;
  }

  getNetworks() {
    return [];
  }

  send(network, message, params) {
    throw new Error('send() not implemented');
  }
}

module.exports = Relayer;
