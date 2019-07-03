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

  async send(network, { method, params, id }) {
    if (network !== this.networkId) {
      throw new Error('HTTPGateway does not support this network');
    }
    const response = await this._provider().send(method, params);

    return response;
  }
}

module.exports = HTTPGateway;
