const Asset = require('./Asset');

class NativeAsset extends Asset {
  constructor(props) {
    super({ ...props, type: 'native' });
  }

  getBalance(account) {
    return this.getWeb3().eth.getBalance(account);
  }

  supportsMessages() {
    return true;
  }

  async _send({ message, ...params }) {
    const web3 = this.getWeb3();
    const data = message ? web3.utils.fromUtf8(message) : undefined;
    const receipt = await web3.eth.sendTransaction({ data, ...params });
    return {
      ...receipt,
      txHash: receipt.transactionHash,
    };
  }

  async getTx(txHash) {
    const web3 = this.getWeb3();
    const tx = await web3.eth.getTransaction(txHash);

    return {
      assetName: this.name,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      displayValue: this.getDisplayValue(tx.value),
      message: tx.input.length > 2 ? web3.utils.toUtf8(tx.input) : null,
    };
  }
}

module.exports = NativeAsset;
