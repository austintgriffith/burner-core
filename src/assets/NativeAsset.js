const Asset = require('./Asset');

class NativeAsset extends Asset {
  getBalance(account) {
    return this.core.getWeb3(this.network).eth.getBalance(account);
  }
}

module.exports = NativeAsset;
