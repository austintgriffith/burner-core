const Web3 = require('web3');
const Signer = require('./Signer');

class LocalSigner extends Signer {
  constructor({ privateKey } = {}) {
    super();
    this.web3 = new Web3();

    if (privateKey) {
      this._generateAccountFromPK(privateKey);
    } else {
      this._generateNewAccount();
    }
  }

  getAccounts() {
    return [this.account.address];
  }

  hasAccount(account) {
    return this.account.address.toLowerCase() === account.toLowerCase();
  }

  async signTx(tx) {
    const { rawTransaction } = await this.account.signTransaction(tx);
    return rawTransaction;
  }

  _generateAccountFromPK(privateKey) {
    this.account = (new Web3()).eth.accounts.privateKeyToAccount(privateKey);
  }

  _generateNewAccount() {
    this.account = (new Web3()).eth.accounts.create();
  }
}

module.exports = LocalSigner;
