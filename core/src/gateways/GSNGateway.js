const Gateway = require('./Gateway');
const Web3 = require('web3');
const tabookey = require('@dmihal/tabookey-gasless');

class GSNGateway extends Gateway {
  constructor() {
    super(['1', '3', '4', '5', '42', '100']);
    this.isOn = true;
    this._w3Provider = null;
    this.clients = {};
  }

  isAvailable() {
    return this.isOn;
  }

  getClient(network) {
    if (!this.clients[network]) {
      this.clients[network] = new tabookey.RelayClient(this.core.getWeb3(network), {});
    }
    return this.clients[network];
  }

  async sendTx(network, payload) {
    if (payload.params[0].useGSN) {
      const client = this.getClient(network);
      return new Promise((resolve, reject) => {
        client.runRelay({
          ...payload,
          method: 'eth_sendTransaction',
        }, (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result.result);
        });
      });
    }

    return this.send(network, {
      ...payload,
      params: [payload.params[0].signedTransaction],
    });
  }

  async send(network, payload) {
    try {
      this.isOn = false;
      const request = this.core.handleRequest(network, payload);
      this.isOn = true;

      const response = await request;

      if (payload.method === 'eth_getTransactionReceipt' && response) {
        this.getClient(network).fixTransactionReceiptResp(response.result);
      }
      return response;
    } catch (e) {
      this.isOn = true;
      throw e;
    }
  }
}

module.exports = GSNGateway;
