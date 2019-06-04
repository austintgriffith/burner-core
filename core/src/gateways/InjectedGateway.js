const Gateway = require('./Gateway');

class InjectedGateway extends Gateway {
  isAvailable() {
    return !!window.ethereum || !!(window.web3 && window.web3.currentProvider);
  }

  getNetworks() {
    return [this._provider().networkVersion];
  }

  _provider() {
    return window.ethereum || window.web3.currentProvider;
  }

  send(network, payload) {
    if (network !== this._provider().networkVersion) {
      throw new Error('This Gateway does not support the provided network');
    }
    return new Promise((resolve, reject) =>
      this._provider().sendAsync(payload, (err, { result, error }) =>
        err || error ? reject(err || error) : resolve(result))
    )
  }
}

module.exports = InjectedGateway;
