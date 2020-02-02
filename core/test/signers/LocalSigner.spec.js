const { expect } = require('chai');
const LocalSigner = require('../../src/signers/LocalSigner');

describe('LocalSigner', () => {
  const TEST_PK = '0x2054d094925e481cb81db7aae12fd498c95c6d20e8f998b62cbccfc18d22d5c9';
  const TEST_ACCOUNT = '0x82e1dd26775c36589ca39516b34f47cffc9066d1';
  const TEST_PK_2 = '0xc95c6d20e8f998b2054d049862cbccfc18d22d5c994925e481cb81db7aae12fd';
  const TEST_ACCOUNT_2 = '0x7501833200a6BC6052D6f42294fc85aE9db148eA';

  beforeEach(() => {
    const _localstorage = new Map()
    global.window = global;
    global.localStorage = {
      setItem: (key, val) => _localstorage.set(key, val),
      getItem: key => _localstorage.get(key),
    };
    global.document = { cookie: '' };
  })

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
      privateKey: TEST_PK,
      saveKey: false,
    });
    const result = await localSigner.signTx(tx);
    expect(result.signedTransaction).to.equal('0xf8638001841000000094850656b87663c4a1ab9bcc16671e73acf2dc1db78203e88025a053e910ce12b687e9697ac704dfa12862d10a8d2b9857bee31dba0818c078d343a045fc73bd56035efa3c2baa15bc32cb8cc48fbd261ea678b769595ec3ef64944f');
  });

  it('should write a PK to localstorage and cookies', async () => {
    const localSigner = new LocalSigner({ privateKey: TEST_PK });
    expect(localStorage.getItem('metaPrivateKey')).to.equal(TEST_PK);
    expect(document.cookie).to.have.string(`metaPrivateKey=${TEST_PK};`);
  });

  it('should read a PK from localstorage', async () => {
    localStorage.setItem('metaPrivateKey', TEST_PK);
    const localSigner = new LocalSigner();
    expect(localSigner.account.privateKey).to.equal(TEST_PK);
  });

  it('should read a PK from a cookie', async () => {
    document.cookie = `metaPrivateKey=${TEST_PK};expires=Sun, 14 Jun 2022 11:50:17 GMT;path=/`;
    const localSigner = new LocalSigner();
    expect(localSigner.account.privateKey).to.equal(TEST_PK);
  });

  it('should read the private key from the signer', () => {
    const localSigner = new LocalSigner({
      privateKey: TEST_PK,
      saveKey: false,
    });
    const result = localSigner.invoke('readKey','0x82e1dd26775c36589ca39516b34f47cffc9066d1');
    expect(result).to.equal(TEST_PK);
  });

  it('should preview a new private key', () => {
    const localSigner = new LocalSigner({ privateKey: TEST_PK, saveKey: false });
    const newAddress = localSigner.invoke('keyToAddress', TEST_ACCOUNT, TEST_PK_2);

    expect(newAddress).to.equal(TEST_ACCOUNT_2);
  });

  it('should set a new private key', () => {
    const localSigner = new LocalSigner({
      privateKey: TEST_PK,
      saveKey: false,
    });
    const newAccount = localSigner.invoke('writeKey', '0x82e1dd26775c36589ca39516b34f47cffc9066d1', '0xc95c6d20e8f998b2054d049862cbccfc18d22d5c994925e481cb81db7aae12fd');

    const result = localSigner.invoke('readKey', newAccount);
    expect(result).to.equal('0xc95c6d20e8f998b2054d049862cbccfc18d22d5c994925e481cb81db7aae12fd');
  });

  it('should burn the account', () => {
    const localSigner = new LocalSigner({
      privateKey: TEST_PK,
      saveKey: false,
    });
    localSigner.invoke('burn', '0x82e1dd26775c36589ca39516b34f47cffc9066d1');

    const [newAccount] = localSigner.getAccounts();

    const result = localSigner.invoke('readKey', newAccount);
    expect(newAccount).to.not.equal('0x82e1dd26775c36589ca39516b34f47cffc9066d1');
    expect(result).to.not.equal(TEST_PK);
  });

  it('should accept a gas multiplier', async () => {
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
      privateKey: TEST_PK,
      saveKey: false,
      gasMultiplier: 1.5,
    });
    const result = await localSigner.signTx(tx);
    expect(result.gas.toNumber()).to.equal(0x18000000);
  });
});
