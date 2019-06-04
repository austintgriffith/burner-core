const Gateway = require('../src/gateways/Gateway');

class TestGateway extends Gateway {
  constructor() {
    super();
    this.responders = {
      eth_blockNumber: () => 1,
      eth_getBlockByNumber: () => ({
        number: '0x1',
        hash: '0x7a9b44fdf6b1aa6289846dba45ad66c870a60380fc44f77f79bb80d9d173d492',
        parentHash: '0x84e4d9d07c4ddec44cf87c4a5b7b7b2d3842ace46ba49d535bf5339eed522962',
        logsBloom: '0x68109404142ad404406e95a01854f0912a42a0ad19e9141ed2019144560c10aba068d109089146d0209d211220484014da5c00068e8a4c412c63274178d28411809718d0a7123763c4947a0d102110a60eb8a302107041a800002025a5710089904c8902ca01b20502092200a0041400b2e0b20008402c525331c173c194800a74697d50090530075804124e820000940c8805e1479202340370c0c240422061440219346004010d30f782a04150a550601302028901000382091428026c300d50892a068107280a2064041177a84ca40a4b01a0a589852d9a4042a2e05981432481e4806cc0b5488600011f5916c200d04782a18300164536580e0880b44484',
        transactionsRoot: '0x6f9b7c7f33d3d4478c92e997cbbe4e0b670e97610fd5b8bd326fc816ca895347',
        stateRoot: '0x9d3920d2d5621d6bb656a6af9f49b9b993de9cf0333b52ae1eeb80aa6b7cd75b',
        receiptsRoot: '0xa484656bba72c5f0391a24f7a1b70aec93ab95816ce8413766af01bfb66eca31',
        difficulty: '0x760d4d03a3c25',
        totalDifficulty: '0x234ae6f94af09a71f87',
        gasLimit: '0x7a30a0',
        gasUsed: '0x78a32a',
        timestamp: '0x5cf0e866',
        transactions: [],
        uncles: [],
      }),
      eth_gasPrice: () => '0x1',
      eth_getTransactionCount: () => 0,
      eth_estimateGas: () => '0x10000000',
    }
  }

  isAvailable() {
    return true;
  }

  getNetworks() {
    return [...Array(200).keys()].map(num => num.toString());
  }

  addResponder(method, fn) {
    this.responders[method] = fn;
  }

  async send(network, { method, params, id }) {
    if (!this.responders[method]) {
      throw new Error(`TestGateway: No response for method ${method}`);
    }
    return this.responders[method](params);
  }
}

module.exports = TestGateway;
