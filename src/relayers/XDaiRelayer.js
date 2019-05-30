const Relayer = require('./Relayer');
const Web3 = require('web3');

class xDaiRelayer extends Relayer {
  isAvailable() {
    return true;
  }

  getNetworks() {
    return ['100'];
  }

  _provider(network) {
    return new Web3.providers.HttpProvider('https://dai.poa.network');
  }

  async send(network, { method, params, id }) {
    if (network !== '100') {
      throw new Error('xDai does not support this network');
    }
    const response = await this._provider(network).send(method, params);
    return response;
  }
}

module.exports = xDaiRelayer;
