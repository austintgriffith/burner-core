const Asset = require('./Asset');
const IERC20abi = require('./abi/IERC20.json');

class ERC20Asset extends Asset {
  constructor({ address, ...params }) {
    super(params);
    this.address = address;
    this._contract = null;
  }

  async getBalance(account) {
    const balance = await this._getContract().methods.balanceOf(account).call();
    return balance.toString();
  }

  _getContract() {
    if (!this._contract) {
      const Contract = this.core.getWeb3(this.network).eth.Contract;
      this._contract = new Contract(IERC20abi, this.address);
    }
    return this._contract;
  }
}

module.exports = ERC20Asset;
