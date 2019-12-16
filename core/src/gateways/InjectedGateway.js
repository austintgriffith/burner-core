const Gateway = require('./Gateway');

class InjectedGateway extends Gateway {
  constructor() {
    super();
    const provider = this._provider();
    if (provider) {
      provider.autoRefreshOnNetworkChange = false;
    }
  }

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
    return new Promise((resolve, reject) => {
      if (network !== this._provider().networkVersion) {
        return reject(new Error('This Gateway does not support the provided network'));
      }

      this._provider().sendAsync(payload, (err, { result, error }) => {
        if (err) {
          reject(err || error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = InjectedGateway;
