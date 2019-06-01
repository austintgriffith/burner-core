const Gateway = require('./Gateway');
const Web3 = require('web3');

class InfuraGateway extends Gateway {
  constructor(infuraKey) {
    super();
    this.available = !!infuraKey;
    this.providerStrings = {
      '1': `https://mainnet.infura.io/v3/${infuraKey}`,
      '3': `https://ropsten.infura.io/v3/${infuraKey}`,
    }
    this.providers = {};
  }

  isAvailable() {
    return this.available;
  }

  getNetworks() {
    return ['1', '3', '4', '5', '42'];
  }

  _provider(network) {
    if (!this.providers[network]) {
      if (!this.providerStrings[network]) {
        throw new Error(`Network ${network} not supported by InfuraGateway`);
      }
      this.providers[network] = new Web3.providers.HttpProvider(this.providerStrings[network]);
    }
    return this.providers[network];
  }

  async send(network, { method, params, id }) {
    if (this.getNetworks().indexOf(network) === -1) {
      throw new Error('Infura does not support this network');
    }
    const response = await this._provider(network).send(method, params);
    return response;
  }
}

module.exports = InfuraGateway;
