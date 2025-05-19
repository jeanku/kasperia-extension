// import { ethErrors } from 'eth-rpc-errors';

import { keyringService } from '@/background/service';
import rpcFlow from './rpcFlow';

export default async (req: any) => {
  console.log("rpcFlow index0 ....", req)
  const hasVault = keyringService.isBoot();
  if (!hasVault) {
    throw Error('wallet must has at least one account');
  }
  console.log("rpcFlow index ....")
  return rpcFlow(req);
};
