const { expect } = require('chai');
const Web3 = require('web3');
const NativeAsset = require('../src/NativeAsset');

const ACCOUNT1 = '0x1010101010101010101010101010101010101010';
const ACCOUNT2 = '0x0000000000000000000000000000000000000001';
const TX_HASH = '0x376565f5614bd4483fd716c441aff43446b50f7772bef75496edef7faa070a85';
const ONE_ETH = '1000000000000000000';

describe('NativeAsset', () => {
  const testCore = {
    getWeb3: () => ({
      eth: {
        getBalance: () => '1000',
        sendTransaction: params => testCore.onSend(params),
        getTransaction: () => ({
          from: ACCOUNT1,
          to: ACCOUNT2,
          value: ONE_ETH,
          input: '0x54657374',
        })
      },
      utils: Web3.utils,
    }),
  }

  it('should query balance', async () => {
    const asset = new NativeAsset({id: 'test', name: 'Test', network: '1337'});
    asset.setCore(testCore);

    const balance = await asset.getBalance(ACCOUNT1);
    expect(balance).to.equal('1000');
  });

  it('should send a transaction', done => {
    const asset = new NativeAsset({id: 'test', name: 'Test', network: '1337'});
    asset.setCore(testCore);

    testCore.onSend = params => {
      expect(params.from).to.equal(ACCOUNT2);
      expect(params.to).to.equal(ACCOUNT1);
      expect(params.value).to.equal(ONE_ETH);
      expect(params.data).to.equal('0x54657374');
      done();
    };

    asset.send({ to: ACCOUNT1, from: ACCOUNT2, ether: '1', message: 'Test' });
  });

  it('should parse queried transactions', async () => {
    const asset = new NativeAsset({id: 'test', name: 'Test', network: '1337'});
    asset.setCore(testCore);

    const tx = await asset.getTx(TX_HASH);

    expect(tx.assetName).to.equal('Test');
    expect(tx.from).to.equal(ACCOUNT1);
    expect(tx.to).to.equal(ACCOUNT2);
    expect(tx.value).to.equal(ONE_ETH);
    expect(tx.displayValue).to.equal('1');
    expect(tx.message).to.equal('Test');
  });
});
