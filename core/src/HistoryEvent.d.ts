import { Asset } from '@burner-wallet/assets';

type AnyJson =  boolean | number | string | null | JsonArray | JsonMap;
interface JsonMap {  [key: string]: AnyJson; }
interface JsonArray extends Array<AnyJson> {}

export interface HistoryEventProps {
  id?: string,
  asset?: string,
  type: 'send' | 'exchange',
  value: string,
  from: string,
  to: string,
  message?: string,
  tx: string,
  timestamp: number,
  override?: boolean;
  metadata?: JsonMap;
}

export default class HistoryEvent {
  public id: string;
  public asset?: string;
  public type: 'send' | string;
  public value: string;
  public from: string;
  public to: string;
  public message: string;
  public tx: string;
  public timestamp: number;
  public override: false;
  public metadata?: JsonMap;

  constructor(props: HistoryEventProps);
  toJSON(): string;
  getAsset(): Asset;
  getDisplayValue(): string;
  getReceivingAsset(): Asset | null;
}
