const { expect } = require('chai');
const Asset = require('../src/Asset');

describe('Asset', () => {
  it('should convert display balances correctly', () => {
    const normalAsset = new Asset({ id: 'test', name: 'test', network: '1337' });
    expect(normalAsset.getDisplayValue('10000000000000000000')).to.equal('10');
    expect(normalAsset.getDisplayValue('10050000000000000000')).to.equal('10.05');

    const twoDecimalAsset = new Asset({ decimals: 2, id: 'test', name: 'test', network: '1337' });
    expect(twoDecimalAsset.getDisplayValue('1000')).to.equal('10');
    expect(twoDecimalAsset.getDisplayValue('1005')).to.equal('10.05');
  });
});
