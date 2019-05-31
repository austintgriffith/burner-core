const Asset = require('./Asset');

class NativeAsset extends Asset {
  getBalance(account) {
    return this.core.getWeb3(this.network).eth.getBalance(account);
  }

  send(params) {
    return this.core.getWeb3(this.network).eth.sendTransaction(params);
  }
}

module.exports = NativeAsset;
