const Web3 = require('web3');
const cookies = require('../lib/cookies');
const Signer = require('./Signer');

class LocalSigner extends Signer {
  constructor({ privateKey } = {}) {
    super();
    this.web3 = new Web3();

    if (privateKey) {
      this._generateAccountFromPK(privateKey);
    } else {
      this._loadOrGenerateAccount();
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

  _loadOrGenerateAccount() {
    const pk = (window.localStorage && localStorage.getItem('metaPrivateKey'))
      || cookies.getCookie('metaPrivateKey');
    if (pk) {
      this._generateAccountFromPK(pk);
    } else {
      this._generateNewAccount();
    }
  }

  _generateAccountFromPK(privateKey) {
    this.account = (new Web3()).eth.accounts.privateKeyToAccount(privateKey);
    this._saveAccount();
  }

  _generateNewAccount() {
    this.account = (new Web3()).eth.accounts.create();
    this._saveAccount();
  }

  _saveAccount() {
    if (window.localStorage) {
      localStorage.setItem('metaPrivateKey', this.account.privateKey);
    }
    cookies.setCookie('metaPrivateKey', this.account.privateKey);
  }
}

module.exports = LocalSigner;
