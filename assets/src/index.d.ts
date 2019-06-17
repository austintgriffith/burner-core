import Asset from './Asset';
import ERC20Asset from './ERC20Asset';
export type Asset = Asset;
export type ERC20Asset = ERC20Asset;
export { default as NativeAsset } from './NativeAsset';

export const eth: Asset;
export const dai: ERC20Asset;
export const xdai: Asset;
