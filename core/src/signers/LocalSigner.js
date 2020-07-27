const Web3 = require('web3');
const { toBN } = require('web3-utils');
const cookies = require('../lib/cookies');
const Signer = require('./Signer');
const sigUtil = require('eth-sig-util');
const { toBuffer } = require('ethereumjs-util');

class LocalSigner extends Signer {
  constructor({ privateKey, saveKey=true, gasMultiplier=1 } = {}) {
    super({ id: 'local' });
    this._saveKey = saveKey;
    this.gasMultiplier = gasMultiplier;

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
    const _tx = {
      ...tx,

      // Workaround for https://github.com/ethereumjs/ethereumjs-tx/pull/195
      common: {
        customChain: {
          chainId: tx.chainId,
          networkId: tx.chainId,
        },
        hardfork: 'istanbul',
      },
    };

    if (this.gasMultiplier !== 1) {
      const multiplier = Math.floor(this.gasMultiplier * 1000).toString();
      _tx.gas = toBN(tx.gas).mul(toBN(multiplier)).div(toBN('1000'));
    }

    const { rawTransaction } = await this.account.signTransaction(_tx);
    _tx.signedTransaction = rawTransaction;

    return _tx;
  }

  async signMsg(msg) {
    return this.account.sign(msg).signature;
  }

  async signTypedMsg(msg) {
    const data = typeof msg === 'string' ? JSON.parse(msg) : msg;

    const signed = sigUtil.signTypedData_v4(toBuffer(this.account.privateKey), { data });
    return signed;
  }

  permissions() {
    return ['readKey', 'writeKey', 'burn', 'keyToAddress'];
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
      case 'keyToAddress':
        const [pk] = params;
        const { address } = (new Web3()).eth.accounts.privateKeyToAccount(pk);
        return address;
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
