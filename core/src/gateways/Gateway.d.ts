import BurnerCore from '../BurnerCore';

export default class Gateway {
  protected core: BurnerCore;

  constructor(networks?: string[]);

  isAvailable(): boolean;
  getNetworks(): string[];
  send(network: string, params: any): Promise<any>;
  stop(): void;
  start(): void;
}
