const Web3 = require('web3');
const ProxyProvider = require('./ProxyProvider');
const EventEmitter = require('./lib/EventEmitter');
const History = require('./History');
const HistoryEvent = require('./HistoryEvent');
const TempSigner = require('./signers/TempSigner');

class BurnerCore {
  constructor({
    signers=[],
    gateways=[],
    assets=[],
    historyOptions={},
  }) {
    if (gateways.length === 0) {
      throw new Error('Must include at least 1 gateway')
    }

    this.providers = {};
    this.web3 = {};

    this.events = new EventEmitter();
    this.history = new History({ assets, ...historyOptions });

    this.gateways = gateways;
    this.gateways.forEach(gateway => gateway.setCore(this));
    this.assets = assets;
    this.assets.forEach(asset => {
      asset.setCore(this);
      asset.start && asset.start();
    });

    this.signers = signers;
    this.signers.push(new TempSigner);

    this.unsubscribesBySigner = {};
    this.signers.forEach((signer, index) => {
      signer.setCore(this);

      this.unsubscribesBySigner[index] = this.watchAccounts(signer.getAccounts());

      signer.onAccountChange(() => {
        this.startAccountWatching();
        this.events.emit('accountChange');
      });
    });
  }

  startAccountWatching() {
    this.signers.forEach((signer, index) => {
      this.unsubscribesBySigner[index].forEach(unsubscribe => unsubscribe());
      this.unsubscribesBySigner[index] = this.watchAccounts(signer.getAccounts());
    });
  }

  stopAccountWatching() {
    this.signers.forEach((signer, index) => {
      this.unsubscribesBySigner[index].forEach(unsubscribe => unsubscribe());
      this.unsubscribesBySigner[index] = [];
    });
  }

  watchAccounts(accounts) {
    const unsubscribes = []
    for (const account of accounts) {
      for (const asset of this.assets) {
        const unsubscribe = asset.startWatchingAddress(account);
        unsubscribes.push(unsubscribe);
      }
    }
    return unsubscribes;
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

  async signTx(txParams) {
    for (const signer of this.signers) {
      if (signer.isAvailable() && signer.hasAccount(txParams.from)) {
        const signed = await signer.signTx(txParams);
        return signed;
      }
    }
    throw new Error('Unable to find an appropriate signer');
  }

  async signMsg(msg, account, type='normal') {
    for (const signer of this.signers) {
      if (signer.isAvailable() && signer.hasAccount(account)) {
        if (type === 'typed') {
          if (signer.signTypedMsg) {
            return await signer.signTypedMsg(msg, account);
          } else {
            throw new Error(`Signer doesn't support typed signing`);
          }
        }

        return await signer.signMsg(msg, account);
      }
    }
    throw new Error('Unable to find an appropriate signer');
  }

  shouldSkipSigning(network, txParams) {
    for (const signer of this.signers) {
      if (signer.isAvailable() && signer.hasAccount(txParams.from)) {
        return signer.shouldSkipSigning(network);
      }
    }
    throw new Error('Unable to find an appropriate signer');
  }

  async handleRequest(network, payload) {
    for (const gateway of this.gateways) {
      if (gateway.isAvailable() && gateway.getNetworks().indexOf(network) !== -1) {
        const response = payload.method === 'eth_sendRawTransaction'
            && payload.params[0].signedTransaction
          ? await gateway.sendTx(network, payload)
          : await gateway.send(network, payload);
        return response;
      }
    }
    throw new Error(`Could not find gateway for network ${network}`);
  }

  getProvider(network) {
    if (!this.providers[network]) {
      this.providers[network] = new ProxyProvider(network, this);
    }

    return this.providers[network];
  }

  getWeb3(network) {
    if (!this.web3[network]) {
      this.web3[network] = new Web3(this.getProvider(network));
    }

    return this.web3[network];
  }

  canCallSigner(action, account) {
    for (const signer of this.signers) {
      if (account === signer.id || (signer.isAvailable() && signer.hasAccount(account))) {
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
      if (account === signer.id) {
        return signer.invoke(action, ...params);
      }
    }
    throw new Error(`Unable to find signer for ${account}`);
  }


  addHistoryEvent(eventProps) {
    const event = new HistoryEvent(eventProps, this.assets);
    this.history.addEvent(event);
  }

  getHistoryEvents(options) {
    return this.history.getEvents(options);
  }

  onHistoryEvent(listener) {
    this.history.onEvent(listener);
  }

  removeHistoryEventListener(listener) {
    this.history.removeListener(listener);
  }

  start() {
    Object.values(this.providers).forEach(provider => start.start());
    Object.values(this.gateways).forEach(gateway => gateway.start && gateway.start());
    this.assets.forEach(asset => asset.start && asset.start());
  }

  stop() {
    Object.values(this.providers).forEach(provider => provider.stop());
    Object.values(this.gateways).forEach(gateway => gateway.stop());
    this.assets.forEach(asset => asset.stop && asset.stop());
  }
}

module.exports = BurnerCore;
