class HistoryEvent {
  constructor(props, assets) {
    this.asset = props.asset;
    this.receivingAsset = props.receivingAsset;
    this.type = props.type;
    this.value = props.value;
    this.message = props.message || null;
    this.from = props.from;
    this.to = props.to;
    this.tx = props.tx;
    this.timestamp = props.timestamp;

    this.assets = assets;
  }

  getAsset() {
    const [asset] = this.assets.filter(_asset => _asset.id === this.asset);
    return asset || null;
  }

  getReceivingAsset() {
    if (!this.receivingAsset) {
      return null;
    }
    const [asset] = this.assets.filter(_asset => _asset.id === this.receivingAsset);
    return asset || null;
  }

  toJSON() {
    const { assets, ...json } = this;
    return json;
  }
}

module.exports = HistoryEvent;
