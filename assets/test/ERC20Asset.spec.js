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
        expect(event.value).to.equal(ONE_ETH);
        expect(event.from).to.equal(ACCOUNT2);
        expect(event.to).to.equal(ACCOUNT1);
        expect(event.id).to.equal(`${TX_HASH}-0`);
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
                      transactionHash: TX_HASH,
                      events: {
                        Transfer: {
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
        expect(event.value).to.equal(ONE_ETH);
        expect(event.from).to.equal(ACCOUNT2);
        expect(event.to).to.equal(ACCOUNT1);
        expect(event.tx).to.equal(TX_HASH);
        done();
      },
      getWeb3: () => ({
        eth: {
          getBlockNumber: () => 100,
          Contract: function Contract() {
            this.getPastEvents = (eventName, { filter }) => {
              expect(eventName).to.equal('Transfer');
              expect(filter.to).to.equal(ACCOUNT1);
              return [{
                event: 'Transfer',
                returnValues: {
                  to: ACCOUNT1,
                  from: ACCOUNT2,
                  value: ONE_ETH,
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

  it('should return the maximum sendable value', async () => {
    const asset = new ERC20Asset({
      id: 'test',
      name: 'Test',
      network: '5777',
      address: '0xcbfaa26289d24a6b4c5fe562bdd9a1b623260359',
    });

    asset.setCore({
      getWeb3: () => ({
        eth: {
          Contract: function Contract() {
            this.methods = {
              balanceOf: () => ({ call: () => '1000' }),
            };
          },
        },
      })
    });

    const maxSendable = await asset.getMaximumSendableBalance(ACCOUNT1);
    expect(maxSendable).to.equal('1000');
  });
});
