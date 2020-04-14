import Asset, { AssetConstructor } from './Asset';
import { Contract } from 'web3-eth-contract';

interface ERC20Constructor extends AssetConstructor {
  address: string,
  abi?: object,
}

export default class ERC20Asset extends Asset {
  public address: string;

  constructor(props: ERC20Constructor);
  allowance(from:string, to:string): Promise<string>;
  approve(from:string, to:string, value:string): Promise<any>;

  protected getContract(): Contract;
}
