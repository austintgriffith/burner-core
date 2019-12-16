const { expect } = require('chai');
const InjectedSigner = require('../../src/signers/InjectedSigner');

const TEST_ACCOUNT = '0x82e1dD26775C36589CA39516B34f47cffc9066d1';

describe('InjectedSigner', () => {
  it('should enable the signer', async () => {
    const injectedSigner = new InjectedSigner({
      provider: {
        enable() {
          this.enabled = true;
          return Promise.resolve();
        },
        send({ method, id }, cb) {
          switch (method) {
            case 'eth_accounts':
              return cb(null, { jsonrpc: '2.0', result: this.enabled ? [TEST_ACCOUNT] : [], id });
            default:
              console.log(`Unhandled ${method}`);
              return Promise.reject();
          }
        },
      },
    });

    expect(injectedSigner.permissions()).to.contain('enable');
    await injectedSigner.enable();
    expect(injectedSigner.getAccounts()[0]).to.equal(TEST_ACCOUNT)
    expect(injectedSigner.permissions()).to.not.contain('enable');
  });

  it('should graciously handle no provider', () => {
    const injectedSigner = new InjectedSigner();
    expect(injectedSigner.isAvailable()).to.be.false;
    expect(injectedSigner.permissions().length).to.equal(0);
  });
});
