const { expect } = require('chai');
require('dotenv').config();
const BurnerCore = require('../src/BurnerCore');
const GSNGateway = require('../src/gateways/GSNGateway');
const InfuraGateway = require('../src/gateways/InfuraGateway');
const LocalSigner = require('../src/signers/LocalSigner');
const { padLeft } = require('web3-utils');

const TEST_PK = '0x2054d094925e481cb81db7aae12fd498c95c6d20e8f998b62cbccfc18d22d5c9';
const TEST_ACCOUNT = '0x82e1dd26775c36589ca39516b34f47cffc9066d1';
const TEST_CONTRACT = '0x6e34b5119e09741021419ef8e7007ba8b5c0d96b';
const FN_TEST = '0xf8a8fd6d';

describe('Gas Staion Network', () => {
  let core;

  afterEach(() => core && core.stop());

  it('Should relay a GSN transaction on kovan', async () => {
    core = new BurnerCore({
      signers: [new LocalSigner({ privateKey: TEST_PK, saveKey: false })],
      gateways: [
        new GSNGateway(),
        new InfuraGateway(process.env.INFURA_KEY),
      ],
      historyOptions: { storeHistory: false },
    });

    const web3 = core.getWeb3('42');

    const response = await web3.eth.sendTransaction({
      from: TEST_ACCOUNT,
      to: TEST_CONTRACT,
      data: FN_TEST,
      gasPrice: '1000000000',
      useGSN: true,
    });
    
    expect(response.logs[0].data).to.equal(padLeft(TEST_ACCOUNT, 64));
  }).timeout(10000);
});
