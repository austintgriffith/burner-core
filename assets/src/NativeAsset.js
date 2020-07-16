const { toBN, toChecksumAddress, padLeft, hexToNumberString } = require('web3-utils');
const Asset = require('./Asset');

const POLL_INTERVAL = 2500;

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

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

    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock,
      address,
      topics: [TRANSFER_TOPIC],
    });
    for (let log of logs) {
      const parsedLog = this.getTransferLog([log]);
      this.core.addHistoryEvent({
        asset: this.id,
        assetName: this.name,
        type: 'send',
        from: parsedLog.args.from,
        to: parsedLog.args.to,
        value: parsedLog.args.value,
        displayValue: this.getDisplayValue(parsedLog.args.value),
        message: null,
        timestamp: await this._getBlockTimestamp(parsedLog.blockNumber),
      })
    }

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

  async getSendFee(from, to) {
    const web3 = this.getWeb3();
    const [gas, gasPrice] = await Promise.all([
      web3.eth.estimateGas({ from, to, value: '1' }).catch(() => 21000),
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
    const [tx, receipt] = await Promise.all([
      web3.eth.getTransaction(txHash),
      web3.eth.getTransactionReceipt(txHash),
    ]);

    if (!tx || !receipt) {
      return null;
    }

    if (receipt.logs.length > 0 && this.getTransferLog(receipt.logs)) {
      const log = this.getTransferLog(receipt.logs);
      return {
        asset: this.id,
        assetName: this.name,
        from: log.args.from,
        to: log.args.to,
        value: log.args.value,
        displayValue: this.getDisplayValue(log.args.value),
        message: null,
        timestamp: await this._getBlockTimestamp(log.blockNumber),
      }
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

  getTransferLog(logs) {
    for (const log of logs) {
      if (log.topics[0] === TRANSFER_TOPIC && (
        log.address === toChecksumAddress(log.topics[1].substr(26))
        || log.address === toChecksumAddress(log.topics[2].substr(26))
      )) {
        return {
          ...log,
          args: {
            from: toChecksumAddress(log.topics[1].substr(26)),
            to: toChecksumAddress(log.topics[2].substr(26)),
            value: hexToNumberString(log.data),
          },
        };
      }
    }
    return null;
  }
}

module.exports = NativeAsset;
