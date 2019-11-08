const { toBN } = require('web3-utils');
const Asset = require('./Asset');

const POLL_INTERVAL = 2500;

class NativeAsset extends Asset {
  constructor({ pollInterval=POLL_INTERVAL, ...props }) {
    super({ ...props, type: 'native' });
    this._pollInterval = pollInterval;
  }

  getBalance(account) {
    return this.getWeb3().eth.getBalance(account);
  }

  supportsMessages() {
    return true;
  }

  startWatchingAddress(address) {
    let block = 0;
    let balance = 0;
    return this.poll(async () => {
      const web3 = this.getWeb3();
      const [currentBlock, currentBalance] = await Promise.all([
        web3.eth.getBlockNumber(),
        web3.eth.getBalance(address),
      ]);

      if (block !== 0 && balance !== currentBalance) {
        const offsetBalance = web3.utils.toBN(balance)
          .add(web3.utils.toBN(this.getBalanceDelta(address, block + 1, currentBlock)));
        if (offsetBalance !== currentBalance) {
          await this.scanBlocks(address, block + 1, currentBlock)
        }
      }

      block = currentBlock;
      balance = currentBalance;
    }, this._pollInterval);
  }

  async scanBlocks(address, startBlock, toBlock) {
    const _address = address.toLowerCase();
    const web3 = this.getWeb3();
    const blockNums = [];
    for (let blockNum = startBlock; blockNum <= toBlock; blockNum += 1) {
      blockNums.push(blockNum);
    }

    await Promise.all(blockNums.map(async blockNum => {
      const block = await web3.eth.getBlock(blockNum);
      await Promise.all(block.transactions.map(async txHash => {
        const tx = await web3.eth.getTransaction(txHash);
        if (tx.value !== '0' && tx.to.toLowerCase() === _address) {
          this.core.addHistoryEvent({
            id: tx.hash,
            asset: this.id,
            type: 'send',
            value: tx.value,
            from: tx.from,
            to: tx.to,
            message: tx.input.length > 2 ? web3.utils.toUtf8(tx.input) : null,
            tx: tx.hash,
            timestamp: block.timestamp,
          });
        }
      }));
    }));
  }

  getBalanceDelta(address, startBlock, endBlock) {
    const web3 = this.getWeb3();
    return this.core.getHistoryEvents({ asset: this.id, fromBlock: startBlock, toBlock: endBlock })
      .filter(event => event.to === address || event.from === address)
      .reduce((reducer, event) => event.to === address
        ? web3.utils.toBN(reducer).add(web3.utils.toBN(event.value))
        : web3.utils.toBN(reducer).sub(web3.utils.toBN(event.value)), '0');
  }

  async getSendFee(from) {
    const web3 = this.getWeb3();
    const [gas, gasPrice] = await Promise.all([
      web3.eth.estimateGas({
        from,
        to: '0x0000000000000000000000000000000000000000',
        value: '1',
      }),
      web3.eth.getGasPrice(),
    ]);
    return toBN(gas).mul(toBN(gasPrice)).toString();
  }

  async _send({ message, ...params }) {
    const web3 = this.getWeb3();
    const data = message ? web3.utils.fromUtf8(message) : undefined;
    const receipt = await web3.eth.sendTransaction({ data, ...params });
    return {
      ...receipt,
      txHash: receipt.transactionHash,
      id: receipt.transactionHash,
    };
  }

  async getTx(txHash) {
    const web3 = this.getWeb3();
    const tx = await web3.eth.getTransaction(txHash);
    if (!tx) {
      return null;
    }

    return {
      asset: this.id,
      assetName: this.name,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      displayValue: this.getDisplayValue(tx.value),
      message: tx.input.length > 2 ? web3.utils.toUtf8(tx.input) : null,
      timestamp: await this._getBlockTimestamp(tx.blockNumber),
    };
  }
}

module.exports = NativeAsset;
