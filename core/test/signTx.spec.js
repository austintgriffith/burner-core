const { expect } = require('chai');
require('dotenv').config();
const { eth } = require('../../assets/');
const BurnerCore = require('../src/BurnerCore');
const LocalSigner = require('../src/signers/LocalSigner');
const TestGateway = require('./TestGateway');

describe('burner-core', () => {
  let core;

  afterEach(() => core && core.stop());

  it('Should sign a send tx', (done) => {
    const testGateway = new TestGateway();
    testGateway.addResponder('eth_sendRawTransaction', ([signedTx]) => {
      expect(signedTx).to.equal('0xf86780843b9aca00841000000094850656b87663c4a1ab9bcc16671e73acf2dc1db78203e88026a025ccc470a5c53f3a10d03a314a56af88604dbe7a082a0eadadbe4fe49275a04ba074fac66c9be5960da4c284f8b478dd4dfba87d56322b7464b8ae7974c63f429f');
      done();
      return '0x1';
    });
    testGateway.addResponder('eth_getTransactionReceipt', () => ({ status: '1' }));

    const localSigner = new LocalSigner({
      privateKey: '0x2054d094925e481cb81db7aae12fd498c95c6d20e8f998b62cbccfc18d22d5c9',
      saveKey: false,
    });
    core = new BurnerCore({
      gateways: [testGateway],
      signers: [localSigner],
      assets: [eth],
    });
    eth.send({
      from: '0x82e1dD26775C36589CA39516B34f47cffc9066d1',
      to: '0x850656b87663c4A1AB9bcC16671E73acF2DC1dB7',
      value: '1000',
    });
  });
});
