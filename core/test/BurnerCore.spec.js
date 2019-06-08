const { expect } = require('chai');
require('dotenv').config();
const { dai, xdai, eth } = require('../../assets/');
const BurnerCore = require('../src/BurnerCore');
const InjectedGateway = require('../src/gateways/InjectedGateway');
const LocalSigner = require('../src/signers/LocalSigner');

describe('BurnerCore', () => {
  describe('signer actions', () => {
    const TEST_PK = '0x2054d094925e481cb81db7aae12fd498c95c6d20e8f998b62cbccfc18d22d5c9';
    const TEST_ACCOUNT = '0x82e1dd26775c36589ca39516b34f47cffc9066d1';

    it('should get appropriate permissions from the LocalSigner', () => {
      const core = new BurnerCore({
        signers: [new LocalSigner({ privateKey: TEST_PK, saveKey: false })],
        gateways: [new InjectedGateway()],
      });

      expect(core.canCallSigner('readKey', 'invalidAccount')).to.be.false;
      expect(core.canCallSigner('invalidAction', TEST_ACCOUNT)).to.be.false;

      expect(core.canCallSigner('readKey', TEST_ACCOUNT)).to.be.true;
      expect(core.canCallSigner('writeKey', TEST_ACCOUNT)).to.be.true;
      expect(core.canCallSigner('burn', TEST_ACCOUNT)).to.be.true;
    });

    it('should invoke the signer correctly', () => {
      const core = new BurnerCore({
        signers: [new LocalSigner({ privateKey: TEST_PK, saveKey: false })],
        gateways: [new InjectedGateway()],
      });

      core.callSigner('writeKey', TEST_ACCOUNT, '0xc95c6d20e8f998b2054d049862cbccfc18d22d5c994925e481cb81db7aae12fd');

      const [newAccount] = core.getAccounts();
      expect(newAccount).to.be.equal('0x7501833200a6BC6052D6f42294fc85aE9db148eA');
    });
  });
});
