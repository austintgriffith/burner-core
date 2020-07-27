const EventEmitter = require('../lib/EventEmitter');

class Signer {
  constructor({ id=null }={}) {
    this.events = new EventEmitter();
    this.accounts = [];
    this.core = null;
    this.id = id;
  }

  setCore(core) {
    this.core = core;
  }

  isAvailable() {
    return true;
  }

  getAccounts() {
    return this.accounts;
  }

  hasAccount(account) {
    return this.getAccounts()
      .map(address => address.toLowerCase())
      .indexOf(account.toLowerCase()) !== -1;
  }

  signTx() {
    throw new Error('signTx() not implemented');
  }

  signMsg() {
    throw new Error('signMsg() not implemented');
  }

  signTypedMsg() {
    throw new Error('signTypedMsg not implemented');
  }

  shouldSkipSigning() {
    return false;
  }

  onAccountChange(callback) {
    this.events.on('accountChange', callback);
  }

  permissions() {
    return [];
  }

  invoke(action, account) {
    throw new Error('invoke not implemented');
  }
}

module.exports = Signer;
