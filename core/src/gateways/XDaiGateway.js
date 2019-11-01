const Gateway = require('./Gateway');
const Web3 = require('web3');

class xDaiGateway extends Gateway {
  constructor() {
    super();
    this._w3Provider = null;
  }
  isAvailable() {
    return true;
  }

  getNetworks() {
    return ['100'];
  }

  _provider(network) {
    if (!this._w3Provider) {
      this._w3Provider = new Web3.providers.HttpProvider('https://dai.poa.network');;
    }
    return this._w3Provider;
  }

  send(network, payload) {
    return new Promise((resolve, reject) => {
      if (network !== '100') {
        return reject(new Error('xDai does not support this network'));
      }

      this._provider(network).send(payload, (err, response) => {
        if (err) {
          return reject(err);
        }

        // Strange hack since the xdai relay seems to return a receipt for unmined txs
        if (payload.method === 'eth_getTransactionReceipt' && response.result && !response.result.blockNumber) {
          return resolve(null);
        }
        if (payload.method === 'eth_gasPrice' && response.result === '0x0') {
          return resolve('0x3b9aca00'); // 1 gwei
        }

        return resolve(response.result);
      });

    });
  }
}

module.exports = xDaiGateway;
