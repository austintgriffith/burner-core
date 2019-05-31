const Web3 = require('web3');
const Signer = require('./Signer');

class InjectedSigner extends Signer {
  constructor() {
    if (this.isAvailable()) {
      this.web3 = new Web3(this._provider());
    }
  }

  isAvailable() {
    return !!window.ethereum || !!(window.web3 && window.web3.currentProvider);
  }

  signTx(tx) {
    return this.web3.eth.signTransaction(tx);
  }

  _provider() {
    return window.ethereum || window.web3.currentProvider;
  }
}

module.exports = InjectedSigner;
