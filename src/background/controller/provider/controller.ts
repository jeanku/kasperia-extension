import {
    notificationService,
    preferenceService,
    keyringService,
    accountService,
    permissionService,
    evmService
} from '@/background/service';

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
        const address = await keyringService._getActiveAddress();
        return [address]
    };

    eth_accounts = async () => {
        console.log("[background eth_accounts]....")
        try {
            const address = await keyringService._getActiveEvmAddress();
            return [address]
        } catch (error) {
            console.log("[background eth_accounts] error:", error)
        }
        return []
    };

    ethRequestAccounts = async () => {
        const address = await keyringService._getActiveEvmAddress();
        return [address]
    };

    getNetwork = async () => {
        return await preferenceService.getNetwork()
    };
    
    getPublicKey = async () => {
        return await keyringService.getActivePublicKey() || ""
    };

    getBalance = async () => {
        const balance = await accountService.getBalance();
        return {total: balance.balance.toString()}
    };

    switchNetwork = async (request: RequestProps) => {
        const network = await preferenceService.getNetwork()
        if (network?.networkType === request.data.params.networkType) {
            return
        }
        return await notificationService.requestApproval(
            {
                data: {
                    networkType: network?.networkType,
                    targetNetworkType:  request.data.params.networkType
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

    disconnect = async (request: RequestProps) => {
        let origin = request.session.origin
        if (origin) {
            permissionService.removeConnectedSite(origin)
        }
        return
    };

    walletSwitchEthereumChain  = async (request: RequestProps) => {
        const exist = await evmService.checkChainIdExist(request.data.params.chainId)
        if (!exist) {
            throw new Error("4902::Unrecognized chain ID")
        }
        
        const chainId = await evmService.getSelectedChainId()
        if (chainId === request.data.params.chainId) {
            return
        }

        const requestId = crypto.randomUUID();
        return await notificationService.requestApproval(
            {
                data: {
                    chainId: chainId,
                    targetChainId:  request.data.params.chainId,
                    requestId,
                },
                session: request.session
            },
            { route: "/evokeBoost/notification/switchChain" }
        )
    }

    sendTransaction = async (request: RequestProps) => {
        request.data.params.network = await evmService.getSelectedNetwork()
        return await notificationService.requestApproval(
            {
                data: request.data.params,
                session: request.session
            },
            { route: "/evokeBoost/notification/sendTransaction" }
        )
    }

    addEthereumChain = async (request: RequestProps) => {
        return await notificationService.requestApproval(
            {
                data: request.data.params,
                session: request.session
            },
            { route: "/evokeBoost/notification/addEthereumChain" }
        )
    }

    wallet_revokePermissions = async (request: RequestProps) => {
        const {origin} = request.session
        return await permissionService.removeConnectedSite(origin)
    };

    walletWatchAsset = async (request: RequestProps) => {
        request.data.params.network = await evmService.getSelectedNetwork()
        return await notificationService.requestApproval(
            {
                data: request.data.params,
                session: request.session
            },
            { route: "/evokeBoost/notification/addErc20Token" }
        )
    }

    eth_chainId = async () => {
        return await evmService.getSelectedChainId()
    };

    eth_getBlockByNumber = async (request: RequestProps) => {
        return await accountService.eth_getBlockByNumber(request.data.params.block_number, request.data.params.flag)
    }

    eth_getBalance = async (request: RequestProps) => {
        return await accountService.eth_getBalance(request.data.params.address, request.data.params.tag)
    }

    eth_call = async (request: RequestProps) => {
        return await accountService.eth_call(request.data.params.tx)
    }

    eth_blockNumber = async () => {
        return await accountService.eth_blockNumber()
    }

    eth_getTransactionReceipt = async (request: RequestProps) => {
        return await accountService.eth_getTransactionReceipt(request.data.params.hash)
    }

    walletRequestPermissions = () => {}
}

export default new ProviderController();
