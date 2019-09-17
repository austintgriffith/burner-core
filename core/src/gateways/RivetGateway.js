const Gateway = require('./Gateway');
const Web3 = require('web3');

class RivetGateway extends Gateway {
  constructor(key) {
    super();
    this.available = !!key;
    if (!key) {
      console.warn('Warning: RivetGateway created without API Key. Rivet will be unavailable.');
    }
    this.providerStrings = {
      '1': `https://eth.rpc.rivet.cloud/${key}`,
      '3': `https://ropsten.rpc.rivet.cloud/${key}`,
      '4': `https://rinkeby.rpc.rivet.cloud/${key}`,
      '5': `https://goerli.rpc.rivet.cloud/${key}`,
    }
    this.providers = {};
  }

  isAvailable() {
    return this.available;
  }

  getNetworks() {
    return ['1', '3', '4', '5'];
  }

  _provider(network) {
    if (!this.providers[network]) {
      if (!this.providerStrings[network]) {
        throw new Error(`Network ${network} not supported by RivetGateway`);
      }
      this.providers[network] = new Web3.providers.HttpProvider(this.providerStrings[network]);
    }
    return this.providers[network];
  }

  async send(network, { method, params, id }) {
    if (this.getNetworks().indexOf(network) === -1) {
      throw new Error('Rivet does not support this network');
    }
    const response = await this._provider(network).send(method, params);
    return response;
  }
}

module.exports = RivetGateway;
