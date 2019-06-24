export default class Signer {
  isAvailable(): boolean;
  getAccounts(): string[];
  hasAccount(account: string): boolean;
  signTx(tx: any): string;
  shouldSkipSigning(): boolean;
  onAccountChange(callback: () => void): void;
  permissions(): string[];
  invoke(action: string, account: string): any;
}
