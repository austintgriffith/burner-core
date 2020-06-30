export default class Gateway {
  isAvailable(): boolean;
  getNetworks(): string[];
  send(network: string, params: any): Promise<any>;
  stop(): void;
  start(): void;
}
