import Asset, { AssetConstructor } from './Asset';

interface ERC20Constructor extends AssetConstructor {
  address: string,
  abi?: object,
}

export default class ERC20Asset extends Asset {
  constructor(props: AssetConstructor);
  allowance(from:string, to:string): Promise<string>;
  approve(from:string, to:string, value:string): Promise<any>;
}
