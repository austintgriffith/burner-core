const { expect } = require('chai');
const BurnerCore = require('../src/BurnerCore');
const { LocalSigner } = require('../src/signers');
const { Gateway } = require('../src/gateways');
const ganache = require('ganache-core');
const { toWei } = require('web3-utils');

const TEST_PK = '0x2054d094925e481cb81db7aae12fd498c95c6d20e8f998b62cbccfc18d22d5c9';
const TEST_ACCOUNT = '0x82e1dd26775c36589ca39516b34f47cffc9066d1';
const TEST_ACCOUNT_2 = '0x7501833200a6BC6052D6f42294fc85aE9db148eA';

class GanacheGateway extends Gateway {
  constructor() {
    super(['5777']);
    this.provider = ganache.provider({
      accounts: [
        { balance: toWei('1', 'ether'), secretKey: TEST_PK },
      ],
    });
  }

  isAvailable() {
    return true;
  }

  send(network, payload) {
    return new Promise((resolve, reject) => {
      this.provider.send(payload, (err, response) => {
        if (err) {
          return reject(err);
        }

        return resolve(response.result);
      });
    });
  }

  stop() {}
}

describe('Integration Test', () => {
  let gateway = new GanacheGateway();
  let core;

  afterEach(() => core && core.stop());

  it('send a transaction', async () => {
    core = new BurnerCore({
      signers: [new LocalSigner({ privateKey: TEST_PK, saveKey: false })],
      gateways: [gateway],
      historyOptions: { storeHistory: false },
    });

    const web3 = core.getWeb3('5777');

    await web3.eth.sendTransaction({
      from: TEST_ACCOUNT,
      to: TEST_ACCOUNT_2,
      value: '1000',
    });

    expect(await web3.eth.getBalance(TEST_ACCOUNT_2)).to.equal('1000');
  });
});
