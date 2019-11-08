const abi = require('../abi/IRelayRecipient.json');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const SAMPLE_DATA = '0x9bd9bbc600000000000000000000000095065dda67b45188a131674ad9dc0bf075238de2000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000';

module.exports = async function canRelay(web3, contractAddress, fromAddress) {
  const contract = new web3.eth.Contract(abi, contractAddress);

  try {
    const response = await contract.methods
      .acceptRelayedCall(ZERO_ADDRESS, fromAddress, SAMPLE_DATA, '12', '5000000', '1100000000', '0', '0x0', '0')
      .call();
    return response['0'] === '0';
  } catch (e) {
    return false;
  }
}
