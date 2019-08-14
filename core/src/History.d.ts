export interface HistoryProps {
  storeHistory?: boolean,
}

export default History {
  constructor(props: HistoryEventProps);
  onEvent(callback: (event: HistoryEvent) => void): void;
  addEvent(event: HistoryEvent): void;
  getEvents(options?: any): HistoryEvent[];

}
