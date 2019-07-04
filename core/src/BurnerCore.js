const Web3 = require('web3');
const tabookey = require('tabookey-gasless');
const ProxyProvider = require('./ProxyProvider');
const EventEmitter = require('./lib/EventEmitter');

class BurnerCore {
  constructor({ signers=[], gateways=[], assets=[] }) {
    if (gateways.length === 0) {
      throw new Error('Must include at least 1 gateway')
    }
    this.signers = signers;
    this.signers.forEach(signer => signer.onAccountChange(() => this.events.emit('accountChange')))

    this.gateways = gateways;
    this.assets = assets;
    this.assets.forEach(asset => asset.setCore(this));

    this.providers = {};
    this.web3 = {};

    this.events = new EventEmitter();
  }

  onAccountChange(callback) {
    this.events.on('accountChange', () => callback(this.getAccounts()));
  }

  getAssets() {
    return this.assets;
  }

  getAccounts() {
    const availableSigners = this.signers.filter(signer => signer.isAvailable());
    return [].concat.apply([], availableSigners.map(signer => signer.getAccounts()));
  }

  signTx(txParams) {
    for (const signer of this.signers) {
      if (signer.isAvailable() && signer.hasAccount(txParams.from)) {
        return signer.signTx(txParams);
      }
    }
    throw new Error('Unable to find an appropriate signer');
  }

  async signMsg(msg, account) {
    for (const signer of this.signers) {
      if (signer.isAvailable() && signer.hasAccount(account)) {
        return signer.signMsg(msg, account);
      }
    }
    throw new Error('Unable to find an appropriate signer');
  }

  shouldSkipSigning(network, txParams) {
    for (const signer of this.signers) {
      if (signer.isAvailable() && signer.hasAccount(txParams.from)) {
        return signer.shouldSkipSigning();
      }
    }
    throw new Error('Unable to find an appropriate signer');
  }

  handleRequest(network, payload) {
    for (const gateway of this.gateways) {
      if (gateway.isAvailable() && gateway.getNetworks().indexOf(network) !== -1) {
        return gateway.send(network, payload);
      }
    }
    throw new Error(`Could not find gateway for network ${network}`);
  }

  getProvider(network, options={}) {
    const cacheKey = options.gasless ? `${network}-gasless` : network;
    if (this.providers[cacheKey]) {
      return this.providers[cacheKey];
    }

    let provider = new ProxyProvider(network, this);

    if (options.gasless) {
      provider = new tabookey.RelayProvider(provider, {});
    }

    this.providers[cacheKey] = provider;
    return provider;
  }

  getWeb3(network, options={}) {
    const cacheKey = options.gasless ? `${network}-gasless` : network;
    if (this.web3[cacheKey]) {
      return this.web3[cacheKey];
    }

    this.web3[cacheKey] = new Web3(this.getProvider(network, options), null, {
      transactionConfirmationBlocks: 1,
    });
    return this.web3[cacheKey];
  }

  canCallSigner(action, account) {
    for (const signer of this.signers) {
      if (signer.isAvailable() && signer.hasAccount(account)) {
        return signer.permissions().indexOf(action) !== -1;
      }
    }
    return false;
  }

  callSigner(action, account, ...params) {
    for (const signer of this.signers) {
      if (signer.isAvailable() && signer.hasAccount(account)) {
        return signer.invoke(action, account, ...params);
      }
    }
    throw new Error(`Unable to find signer for ${account}`);
  }

  stop() {
    Object.values(this.providers).forEach(provider => provider.stop());
    Object.values(this.gateways).forEach(gateway => gateway.stop());
    this.assets.forEach(asset => asset.stop && asset.stop());
  }
}

module.exports = BurnerCore;
