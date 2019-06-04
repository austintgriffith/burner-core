const { toWei } = require('web3-utils');
const Asset = require('./Asset');

class NativeAsset extends Asset {
  getBalance(account) {
    return this.core.getWeb3(this.network).eth.getBalance(account);
  }

  send(params) {
    if (params.ether) {
      params.value = toWei(params.ether, 'ether');
      delete params.ether;
    }
    // TODO: Better gas calculation
    params.gasPrice = params.gasPrice || '0x3b9aca00'; // 1 gwei

    return this.core.getWeb3(this.network).eth.sendTransaction(params);
  }

  async getTx(txHash) {
    const web3 = this.core.getWeb3(this.network);
    const [tx, receipt] = await Promise.all([
      web3.eth.getTransaction(txHash),
      web3.eth.getTransactionReceipt(txHash),
    ]);

    return {
      assetName: this.name,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      displayValue: this.getDisplayValue(tx.value),
    };
  }
}

module.exports = NativeAsset;
