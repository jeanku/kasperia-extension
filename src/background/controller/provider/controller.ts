/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

// import { NETWORK_TYPES, VERSION } from '@/shared/constant';
import { keyringService, notificationService, permissionService } from '@/background/service';

// import { NetworkType } from '@/shared/types';
// import { amountToSompi } from '@/ui/utils';
import { ethErrors } from 'eth-rpc-errors';
// import BaseController from '../base';
// import wallet from '../wallet';


class ProviderController {

  async requestAccounts(origin: string) {
    if (!permissionService.hasPermission(origin)) {
      throw ethErrors.provider.unauthorized();
    }

    // const _account = await wallet.getCurrentAccount();
    // const account = _account ? [_account.address] : [];
    // sessionService.broadcastEvent('accountsChanged', account);
    // const connectSite = permissionService.getConnectedSite(origin);
    // if (connectSite) {
    //   const network = wallet.getNetworkName()
    //   sessionService.broadcastEvent(
    //     'networkChanged',
    //     {
    //       network
    //     },
    //     origin
    //   );
    // }
    // return account
  };

  // @Reflect.metadata('SAFE', true)
  //   getAccounts = async ({ session: { origin } }) => {
  //     if (!permissionService.hasPermission(origin)) {
  //       return [];
  //     }
  //
  //     const _account = await wallet.getCurrentAccount();
  //     const account = _account ? [_account.address] : [];
  //     return account
  //   };
  //
  // @Reflect.metadata('SAFE', true)
  //   getNetwork = async () => {
  //     const networkType = wallet.getNetworkType()
  //     return NETWORK_TYPES[networkType].name
  //   };
  //
  // @Reflect.metadata('APPROVAL', ['SwitchNetwork', (req) => {
  //   const network = req.data.params.network;
  //   if ( NETWORK_TYPES[NetworkType.Mainnet].validNames.includes(network)) {
  //     req.data.params.networkType = NetworkType.Mainnet
  //   } else if ( NETWORK_TYPES[NetworkType.Testnet].validNames.includes(network)) {
  //     req.data.params.networkType = NetworkType.Testnet
  //   } else if ( NETWORK_TYPES[NetworkType.Devnet].validNames.includes(network)) {
  //     req.data.params.networkType = NetworkType.Devnet
  //   } else {
  //     throw new Error(`the network is invalid, supported networks: ${NETWORK_TYPES.map(v=>v.name).join(',')}`)
  //   }
  //
  //   if (req.data.params.networkType === wallet.getNetworkType()) {
  //     // skip approval
  //     return true;
  //   }
  // }])
  //   switchNetwork = async (req) => {
  //     const { data: { params: { networkType } } } = req;
  //     wallet.setNetworkType(networkType)
  //     return NETWORK_TYPES[networkType].name
  //   }
  //
  // @Reflect.metadata('SAFE', true)
  //   getPublicKey = async () => {
  //     const account = await wallet.getCurrentAccount();
  //     if(!account) return ''
  //     return account.pubkey;
  //   };
  //
  // @Reflect.metadata('SAFE', true)
  //   getBalance = async () => {
  //     const account = await wallet.getCurrentAccount();
  //     if (!account) return null;
  //     const balance = await wallet.getAddressBalance(account.address)
  //     return {
  //       confirmed: amountToSompi(balance.confirm_amount),
  //       unconfirmed:amountToSompi(balance.pending_amount),
  //       total:amountToSompi(balance.amount)
  //     };
  //   };
  //
  // @Reflect.metadata('APPROVAL', ['SignPsbt', (req) => {
  //   const { data: { params: { toAddress, sompi } } } = req;
  //
  // }])
    sendKaspa = async (param: any) => {
      console.log("param", param)
      await notificationService.requestApproval(
          {
            params: {
              data: param,
            },
          },
          { route: "/evokeBoost/notification/sendkaspa" }
      )
      return
    }
  //
  //
  // @Reflect.metadata('APPROVAL', ['SignText', () => {
  //   // todo check text
  // }])
  //   signMessage = async ({ data: { params: { text, type } } }) => {
  //     if (type === 'bip322-simple') {
  //       return wallet.signBIP322Simple(text)
  //     } else {
  //       return wallet.signMessage(text)
  //     }
  //   }


  //
  // @Reflect.metadata('SAFE', true)
  //   getVersion = async () => {
  //     return VERSION
  //   };
}

export default new ProviderController();
