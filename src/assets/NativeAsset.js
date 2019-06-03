const { toWei } = require('web3-utils');
const Asset = require('./Asset');

class NativeAsset extends Asset {
  getBalance(account) {
    return this.core.getWeb3(this.network).eth.getBalance(account);
  }

  send(params) {
    if (params.ether) {
      params.value = toWei(params.ether, 'ether');
      delete params.ether;
    }

    return this.core.getWeb3(this.network).eth.sendTransaction(params);
  }
}

module.exports = NativeAsset;
