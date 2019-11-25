export default class EventEmitter {
  constructor();

  emit(event: string, data?: any): void;
  on(event: string, callback: (data?: any) => void): void;
}
