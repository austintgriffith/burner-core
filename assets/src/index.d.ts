import Asset from './Asset';
export { default as ERC20Asset } from './ERC20Asset';
export { default as NativeAsset } from './NativeAsset';
export type Asset = Asset;

export const eth: Asset;
export const dai: ERC20Asset;
export const xdai: Asset;
