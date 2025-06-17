import { notificationService, preferenceService, keyringService } from '@/background/service';
import { KaspaApi, Kiwi } from '@kasplex/kiwi-web'

interface RequestProps {
    data: {
        params:  any,
    };
    session: {
        origin: string,
        icon: string,
        name: string,
    }
}

class ProviderController {

    getAccounts = async () => {
      const { address } = await keyringService.getActiveAccountAddressAndNetwork();
      return [address]
    };

    getNetwork = async () => {
        return await preferenceService.getNetwork()
    };


    getPublicKey = async () => {
        const account = await preferenceService.getCurrentAccount();
        return account?.pubKey
    };

    getBalance = async () => {
        const { address, network } = await keyringService.getActiveAccountAddressAndNetwork();
        Kiwi.setNetwork(network!.networkId)
        return await KaspaApi.getBalance(address) || {}
    };

    switchNetwork = async (request: RequestProps) => {
        const network = await preferenceService.getNetwork()

        if (network?.networkId === request.data.params.networkId) {
            return network
        }
        console.log("start", request.data.params)
        return await notificationService.requestApproval(
            {
                data: {
                    networkId: network?.networkId,
                    targetNetworkId:  request.data.params.networkId
                },
                session: request.session
            },
            { route: "/evokeBoost/notification/switchNetwork" }
        )
    }

    sendKaspa = async (request: RequestProps) => {
        return await notificationService.requestApproval(
            {
              data: request.data.params,
              session: request.session
            },
          { route: "/evokeBoost/notification/sendkaspa" }
        )
    }

    signMessage = async (request: RequestProps) => {
        return await notificationService.requestApproval(
            {
                data: request.data.params,
                session: request.session
            },
            { route: "/evokeBoost/notification/sign" }
        )
    }

    getVersion = async () => {
      return "1.0.21"
    };
}

export default new ProviderController();
