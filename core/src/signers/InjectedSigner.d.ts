import Signer from './Signer';

interface InjectedSignerOptions {
  autoEnable?: boolean;
}

export default class InjectedSigner extends Signer {
  constructor(props?: InjectedSignerOptions);
}
