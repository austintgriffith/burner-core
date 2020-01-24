const { expect } = require('chai');
const web3Utils = require('web3-utils');
const NativeAsset = require('../src/NativeAsset');

const ACCOUNT1 = '0x1010101010101010101010101010101010101010';
const ACCOUNT2 = '0x0000000000000000000000000000000000000001';
const TX_HASH = '0x376565f5614bd4483fd716c441aff43446b50f7772bef75496edef7faa070a85';
const ONE_ETH = '1000000000000000000';

describe('NativeAsset', () => {
  let balance, asset, blockNum, blocks;
  let transactions = {
    [TX_HASH]: {
      from: ACCOUNT1,
      to: ACCOUNT2,
      value: ONE_ETH,
      input: '0x54657374',
      hash: TX_HASH,
      blockNumber: 3,
    }
  };
  let transactionReceipts = {
    [TX_HASH]: { logs: [] },
  };

  const testCore = {
    addHistoryEvent(event) {
      testCore.onEvent && testCore.onEvent(event);
    },
    getHistoryEvents: () => [],
    getWeb3: () => ({
      eth: {
        getBalance: () => balance,
        getBlockNumber: () => blockNum,
        getBlock: blockNum => blocks[blockNum] || null,
        estimateGas: () => '21000',
        getGasPrice: () => '20000000000',
        sendTransaction: params => {
          testCore.onSend && testCore.onSend(params);
          return {
            status: true,
            transactionHash: TX_HASH,
            transactionIndex: 0,
            blockHash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
            blockNumber: 3,
            contractAddress: "0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe",
            cumulativeGasUsed: 314159,
            gasUsed: 30234,
            logs: [],
          };
        },
        getTransaction: hash => transactions[hash] || null,
        getTransactionReceipt: hash => transactionReceipts[hash] || null,
      },
      utils: web3Utils,
    }),
  }

  beforeEach(() => {
    balance = ONE_ETH;
    blockNum = 100;
    blocks = {};
    testCore.onEvent = null;
    testCore.onSend = null;
  });

  afterEach(() => asset && asset.stop());

  it('should query balance', async () => {
    asset = new NativeAsset({id: 'test', name: 'Test', network: '1337'});
    asset.setCore(testCore);

    const _balance = await asset.getBalance(ACCOUNT1);
    expect(_balance).to.equal(ONE_ETH);
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

  it('should create an event after sending', done => {
    const asset = new NativeAsset({id: 'test', name: 'Test', network: '1337'});
    asset.setCore(testCore);

    testCore.onEvent = event => {
      expect(event.asset).to.equal('test');
      expect(event.type).to.equal('send');
      expect(event.value).to.equal(ONE_ETH);
      expect(event.to).to.equal(ACCOUNT1);
      expect(event.from).to.equal(ACCOUNT2);
      expect(event.tx).to.equal(TX_HASH);
      expect(event.id).to.equal(TX_HASH);
      done();
    };

    asset.send({ to: ACCOUNT1, from: ACCOUNT2, ether: '1', message: 'Test' });
  });

  it('should parse queried transactions', async () => {
    asset = new NativeAsset({id: 'test', name: 'Test', network: '1337'});
    asset.setCore(testCore);

    blocks[3] = { timestamp: Date.now() / 1000 };

    const tx = await asset.getTx(TX_HASH);

    expect(tx.assetName).to.equal('Test');
    expect(tx.from).to.equal(ACCOUNT1);
    expect(tx.to).to.equal(ACCOUNT2);
    expect(tx.value).to.equal(ONE_ETH);
    expect(tx.displayValue).to.equal('1');
    expect(tx.message).to.equal('Test');
  });

  it('should parse queried containing a contract transfer', async () => {
    asset = new NativeAsset({id: 'test', name: 'Test', network: '1337'});
    asset.setCore(testCore);


  });

  it('should watch for receiving coins', (done) => {
    asset = new NativeAsset({ id: 'test', name: 'Test', network: '1337', pollInterval: 50 });
    asset.setCore(testCore);

    testCore.onEvent = event => {
      expect(event.asset).to.equal('test');
      expect(event.type).to.equal('send');
      expect(event.value).to.equal(ONE_ETH);
      expect(event.from).to.equal(ACCOUNT1);
      expect(event.to).to.equal(ACCOUNT2);
      expect(event.tx).to.equal(TX_HASH);
      expect(event.id).to.equal(TX_HASH);
      done();
    }

    const unsubscribe = asset.startWatchingAddress(ACCOUNT2);

    blockNum = 102;
    balance = '1000000000000001000';
    blocks[101] = {
      transactions: [TX_HASH],
      timestamp: Math.floor(Date.now() / 1000),
    };
    blocks[102] = { transactions: [] };
  });

  it('should return the maximum sendable factoring in gas', async () => {
    asset = new NativeAsset({id: 'test', name: 'Test', network: '1337'});
    asset.setCore(testCore);

    const maxSendable = await asset.getMaximumSendableBalance(ACCOUNT1);
    expect(maxSendable).to.equal('999580000000000000');
  });
});
