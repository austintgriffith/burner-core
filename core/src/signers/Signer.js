const EventEmitter = require('../lib/EventEmitter');

class Signer {
  constructor() {
    this.events = new EventEmitter();
  }

  isAvailable() {
    return true;
  }

  getAccounts() {
    return [];
  }

  hasAccount(account) {
    return false;
  }

  signTx() {
    throw new Error('signTx() not implemented');
  }

  onAccountChange(callback) {
    this.events.on('accountChange', callback);
  }
}

module.exports = Signer;
