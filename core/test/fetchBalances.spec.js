const { expect } = require('chai');
require('dotenv').config();
const { dai, xdai, eth } = require('@burner-wallet/assets');
const BurnerCore = require('../src/BurnerCore');
const InfuraGateway = require('../src/gateways/InfuraGateway');
const XDaiGateway = require('../src/gateways/XDaiGateway');

describe('balance fetching', () => {
  let core;

  afterEach(() => core && core.stop());

  it('Should fetch ETH balance from infura', async () => {
    const infuraGateway = new InfuraGateway(process.env.INFURA_KEY);
    core = new BurnerCore({
      gateways: [infuraGateway],
      assets: [eth],
      historyOptions: { storeHistory: false },
    });
    const balance = await eth.getBalance('0x0000000000000000000000000000000000000011');
    expect(balance).is.equal('52010000000000');
  }).timeout(5000);

  it('Should fetch xDai balance', async () => {
    const xDaiGateway = new XDaiGateway();
    core = new BurnerCore({
      gateways: [xDaiGateway],
      assets: [xdai],
      historyOptions: { storeHistory: false },
    });
    const balance = await xdai.getBalance('0x58d8c3D70ce4FA4b9fb10a665C8712238746F2ff');
    expect(balance).is.equal('10000000000000000000');
  }).timeout(5000);

  it('Should fetch Dai balance', async () => {
    const infuraGateway = new InfuraGateway(process.env.INFURA_KEY);
    core = new BurnerCore({
      gateways: [infuraGateway],
      assets: [dai],
      historyOptions: { storeHistory: false },
    });
    const balance = await dai.getBalance('0xc0332b21a8ffe950c2632c65bcbde555b568562c');
    expect(balance).is.equal('1');
  }).timeout(5000);
});
