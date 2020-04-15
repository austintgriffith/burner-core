# @burner-wallet/core

This library provides the core blockchain infrastructure for running Burner Wallets.

Unlike most Burner Wallet modules, this module is framework-agnostic and written in plain
Javascript. It should work fine in browsers, web workers and Node.

```javascript
import { xdai, dai, eth } from '@burner-wallet/assets';
import BurnerCore from '@burner-wallet/core';
import { InjectedSigner, LocalSigner } from '@burner-wallet/core/signers';
import { InfuraGateway, InjectedGateway, XDaiGateway } from '@burner-wallet/core/gateways';

const core = new BurnerCore({
  signers: [
    new InjectedSigner(),
    new LocalSigner()
  ],
  gateways: [
    new InjectedGateway(),
    new InfuraGateway(process.env.REACT_APP_INFURA_KEY),
    new XDaiGateway(),
  ],
  assets: [xdai, dai, eth],
});
```

## Documentation

For full documentation, visit https://burner-wallet.readthedocs.io/

## Burner Core

The root class facilitates communication between gateways, signers & assets. It also provides
applications with data such as a list of current addresses.

## Gateways

Gateways facilitate communication with blockchain networks.

This module contains the following gateways:

* InfuraGateway: Provides access to mainnet Ethereum and all testnets. Requires an API key
* RivetGateway: Provides access to mainnet Ethereum and most testnets. Requires an API key
* XDaiGateway: Provides access to xDai chain
* HTTPGateway: Provides access to any Ethereum chain by providing a JSON-RPC URL
* InjectedGateway: Connect to the chain provided by an injected Web3 provider
* GSNGateway: Route transactions through Gas Station Network relayers. Supports mainnet, testnets & xDai

## Signers

Signers are responsible for signing transactions and messages, as well as reporting the list of
available accounts.

This module contains two signers:

* LocalSigner: stores a private key in the browser's localstorage
* InjectedSigner: signs using an injected web3 provider such as Metamask

An abstract class Signer is available for other modules that want to define their own signers 
(example: FortmaticSigner).

BurnerCore also automatically adds TempSigner. TempSigner is functionally similar to LocalSigner,
and allows wallets to temporarily add a new account. This is mainly used for transfering assets
while switching accounts.

## Assets

Assets represent fungible assets. View the @burner-wallet/assets package for more details.
