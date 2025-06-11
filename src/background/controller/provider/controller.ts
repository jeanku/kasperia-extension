/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

// import { NETWORK_TYPES, VERSION } from '@/shared/constant';
import { keyringService, notificationService, permissionService, preferenceService } from '@/background/service';

// import { NetworkType } from '@/shared/types';
// import { amountToSompi } from '@/ui/utils';
import { ethErrors } from 'eth-rpc-errors';
// import BaseController from '../base';
// import wallet from '../wallet';
import { NetworkName, NetworkType } from '@/types/enum'

class ProviderController {

    requestAccounts = async () => {
      const account = await preferenceService.getCurrentAccount();
      return account?.address ? [account?.address] : []
    };

    getAccounts = async () => {
      const account = await preferenceService.getCurrentAccount();
      return account?.address ? [account?.address] : []
    };

    getNetwork = async () => {
      const network = await preferenceService.getNetwork()
      if (network && network.networkId == NetworkType.Mainnet) {
        return "kaspa_mainnet"
      }
      return "kaspa_testnet_10"
    };

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
  //   switchNetwork = async (network: number) => {
  //
  //       wallet.setNetworkType(networkType)
  //       return NETWORK_TYPES[networkType].name
  //   }
  //
  // @Reflect.metadata('SAFE', true)
    getPublicKey = async () => {
        const account = await preferenceService.getCurrentAccount();
        return account?.pubKey
    };
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
      return await notificationService.requestApproval(
          {
            params: {
              data: param,
            },
          },
          { route: "/evokeBoost/notification/sendkaspa" }
      )
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
    getVersion = async () => {
      return "1.0.0"
    };
}

export default new ProviderController();
