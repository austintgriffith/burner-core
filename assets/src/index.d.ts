import Asset from './Asset';
export { default as ERC20Asset } from './ERC20Asset';
export { default as NativeAsset } from './NativeAsset';
export type Asset = Asset;

declare const _default: {
  eth: Asset,
  dai: Asset,
  xdai: Asset,
};
export default _default;
