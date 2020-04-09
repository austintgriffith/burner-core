# @burner-wallet/assets

Colection of asset classes and predefined assets to be used in Burner Wallets, as well as the
[Burner Factory](https://burnerfactory.com).

## Predefined assets

The package includes predefined assets for ETH, Dai, xDai, USDC, kETH (Kovan ETH), & kDai (Kovan Dai).

```javascript
import { eth, dai, xdai, usdc, keth, kdai } from '@burner-wallet/assets';

const core = new BurnerCore({
  signers: [new InjectedSigner(), new LocalSigner()],
  gateways: [new InfuraGateway(process.env.REACT_APP_INFURA_KEY), new XDaiGateway()],
  assets: [eth, dai, xdai, usdc, keth, kdai],
});
```

## Asset Classes

This package includes classes for defining your own assets.

Most developers will use the `ERC20Asset` for adding new assets.

### ERC20Asset

```javascript
import { ERC20Asset } from '@burner-wallet/assets';

const dai = new ERC20Asset({
  id: 'dai',
  name: 'Dai',
  network: '1',
  address: '0x6b175474e89094c44da98b954eedeac495271d0f',
  usdPrice: 1, // Optional
  icon: 'https://static.burnerfactory.com/icons/mcd.svg', // Optional
  decimals: 18,  // Optional, default is 18
});
```

### ERC777Asset

This class extends ERC20, and provides additional features, primarily the ability to include notes
in the "data" field.

The interface is the same as ERC20Asset.

### NativeAsset

Native assets represent the native asset of an EVM chain, such as ETH, Kovan ETH or xDai.

```javascript
import { NativeAsset } from '@burner-wallet/assets';

const keth = new NativeAsset({
  id: 'keth',
  name: 'kETH',
  network: '42',
});
```

### Asset

This is the base class, representing any fungible asset.

#### Constructor
  constructor({ id, name, network, usdPrice, priceSymbol }: AssetConstructor);

#### Properties
  public id: string;
  public name: string;
  public network: string;
  public type: string | null;

#### Methods

  setCore(core: any): void;
  getTx(txHash: string): Promise<any>;
  getDisplayValue(value: string, decimals?: number): string;
  getUSDValue(value: string, decimals?: number): string;
  getBalance(account: string): Promise<string>;
  getDisplayBalance(account: string, decimals?: number): Promise<string>;
  send(params: any): Promise<any>;
  supportsMessages(): boolean;
  getWeb3(): any;
  stop(): void;
