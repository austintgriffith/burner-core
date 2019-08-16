import Signer from './Signer';

interface LocalSignerOptions {
  privateKey?: string;
  saveKey?: boolean;
}

export default class LocalSigner extends Signer {
  constructor(props?: LocalSignerOptions);
}
