const EventEmitter = require('../lib/EventEmitter');

class Signer {
  constructor() {
    this.events = new EventEmitter();
    this.accounts = [];
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
