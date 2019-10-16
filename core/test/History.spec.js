const { expect } = require('chai');

const History = require('../src/History');
const HistoryEvent = require('../src/HistoryEvent');

describe('History', () => {
  const TEST_TX_1 = '0x7a9b44fdf6b1aa6289846dba45ad66c870a60380fc44f77f79bb80d9d173d492';
  const TEST_TX_2 = '0x870a60380fc44f77f79bb80d9d16b1aa6289846dba73d4927a9b44fdf45ad66c';
  const TEST_TX_3 = '0xd9d173d4927a9b44f66c870a60380fc44df6b1aa6289846dba45adf77f79bb80';
  const TEST_ACCOUNT_1 = '0x82e1dd26775c36589ca39516b34f47cffc9066d1';
  const TEST_ACCOUNT_2 = '0x7501833200a6BC6052D6f42294fc85aE9db148eA';
  const TEST_ACCOUNT_3 = '0xf42294fc85aE9db148eA7501833200a6BC6052D6';

  const event1 = new HistoryEvent({
    id: TEST_TX_1,
    asset: 'test',
    type: 'send',
    value: '100000',
    from: TEST_ACCOUNT_1,
    to: TEST_ACCOUNT_2,
    tx: TEST_TX_1,
    timestamp: '300',
  });
  const event2 = new HistoryEvent({
    id: TEST_TX_2,
    asset: 'test',
    type: 'send',
    value: '100000',
    from: TEST_ACCOUNT_3,
    to: TEST_ACCOUNT_1,
    tx: TEST_TX_2,
    timestamp: '100',
  });
  const event3 = new HistoryEvent({
    id: TEST_TX_3,
    asset: 'test2',
    type: 'send',
    value: '100000',
    from: TEST_ACCOUNT_3,
    to: TEST_ACCOUNT_2,
    tx: TEST_TX_3,
    timestamp: '200',
  });

  it('should sort events by timestamp', () => {
    const history = new History({ storeHistory: false });
    history.addEvent(event1);
    history.addEvent(event2);
    history.addEvent(event3);

    const events = history.getEvents();
    expect(events.length).to.equal(3);
    expect(events[0]).to.equal(event1);
    expect(events[1]).to.equal(event3);
    expect(events[2]).to.equal(event2);
  });

  describe('should filter events when fetching', () => {
    const history = new History({ storeHistory: false });
    history.addEvent(event1);
    history.addEvent(event2);
    history.addEvent(event3);

    it('should filter by account', () => {
      const events = history.getEvents({ account: TEST_ACCOUNT_1 });
      expect(events.length).to.equal(2);
      expect(events[0]).to.equal(event1);
      expect(events[1]).to.equal(event2);
    });

    it('should filter by type', () => {
      const events = history.getEvents({ asset: 'test' });
      expect(events.length).to.equal(2);
      expect(events[0]).to.equal(event1);
      expect(events[1]).to.equal(event2);
    });
  });

  it('should prevent duplicate events from being added to the history', () => {
    const history = new History({ storeHistory: false });
    history.addEvent(event1);
    history.addEvent(event1);

    const events = history.getEvents();
    expect(events.length).to.equal(1);
  });
});
