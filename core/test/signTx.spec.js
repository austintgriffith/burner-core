const { expect } = require('chai');
require('dotenv').config();
const { eth } = require('@burner-wallet/assets');
const BurnerCore = require('../src/BurnerCore');
const LocalSigner = require('../src/signers/LocalSigner');
const TestGateway = require('./TestGateway');

describe('burner-core', () => {
  let core;

  afterEach(() => core && core.stop());

  it('Should sign a send tx', (done) => {
    const testGateway = new TestGateway();
    testGateway.addResponder('eth_sendRawTransaction', ([signedTx]) => {
      expect(signedTx).to.equal('0xf8638001841000000094850656b87663c4a1ab9bcc16671e73acf2dc1db78203e88025a053e910ce12b687e9697ac704dfa12862d10a8d2b9857bee31dba0818c078d343a045fc73bd56035efa3c2baa15bc32cb8cc48fbd261ea678b769595ec3ef64944f');
      done();
      return '0x1';
    });
    testGateway.addResponder('eth_getTransactionReceipt', () => ({ status: '1' }));
    testGateway.addResponder('eth_getTransactionCount', () => 0);

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
