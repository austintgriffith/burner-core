const ProviderEngine = require("web3-provider-engine");
const FiltersSubprovider = require("web3-provider-engine/subproviders/filters.js");
const NonceSubProvider = require("web3-provider-engine/subproviders/nonce-tracker.js");
const HookedSubprovider = require("web3-provider-engine/subproviders/hooked-wallet.js");
const ProviderSubprovider = require("web3-provider-engine/subproviders/provider.js");

class ProxyProvider {
  constructor(network, core) {
    this.network = network;
    this.core = core;

    this.engine = new ProviderEngine();

    this.engine.addProvider({
      async handleRequest(payload, next, end) {
        try {
          if (payload.method === 'eth_sendTransaction'
              && core.shouldSkipSigning(network, payload.params[0])) {
            const result = await core.handleRequest(network, payload);
            end(null, result);
          } else {
            next();
          }
        } catch (err) {
          end(err);
        }
      },
      setEngine() {},
    });

    this.engine.addProvider(
      new HookedSubprovider({
        async getAccounts(cb) {
          try {
            cb(null, await core.getAccounts());
          } catch (err) {
            cb(err)
          }
        },
        signTransaction(txParams, cb) {
          txParams.chainId = +network;
          core.signTx(txParams)
            .then(signedTx => cb(null, signedTx))
            .catch(err => cb(err));
        },
        signMessage({ data, from }, cb) {
          core.signMsg(data, from)
            .then(signature => cb(null, signature))
            .catch(err => cb(err));
        },
        signPersonalMessage({ data, from }, cb) {
          core.signMsg(data, from)
            .then(signature => cb(null, signature))
            .catch(err => cb(err));
        }
      })
    );

    //this.engine.addProvider(new GaspriceProvider());
    this.engine.addProvider(new NonceSubProvider());
    this.engine.addProvider(new FiltersSubprovider());

    this.engine.addProvider({
      async handleRequest(payload, next, end) {
        try {
          const result = await core.handleRequest(network, payload);
          end(null, result);
        } catch (err) {
          end(err);
        }
      },
      setEngine() {},
    });

    this.engine.start();
  }

  stop() {
    this.engine.stop();
  }

  sendAsync(...args) {
    this.engine.sendAsync.apply(this.engine, args);
  }

  send(...args) {
    return this.engine.send.apply(this.engine, args);
  }
}

module.exports = ProxyProvider;
