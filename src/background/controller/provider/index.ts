import { keyringService } from '@/background/service';
import rpcFlow from './rpcFlow';

const providerHandler = async (req: any) => {
  const hasVault = await keyringService.isBoot();
  if (!hasVault) {
    throw Error('wallet must has at least one account');
  }
  return await rpcFlow(req);
};

export default providerHandler