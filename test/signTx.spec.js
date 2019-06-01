const { expect } = require('chai');
require('dotenv').config();
const BurnerCore = require('../src/BurnerCore');
const eth = require('../src/assets/eth');
const LocalSigner = require('../src/signers/LocalSigner');
const TestGateway = require('./TestGateway');

describe('burner-core', () => {
  let core;

  afterEach(() => core && core.stop());

  it('Should sign a send tx', (done) => {
    const testGateway = new TestGateway();
    testGateway.addResponder('eth_sendRawTransaction', ([signedTx]) => {
      expect(signedTx).to.equal('0xf8638001841000000094850656b87663c4a1ab9bcc16671e73acf2dc1db78203e88026a0c237b952a11584e6423a624d560314907e38024fe81f75d333b8885429e28bc5a04fa05a29696b7999edfcdb7e2ad2727f5374ae81f8fd04fd1499fe2297420f2f');
      done();
      return '0x1';
    });
    testGateway.addResponder('eth_getTransactionReceipt', () => {});

    const localSigner = new LocalSigner({
      privateKey: '0x2054d094925e481cb81db7aae12fd498c95c6d20e8f998b62cbccfc18d22d5c9',
    });
    core = new BurnerCore({
      relayers: [testGateway],
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
