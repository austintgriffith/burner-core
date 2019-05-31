class Signer {
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
}

module.exports = Signer;
