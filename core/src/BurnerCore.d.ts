import { Asset } from '@burner-wallet/assets';
import { Gateway } from './gateways';
import { Signer } from './signers';

interface BurnerCoreConstructor {
  signers?: Signer[],
  gateways?: Gateway[],
  assets?: Asset[],
}

export default class BurnerCore {
  constructor(props: BurnerCoreConstructor);
  onAccountChange(callback: (accounts: string[]) => void): void;
  getAssets(): Asset[];
  getAccounts(): string[];
  signTx(txParams: any): string;
  shouldSkipSigning(network:string, txParams:any): boolean;
  handleRequest(network: string, payload: any): void;
  getProvider(network: string): any;
  getWeb3(network: string): any;
  canCallSigner(action: string, account: string): boolean;
  callSigner(action: string, account: string, ...params: any[]): any;
  stop(): void;
}
