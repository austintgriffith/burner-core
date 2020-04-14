export interface AssetConstructor {
  id: string;
  name: string;
  network: string;
  type?: string;
  usdPrice?: number;
  priceSymbol?: string;
  icon?: string;
  decimals?: number;
}

export interface SendParams {
  to: string;
  from: string;
  ether?: string;
  value?: string;
  message?: string | null;
}

export default class Asset {
  public id: string;
  public name: string;
  public network: string;
  public type: string | null;
  public icon: string | null;

  protected core: any;

  constructor(props: AssetConstructor);
  setCore(core: any): void;
  getTx(txHash: string): Promise<any>;
  getDisplayValue(value: string, decimals?: number): string;
  getUSDValue(value: string, decimals?: number): string;
  getBalance(account: string): Promise<string>;
  getDisplayBalance(account: string, decimals?: number): Promise<string>;
  getMaximumSendableBalance(account: string, recipient?: string): Promise<string>;
  send(params: SendParams): Promise<any>;
  supportsMessages(): boolean;
  getWeb3(): any;
  start(): void;
  stop(): void;

  protected _send(params: SendParams): Promise<any>;
}
