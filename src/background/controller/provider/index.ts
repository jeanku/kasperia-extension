// import { ethErrors } from 'eth-rpc-errors';

import { keyringService } from '@/background/service';
import rpcFlow from './rpcFlow';

export default (req: any) => {
  const hasVault = keyringService.isBoot();
  if (!hasVault) {
    throw Error('wallet must has at least one account');
  }
  return rpcFlow(req);
};
