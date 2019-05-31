const { expect } = require('chai');
const LocalSigner = require('../../src/signers/LocalSigner');

describe('LocalSigner', () => {
  it('should sign transactions with a private key', async () => {
    const tx = {
      from: '0x82e1dd26775c36589ca39516b34f47cffc9066d1',
      to: '0x850656b87663c4a1ab9bcc16671e73acf2dc1db7',
      value: '0x3e8',
      gasPrice: '0x1',
      nonce: 0,
      gas: '0x10000000',
      chainId: '1',
    };
    const localSigner = new LocalSigner({
      privateKey: '0x2054d094925e481cb81db7aae12fd498c95c6d20e8f998b62cbccfc18d22d5c9',
    });
    const result = await localSigner.signTx(tx);
    expect(result).to.equal('0xf8638001841000000094850656b87663c4a1ab9bcc16671e73acf2dc1db78203e88026a0c237b952a11584e6423a624d560314907e38024fe81f75d333b8885429e28bc5a04fa05a29696b7999edfcdb7e2ad2727f5374ae81f8fd04fd1499fe2297420f2f');
  });
});
