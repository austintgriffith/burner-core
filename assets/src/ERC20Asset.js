const Asset = require('./Asset');
const IERC20abi = require('./abi/IERC20.json');

class ERC20Asset extends Asset {
  constructor({ address, abi=IERC20abi, ...params }) {
    super(params);
    this.address = address;
    this.abi = abi;
    this._contract = null;
  }

  async getBalance(account) {
    const balance = await this.getContract().methods.balanceOf(account).call();
    return balance.toString();
  }

  getContract() {
    if (!this._contract) {
      const Contract = this.getWeb3().eth.Contract;
      this._contract = new Contract(this.abi, this.address);
    }
    return this._contract;
  }
}

module.exports = ERC20Asset;
