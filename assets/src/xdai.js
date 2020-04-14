const NativeAsset = require('./NativeAsset');
const IXDaiBridge = require('./abi/IXDaiBridge.json');

class XDaiNativeAsset extends NativeAsset {
  constructor(props) {
    super(props);
    this.bridgeAddress = '0x7301cfa0e1756b71869e93d4e4dca5c7d0eb0aa6';
  }

  async scanBlocks(address, fromBlock, toBlock) {
    await super.scanBlocks(address, fromBlock, toBlock);

    const web3 = this.getWeb3();
    const contract = new web3.eth.Contract(IXDaiBridge, this.bridgeAddress);
    const events = await contract.getPastEvents('AffirmationCompleted', {
      fromBlock,
      toBlock
    });
    const filteredEvents = events.filter(event => event.returnValues.recipient.toLowerCase() === address.toLowerCase());

    for (const event of filteredEvents) {
      this.core.addHistoryEvent({
        id: `${event.transactionHash}-${event.logIndex}`,
        asset: this.id,
        type: 'send',
        value: event.returnValues.value.toString(),
        from: this.bridgeAddress,
        to: event.returnValues.recipient,
        tx: event.transactionHash,
        timestamp: await this._getBlockTimestamp(event.blockNumber)
      });
    }
  }

  async getTx(txHash) {
    const historyEvents = this.core.getHistoryEvents({asset: this.id, account: this.bridgeAddress})
    const eventMatch = historyEvents.filter(e => e.tx === txHash)
    if (eventMatch.length > 0) {
      return eventMatch[0];
    } else {
      return super.getTx(txHash);
    }
  }
}

module.exports = new XDaiNativeAsset({
  id: 'xdai',
  name: 'xDai',
  network: '100',
  usdPrice: 1,
  icon: 'https://static.burnerfactory.com/icons/xdai.svg',
});
