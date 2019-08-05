const ERC20Asset = require('./ERC20Asset');
const IERC777abi = require('./abi/IERC777.json');
const canRelay = require('./utils/canRelay');

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


  async _send({ from, to, value, message }) {
    const web3 = this.getWeb3();
    const messageHex = message ? this.getWeb3().utils.fromUtf8(message) : '0x';
    const gasless = await canRelay(web3, this.address, from);
    const contract = gasless ? this.getGaslessContract() : this.getContract();
    return await contract.methods.send(to, value, messageHex).send({ from });
  }
}

module.exports = ERC777Asset;
