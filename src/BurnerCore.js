const ProxyProvider = require('./ProxyProvider');
const Web3 = require('web3');

class BurnerCore {
  constructor({ signers=[], relayers=[], assets=[] }) {
    if (relayers.length === 0) {
      throw new Error('Must include at least 1 relayer')
    }
    this.signers = signers;
    this.relayers = relayers;
    this.assets = assets;
    this.assets.forEach(asset => asset.setCore(this));

    this.providers = {};
    this.web3 = {};
  }

  getAssets() {
    return this.assets;
  }

  getAccounts() {
    return this.signers.map(signer => signer.getAccounts()).flat();
  }

  signTx(txParams) {
    for (const signer of this.signers) {
      if (signer.asAccount(txParams.from)) {
        return signer.signTx(txParams);
      }
    }
    throw new Error('Unable to find an appropriate signer');
  }

  handleRequest(network, payload) {
    for (const relayer of this.relayers) {
      if (relayer.getNetworks().indexOf(network) !== -1) {
        return relayer.send(network, payload);
      }
    }
    throw new Error(`Could not find relayer for network ${network}`);
  }

  getProvider(network) {
    if (this.providers[network]) {
      return this.providers[network];
    }

    this.providers[network] = new ProxyProvider(network, this);
    return this.providers[network];
  }

  getWeb3(network) {
    if (this.web3[network]) {
      return this.web3[network];
    }

    this.web3[network] = new Web3(this.getProvider(network));
    return this.web3[network];
  }

  stop() {
    Object.values(this.providers).forEach(provider => provider.stop());
  }
}

module.exports = BurnerCore;
