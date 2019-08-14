const { expect } = require('chai');
const ERC20Asset = require('../src/ERC20Asset');

const ACCOUNT1 = '0x1010101010101010101010101010101010101010';
const ACCOUNT2 = '0x0000000000000000000000000000000000000001';
const TX_HASH = '0x376565f5614bd4483fd716c441aff43446b50f7772bef75496edef7faa070a85';
const ONE_ETH = '1000000000000000000';

describe('ERC20Asset', (done) => {
  it('should add an event when sent', (done) => {
    const asset = new ERC20Asset({
      id: 'test',
      name: 'Test',
      network: '5777',
      address: '0xcbfaa26289d24a6b4c5fe562bdd9a1b623260359',
    });

    asset.setCore({
      addHistoryEvent(event) {
        expect(event.asset).to.equal('test');
        expect(event.type).to.equal('send');
        expect(event.amount).to.equal(ONE_ETH);
        expect(event.from).to.equal(ACCOUNT2);
        expect(event.to).to.equal(ACCOUNT1);
        expect(event.tx).to.equal(TX_HASH);
        done();
      },
      getWeb3: () => ({
        eth: {
          Contract: function Contract() {
            this.methods = {
              transfer(to, value) {
                return {
                  send({ from }) {
                    return {
                      hash: TX_HASH,
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
    const asset = new ERC20Asset({
      id: 'test',
      name: 'Test',
      network: '5777',
      address: '0xcbfaa26289d24a6b4c5fe562bdd9a1b623260359',
    });

    let numEvents = 0;

    asset.setCore({
      addHistoryEvent(event) {
        expect(event.asset).to.equal('test');
        expect(event.type).to.equal('send');
        expect(event.amount).to.equal(ONE_ETH);
        expect(event.from).to.equal(ACCOUNT2);
        expect(event.to).to.equal(ACCOUNT1);
        expect(event.tx).to.equal(TX_HASH);
        numEvents++;
      },
      getWeb3: () => ({
        eth: {
          Contract: function Contract() {
            this.events = {
              Transfer: ({ filter }) => {
                expect(filter.to).to.equal(ACCOUNT1);
                const emitter = {
                  on(event, cb) {
                    if (event === 'data') {
                      cb({
                        event: 'Transfer',
                        returnValues: {
                          to: ACCOUNT1,
                          from: ACCOUNT2,
                          value: ONE_ETH,
                        },
                        transactionHash: TX_HASH,
                      });
                    }
                    return emitter;
                  },
                  unsubscribe() {
                    expect(numEvents).to.equal(1);
                    done();
                  }
                };
                return emitter;
              }
            }
          },
        },
      })
    });

    const unsubscribe = asset.startWatchingAddress(ACCOUNT1);
    unsubscribe();
  });
});
