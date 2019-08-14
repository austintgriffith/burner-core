class HistoryEvent {
  constructor(props) {
    this.asset = props.asset;
    this.receivingAsset = props.receivingAsset;
    this.type = props.type;
    this.amount = props.amount;
    this.message = props.message || null;
    this.from = props.from;
    this.to = props.to;
    this.tx = props.tx;
    this.timestamp = props.timestamp;
  }

  toJSON() {
    return JSON.stringify({
      asset: this.asset,
      receivingAsset: this.receivingAsset,
      type: this.type,
      amount: this.amount,
      message: this.message,
      from: this.from,
      to: this.to,
      tx: this.tx,
      timestamp: this.timestamp,
    });
  }
}

module.exports = HistoryEvent;
