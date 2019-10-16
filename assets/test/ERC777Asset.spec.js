const { expect } = require('chai');
const web3Utils = require('web3-utils');
const ERC777Asset = require('../src/ERC777Asset');

const ACCOUNT1 = '0x1010101010101010101010101010101010101010';
const ACCOUNT2 = '0x0000000000000000000000000000000000000001';
const TX_HASH = '0x376565f5614bd4483fd716c441aff43446b50f7772bef75496edef7faa070a85';
const ONE_ETH = '1000000000000000000';

describe('ERC777Asset', (done) => {
  it('should add an event when sent', (done) => {
    const asset = new ERC777Asset({
      id: 'test',
      name: 'Test',
      network: '5777',
      address: '0xcbfaa26289d24a6b4c5fe562bdd9a1b623260359',
    });

    asset.setCore({
      addHistoryEvent(event) {
        expect(event.asset).to.equal('test');
        expect(event.type).to.equal('send');
        expect(event.value).to.equal(ONE_ETH);
        expect(event.from).to.equal(ACCOUNT2);
        expect(event.to).to.equal(ACCOUNT1);
        expect(event.tx).to.equal(TX_HASH);
        expect(event.id).to.equal(`${TX_HASH}-0`);
        done();
      },
      getWeb3: () => ({
        utils: web3Utils,
        eth: {
          Contract: function Contract() {
            this.methods = {
              send(to, value, data) {
                return {
                  send({ from }) {
                    return {
                      transactionHash: TX_HASH,
                      events: {
                        Sent: {
                          logIndex: 0,
                        },
                      },
                    };
                  },
                };
              },
            };
          },
        },
      })
    });

    asset.send({ to: ACCOUNT1, from: ACCOUNT2, value: ONE_ETH });
  });

  it('should watch an address and add events for new transactions', (done) => {
    const asset = new ERC777Asset({
      id: 'test',
      name: 'Test',
      network: '5777',
      address: '0xcbfaa26289d24a6b4c5fe562bdd9a1b623260359',
    });

    asset.setCore({
      addHistoryEvent(event) {
        expect(event.asset).to.equal('test');
        expect(event.type).to.equal('send');
        expect(event.value).to.equal(ONE_ETH);
        expect(event.from).to.equal(ACCOUNT2);
        expect(event.to).to.equal(ACCOUNT1);
        expect(event.tx).to.equal(TX_HASH);
        expect(event.message).to.equal('Test');
        expect(event.timestamp).to.equal(1571234034);
        done();
      },
      getWeb3: () => ({
        utils: web3Utils,
        eth: {
          getBlock: () => ({ timestamp: 1571234034 }),
          getBlockNumber: () => 100,
          Contract: function Contract() {
            this.getPastEvents = (eventName, { filter }) => {
              expect(eventName).to.equal('Sent');
              expect(filter.to).to.equal(ACCOUNT1);
              return [{
                event: 'Sent',
                returnValues: {
                  to: ACCOUNT1,
                  from: ACCOUNT2,
                  data: '0x54657374',
                  amount: ONE_ETH,
                },
                transactionHash: TX_HASH,
              }];
            }
          },
        },
      })
    });

    const unsubscribe = asset.startWatchingAddress(ACCOUNT1);
    unsubscribe();
  });
});
