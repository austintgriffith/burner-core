const Gateway = require('./Gateway');
const Web3 = require('web3');

class HTTPGateway extends Gateway {
  constructor(rpcUrl, networkId) {
    super();
    this.rpcUrl = rpcUrl;
    this.networkId = networkId;
    this._w3Provider = null;
  }

  isAvailable() {
    return true;
  }

  getNetworks() {
    return [this.networkId];
  }

  _provider() {
    if (!this._w3Provider) {
      this._w3Provider = new Web3.providers.HttpProvider(this.rpcUrl);
    }
    return this._w3Provider;
  }

  send(network, payload) {
    return new Promise((resolve, reject) => {
      if (network !== this.networkId) {
        return reject(new Error('HTTPGateway does not support this network'));
      }

      this._provider(network).send(payload, (err, response) => {
        if (err) {
          return reject(err);
        }

        return resolve(response.result);
      });

    });
  }
}

module.exports = HTTPGateway;
