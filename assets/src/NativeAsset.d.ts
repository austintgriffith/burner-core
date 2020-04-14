import Asset from './Asset';

export default class NativeAsset extends Asset {
    protected _pollInterval: number;

    scanBlocks(address: string, startBlock: string | number, toBlock: string | number): Promise<any>
}
