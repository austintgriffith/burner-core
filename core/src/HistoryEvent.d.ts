export interface HistoryEventProps {
  asset: string,
  receivingAsset?: string,
  type: 'send' | 'exchange',
  amount: string,
  from: string,
  to: string,
  message?: string,
  tx: string,
  timestamp: number,
}

export default class HistoryEvent {
  public asset: string;
  public receivingAsset?: string;
  public type: 'send' | 'exchange';
  public amount: string;
  public from: string;
  public to: string;
  public message: string;
  public tx: string;
  public timestamp: number;

  constructor(props: HistoryEventProps);
  toJSON(): string;
}
