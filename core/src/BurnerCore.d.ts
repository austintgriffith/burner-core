import { Asset } from '@burner-wallet/assets';
import Web3 from 'web3';
import { Gateway } from './gateways';
import { Signer } from './signers';
import HistoryEvent, { HistoryEventProps } from './HistoryEvent';

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
  signMsg(msg: string, account: string): string;
  shouldSkipSigning(network:string, txParams:any): boolean;
  handleRequest(network: string, payload: any): void;
  getProvider(network: string): any;
  getWeb3(network: string, options?: any): Web3;
  canCallSigner(action: string, account: string): boolean;
  callSigner(action: string, account: string, ...params: any[]): any;

  addHistoryEvent(eventProps: HistoryEventProps): void;
  getHistoryEvents(options: any): HistoryEvent[];
  onHistoryEvent(listener: (event: HistoryEvent) => void): void;
  removeHistoryEventListener(listener: (event: HistoryEvent) => void): void;

  stop(): void;
}
