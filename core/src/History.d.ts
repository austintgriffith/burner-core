import HistoryEvent from './HistoryEvent';

export interface HistoryProps {
  storeHistory?: boolean,
}

interface EventQuery {
  asset?: string;
  assets: string[];
  account: string;
}

export default class History {
  constructor(props: HistoryProps);
  onEvent(callback: (event: HistoryEvent) => void): void;
  removeListener(callback: (event: HistoryEvent) => void): void;
  addEvent(event: HistoryEvent): void;
  getEvents(options?: EventQuery): HistoryEvent[];

}
