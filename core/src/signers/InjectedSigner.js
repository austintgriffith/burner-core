const Web3 = require('web3');
const Signer = require('./Signer');

const arrayEquals = (a, b) => a.length === b.length && a.every((val, i) => val === b[i]);

class InjectedSigner extends Signer {
  constructor() {
    super();
    this.accounts = [];
    if (this.isAvailable()) {
      this.web3 = new Web3(this._provider());
      this.updateAccounts();
    }
  }

  getAccounts() {
    return this.accounts;
  }

  hasAccount(account) {
    return this.accounts.indexOf(this.web3.utils.toChecksumAddress(account)) !== -1;
  }

  isAvailable() {
    return !!(window.ethereum || (window.web3 && window.web3.currentProvider));
  }

  signTx(tx) {
    return this.web3.eth.signTransaction(tx);
  }

  shouldSkipSigning() {
    return !!this._provider().isMetaMask;
  }

  async updateAccounts() {
    const accounts = await this.web3.eth.getAccounts();

    if (!arrayEquals(accounts, this.accounts)) {
      this.accounts = accounts;
      this.events.emit('accountChange');
    }
  }

  _provider() {
    return window.ethereum || window.web3.currentProvider;
  }
}

module.exports = InjectedSigner;
