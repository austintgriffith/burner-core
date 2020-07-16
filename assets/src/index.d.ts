import Asset from './Asset';
import ERC20Asset from './ERC20Asset';

export { default as Asset, AssetConstructor } from './Asset';
export { default as ERC20Asset } from './ERC20Asset';
export { default as ERC777Asset } from './ERC777Asset';
export { default as NativeAsset } from './NativeAsset';

export const eth: Asset;
export const dai: ERC20Asset;
export const sai: ERC20Asset;
export const usdc: ERC20Asset;
export const xdai: Asset;

export const keth: Asset;
export const kdai: ERC20Asset;
