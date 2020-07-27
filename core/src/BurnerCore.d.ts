import { Asset } from '@burner-wallet/assets';
import Web3 from 'web3';
import { Gateway } from './gateways';
import Signer, { SignedTransaction } from './signers/Signer';
import { HistoryProps } from './History';
import HistoryEvent, { HistoryEventProps } from './HistoryEvent';

interface BurnerCoreConstructor {
  signers?: Signer[],
  gateways?: Gateway[],
  assets?: Asset[],
  historyOptions?: HistoryProps,
}

export default class BurnerCore {
  constructor(props: BurnerCoreConstructor);
  onAccountChange(callback: (accounts: string[]) => void): void;
  getAssets(): Asset[];
  getAccounts(): string[];
  signTx(txParams: any): Promise<SignedTransaction>;
  signMsg(msg: string, account: string, type?: string): Promise<string>;
  shouldSkipSigning(network:string, txParams:any): boolean;
  handleRequest(network: string, payload: any): Promise<any>;
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
