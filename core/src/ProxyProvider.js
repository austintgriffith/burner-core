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
        },
        signTypedMessage({ data, from }, cb) {
          core.signMsg(data, from, 'typed')
            .then(signature => cb(null, signature))
            .catch(err => cb(err));
        },
      })
    );

    //this.engine.addProvider(new GaspriceProvider());
    this.engine.addProvider(new NonceSubProvider());
    this.engine.addProvider(new FiltersSubprovider());

    this.engine.addProvider({
      handleRequest(payload, next, end) {
        // Workaround for https://github.com/MetaMask/eth-block-tracker/pull/42
        let fakeId = false;
        if (payload.id === 1) {
          payload.id = Math.floor(Math.random() * 10000000000);
          fakeId = 1;
        }

        core.handleRequest(network, payload)
          .then(result => {
            try {
              if (payload.method === 'eth_sendRawTransaction' && payload.params[0].signedTransaction) {
                payload.params = [payload.params[0].signedTransaction];
              }

              end(null, result);
            } catch (err) {
              if (err.message !== 'Could not find block') {
                throw err;
              }
            }
          })
          .catch(err => end(err));
      },
      setEngine() {},
    });

    this.engine.start();
  }

  stop() {
    this.engine.stop();
  }

  start() {
    this.engine.start();
  }

  sendAsync(...args) {
    this.engine.sendAsync.apply(this.engine, args);
  }

  send(...args) {
    return this.engine.send.apply(this.engine, args);
  }
}

module.exports = ProxyProvider;
