const { expect } = require('chai');
require('dotenv').config();
const BurnerCore = require('../src/BurnerCore');
const eth = require('../src/assets/eth');
const xdai = require('../src/assets/xdai');
const dai = require('../src/assets/dai');
const InfuraGateway = require('../src/relayers/InfuraGateway');
const XDaiGateway = require('../src/relayers/XDaiGateway');

describe('burner-core', () => {
  let core;

  afterEach(() => core && core.stop());

  it('Should fetch ETH balance from infura', async () => {
    const infuraGateway = new InfuraGateway(process.env.INFURA_KEY);
    core = new BurnerCore({
      relayers: [infuraGateway],
      assets: [eth],
    });
    const balance = await eth.getBalance('0x863df6bfa4469f3ead0be8f9f2aae51c91a907b4');
    expect(balance).is.equal('2524159265358979');
  }).timeout(5000);

  it('Should fetch xDai balance', async () => {
    const xDaiGateway = new XDaiGateway();
    core = new BurnerCore({
      relayers: [xDaiGateway],
      assets: [xdai],
    });
    const balance = await xdai.getBalance('0x58d8c3D70ce4FA4b9fb10a665C8712238746F2ff');
    expect(balance).is.equal('10000000000000000000');
  }).timeout(5000);

  it('Should fetch Dai balance', async () => {
    const infuraGateway = new InfuraGateway(process.env.INFURA_KEY);
    core = new BurnerCore({
      relayers: [infuraGateway],
      assets: [dai],
    });
    const balance = await dai.getBalance('0x68282da49ee6f3abbcc93a20ddc96e0e8b89d871');
    expect(balance).is.equal('1500000000000000000');
  }).timeout(5000);
});
