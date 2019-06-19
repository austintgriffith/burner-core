const Gateway = require('./Gateway');
const Web3 = require('web3');

class InfuraGateway extends Gateway {
  constructor(infuraKey) {
    super();
    this.available = !!infuraKey;
    if (!infuraKey) {
      console.warn('Warning: InfuraGateway created without API Key. Infura will be unavailable.');
    }
    this.providerStrings = {
      '1': `wss://mainnet.infura.io/ws/v3/${infuraKey}`,
      '3': `wss://ropsten.infura.io/ws/v3/${infuraKey}`,
      '4': `wss://rinkeby.infura.io/ws/v3/${infuraKey}`,
      '5': `wss://goerli.infura.io/ws/v3/${infuraKey}`,
      '42': `wss://kovan.infura.io/ws/v3/${infuraKey}`,
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
      this.providers[network] = new Web3.providers.WebsocketProvider(this.providerStrings[network]);
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

  stop() {
    Object.values(this.providers).forEach(provider => provider.disconnect());
  }
}

module.exports = InfuraGateway;
