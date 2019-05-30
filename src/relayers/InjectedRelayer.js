const Relayer = require('./Relayer');

class InjectedRelayer extends Relayer {
  isAvailable() {
    return !!window.ethereum || !!(window.web3 && window.web3.currentProvider);
  }

  getNetworks() {
    return [this._provider().networkVersion];
  }

  _provider() {
    return window.ethereum || window.web3.currentProvider;
  }

  send(network, message, params) {
    if (network !== this._provider().networkVersion) {
      throw new Error('This relayer does not support the provided network');
    }
    return this._provider.send(message, params);
  }
}

module.exports = InjectedRelayer;
