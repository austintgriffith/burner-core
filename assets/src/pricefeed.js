require('isomorphic-fetch');

const assets = {};

let cacheExpiration = 10 * 1000;

class AssetPrice {
  constructor(symbol) {
    this.symbol = symbol;
    this.lastFetch = 0;
    this.lastPrice = null;
  }

  async getPrice() {
    if (Date.now() - this.lastFetch < cacheExpiration) {
      return this.lastPrice;
    }
    const price = this.fetchPrice();
    this.lastPrice = price;
    this.lastFetch = Date.now();
    return price;
  }

  async fetchPrice() {
    const symbol = this.symbol.toUpperCase();
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`;
    const result = await fetch(url);
    const data = await result.json();
    return data.USD;
  }
}

module.exports.getPrice = async function getPrice(symbol) {
  if (!assets[symbol]) {
    assets[symbol] = new AssetPrice(symbol);
  }
  return assets[symbol].getPrice();
}
