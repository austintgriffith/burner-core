const Web3 = require('web3');
const cookies = require('../lib/cookies');
const Signer = require('./Signer');

class LocalSigner extends Signer {
  constructor({ privateKey, saveKey=true } = {}) {
    super();
    this._saveKey = saveKey;

    if (this._isValidPK(privateKey)) {
      this._generateAccountFromPK(privateKey);
    } else {
      this._loadOrGenerateAccount();
    }
  }

  getAccounts() {
    return [this.account.address];
  }

  async signTx(tx) {
    const { rawTransaction } = await this.account.signTransaction(tx);
    return rawTransaction;
  }

  signMsg(msg) {
    return this.account.sign(msg).signature;
  }

  permissions() {
    return ['readKey', 'writeKey', 'burn'];
  }

  invoke(action, account, ...params) {
    if (!this.hasAccount(account)) {
      throw new Error('Can not call invoke, incorrect account');
    }

    switch (action) {
      case 'readKey':
        return this.account.privateKey;
      case 'writeKey':
        const [newPK] = params;
        this._generateAccountFromPK(newPK);
        return this.account.address;
      case 'burn':
        this._generateNewAccount();
        return this.account.address;
      default:
        throw new Error(`Unknown action ${action}`);
    }
  }

  _isValidPK(pk) {
    return !!pk && parseInt(pk) > 0;
  }

  _loadOrGenerateAccount() {
    const pk = (window.localStorage && localStorage.getItem('metaPrivateKey'))
      || cookies.getCookie('metaPrivateKey');
    if (this._isValidPK(pk)) {
      this._generateAccountFromPK(pk);
    } else {
      this._generateNewAccount();
    }
  }

  _generateAccountFromPK(privateKey) {
    this.account = (new Web3()).eth.accounts.privateKeyToAccount(privateKey);
    this._saveAccount();
    this.events.emit('accountChange');
  }

  _generateNewAccount() {
    this.account = (new Web3()).eth.accounts.create();
    this._saveAccount();
    this.events.emit('accountChange');
  }

  _saveAccount() {
    if (!this._saveKey) {
      return;
    }

    const { privateKey } = this.account;
    if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
      throw new Error(`Invalid Private Key "${privateKey}"`);
    }

    if (window.localStorage) {
      localStorage.setItem('metaPrivateKey', this.account.privateKey);
    }
    cookies.setCookie('metaPrivateKey', this.account.privateKey);
  }
}

module.exports = LocalSigner;
