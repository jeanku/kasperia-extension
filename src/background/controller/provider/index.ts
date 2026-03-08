import { keyringService } from '@/background/service';
import rpcFlow from './rpcFlow';

const providerHandler = (req: any) => {
  return keyringService.isBoot().then(hasVault => {
    if (!hasVault) {
      throw Error('Wallet must has at least one account; you may need to create or import your wallet first.');
    }
    return rpcFlow(req);
  })
};

export default providerHandler