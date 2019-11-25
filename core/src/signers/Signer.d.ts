import BurnerCore from '../BurnerCore';
import EventEmitter from '../lib/EventEmitter';

export default class Signer {
  protected events: EventEmitter;
  protected accounts: string[];
  protected core: BurnerCore | null;

  setCore(core: BurnerCore): void;
  isAvailable(): boolean;
  getAccounts(): string[];
  hasAccount(account: string): boolean;
  signTx(tx: any): Promise<string>;
  signMsg(message: any): Promise<string>;
  shouldSkipSigning(): boolean;
  onAccountChange(callback: () => void): void;
  permissions(): string[];
  invoke(action: string, account: string): any;
}
