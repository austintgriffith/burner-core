const ERC20Asset = require('./ERC20Asset');
const IERC777abi = require('./abi/IERC777.json');
const canRelay = require('./utils/canRelay');

const BLOCK_LOOKBACK = 250;

class ERC777Asset extends ERC20Asset {
  constructor({ abi=IERC777abi, ...params }) {
    super({ ...params, type: 'erc777' });
    this.abi = abi;
    this._gaslessContract = null;
  }

  supportsMessages() {
    return true;
  }

  getGaslessContract() {
    if (!this._gaslessContract) {
      const Contract = this.getWeb3({ gasless: true }).eth.Contract;
      this._gaslessContract = new Contract(this.abi, this.address);
    }
    return this._gaslessContract;
  }

  async getTx(txHash) {
    const events = await this._getEventsFromTx(txHash);
    const [transferEvent] = events.filter(event => event.event === 'Sent');

    return {
      assetName: this.name,
      from: transferEvent.returnValues.from,
      to: transferEvent.returnValues.to,
      value: transferEvent.returnValues.amount.toString(),
      displayValue: this.getDisplayValue(transferEvent.returnValues.amount.toString()),
      message: transferEvent.returnValues.data
        ? this.getWeb3().utils.toUtf8(transferEvent.returnValues.data)
        : null,
    };
  }

  startWatchingAddress(address) {
    let running = true;

    let block = 0;
    const poll = async () => {
      if (!running) {
        return;
      }
      try {
        const currentBlock = await this.getWeb3().eth.getBlockNumber();
        if (block === 0) {
          block = currentBlock - BLOCK_LOOKBACK;
        }

        const events = await this.getContract().getPastEvents('Sent', {
          filter: { to: address },
          fromBlock: block,
          toBlock: currentBlock,
        });
        events.forEach(event => this.core.addHistoryEvent({
          asset: this.id,
          type: 'send',
          value: event.returnValues.amount.toString(),
          from: event.returnValues.from,
          to: event.returnValues.to,
          message: event.returnValues.data
            ? this.getWeb3().utils.toUtf8(event.returnValues.data)
            : null,
          tx: event.transactionHash,
          // TODO: timestamp,
        }));

        block = currentBlock;
      } catch (e) {
        console.warn('Polling Address failed', e);
      }
      setTimeout(poll, this._pollInterval);
    };

    poll();

    const unsubscribe = () => {
      running = false;
    };
    this.cleanupFunctions.push(unsubscribe);
    return unsubscribe;
  }

  async _send({ from, to, value, message }) {
    const web3 = this.getWeb3();
    const messageHex = message ? this.getWeb3().utils.fromUtf8(message) : '0x';
    const gasless = await canRelay(web3, this.address, from);
    const contract = gasless ? this.getGaslessContract() : this.getContract();
    const receipt = await contract.methods.send(to, value, messageHex).send({ from });
    return {
      ...receipt,
      txHash: receipt.hash,
    };
  }
}

module.exports = ERC777Asset;