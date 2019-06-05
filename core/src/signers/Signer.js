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

  permissions() {
    return [];
  }

  invoke(action, account) {
    throw new Error('invoke not implemented');
  }
}

module.exports = Signer;
