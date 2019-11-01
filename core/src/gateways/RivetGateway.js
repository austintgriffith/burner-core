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

  send(network, payload) {
    return new Promise((resolve, reject) => {
      if (this.getNetworks().indexOf(network) === -1) {
        return reject(new Error(`Rivet Gateway does not support this network "${network}"`));
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

module.exports = RivetGateway;
