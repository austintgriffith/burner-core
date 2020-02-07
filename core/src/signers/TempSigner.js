const Web3 = require('web3');
const { toBN } = require('web3-utils');
const Signer = require('./Signer');

class TempSigner extends Signer {
  constructor() {
    super({ id: 'temp' });
    this.account = null;
  }

  getAccounts() {
    return this.account ? [this.account.address] : [];
  }

  isAvailable() {
    return !!this.account;
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

    const { rawTransaction } = await this.account.signTransaction(_tx);
    _tx.signedTransaction = rawTransaction;

    return _tx;
  }

  async signMsg(msg) {
    return this.account.sign(msg).signature;
  }

  permissions() {
    return ['enable', 'disable'];
  }

  invoke(action, newPK) {
    switch (action) {
      case 'disable':
        this.account = null;
        this.events.emit('accountChange');
        return;
      case 'enable':
        this._generateAccountFromPK(newPK);
        return this.account.address;
      default:
        throw new Error(`Unknown action ${action}`);
    }
  }

  _generateAccountFromPK(privateKey) {
    this.account = (new Web3()).eth.accounts.privateKeyToAccount(privateKey);
    this.events.emit('accountChange');
  }
}

module.exports = TempSigner;
