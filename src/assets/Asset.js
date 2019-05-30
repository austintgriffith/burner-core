class Asset {
  constructor({ id, name, network, type='native' }) {
    this.id = id;
    this.name = name;
    this.network = network;
    this.type = type;
  }

  setCore(core) {
    this.core = core;
  }
}

module.exports = Asset;
