import {
    notificationService,
    preferenceService,
    keyringService,
    accountService,
    accountEvmService,
    permissionService,
    sessionService,
    evmService
} from '@/background/service';
import { ethErrors } from 'eth-rpc-errors';
import { ethers } from "ethers";
import {AddEthereumChainParameter} from "@/model/evm";

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

    requestAccounts = async () => {
        const address = await keyringService._getActiveAddress();
        return [address]
    };

    getNetwork = async () => {
        let network = await preferenceService.getNetwork()
        return network.networkType
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

    submitCommitReveal = async (request: RequestProps) => {
        return await notificationService.requestApproval(
            {
                data: request.data.params,
                session: request.session
            },
            { route: "/evokeBoost/notification/submitCommitReveal" }
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


    eth_accounts = async () => {
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

    walletSwitchEthereumChain  = async (request: RequestProps) => {
        const chainHex = request.data.params?.[0].chainId;
        if (!chainHex) {
            throw ethErrors.rpc.invalidParams('chainId params must be a hex string');
        }
        const chainId = parseInt(chainHex, 16);
        if (chainId == 0) {
            throw ethErrors.rpc.invalidParams('chainId params must be a valid hex string');
        }
        const exist = await evmService.checkChainIdExist(chainId.toString())
        if (!exist) {
            throw new Error("4902::Unrecognized chain ID")
        }
        
        const selectChainId = await evmService.getSelectedChainId()
        if (chainId.toString() === selectChainId) {
            return
        }

        const requestId = crypto.randomUUID();
        let resp = await notificationService.requestApproval(
            {
                data: {
                    chainId: selectChainId,
                    targetChainId: chainId,
                    requestId,
                },
                session: request.session
            },
            { route: "/evokeBoost/notification/switchChain" }
        )
        sessionService.broadcastEvent('chainChanged', chainHex, origin);
        return resp
    }

    ethSendTransaction = async (request: RequestProps) => {
        const tx = request.data.params?.[0];
        let evmAddress = await keyringService.getActiveAddressForEvm()
        if (tx.from) {
            if (ethers.getAddress(tx.from) != ethers.getAddress(evmAddress.address)) {
                throw new Error("tx from address invalid")
            }
        } else {
            tx.from = evmAddress.address
        }
        let contractData = await accountEvmService.parseERC20Meta(tx)
        let estimateGas = await accountEvmService.eth_estimateGas(tx)
        const network = await evmService.getSelectedNetwork()
        return await notificationService.requestApproval(
            {
                data: { tx, network, data: contractData, gas: estimateGas },
                session: request.session
            },
            { route: "/evokeBoost/notification/sendTransaction" }
        )
    }

    walletAddEthereumChain = async (request: RequestProps) => {
        const params = request.data.params;
        if (!Array.isArray(params) || params.length === 0) {
            throw ethErrors.rpc.invalidParams('addEthereumChain requires a parameter object');
        }

        const chainParams = params[0] as AddEthereumChainParameter;
        if (!chainParams || typeof chainParams !== 'object') {
            throw ethErrors.rpc.invalidParams('Invalid chain parameter object');
        }

        const {
            chainId,
            chainName,
            rpcUrls,
            iconUrls,
            nativeCurrency,
            blockExplorerUrls
        } = chainParams;

        if (!chainId || typeof chainId !== 'string') {
            throw ethErrors.rpc.invalidParams('chainId must be a hex string');
        }

        if (!/^0x[0-9a-fA-F]+$/.test(chainId)) {
            throw ethErrors.rpc.invalidParams('chainId must be a valid 0x-prefixed hex string');
        }

        if (!chainName || typeof chainName !== 'string') {
            throw ethErrors.rpc.invalidParams('chainName is required and must be a string');
        }

        if (!Array.isArray(rpcUrls) || rpcUrls.length === 0) {
            throw ethErrors.rpc.invalidParams('rpcUrls must be a non-empty array of URLs');
        }

        if (!rpcUrls.every(url => typeof url === 'string')) {
            throw ethErrors.rpc.invalidParams('rpcUrls must contain only strings');
        }

        if (!nativeCurrency || typeof nativeCurrency !== 'object') {
            throw ethErrors.rpc.invalidParams('nativeCurrency must be provided');
        }

        if (
            typeof nativeCurrency.symbol !== 'string' ||
            !nativeCurrency.symbol.length
        ) {
            throw ethErrors.rpc.invalidParams('nativeCurrency.symbol must be a non-empty string');
        }

        if (
            typeof nativeCurrency.decimals !== 'number' ||
            nativeCurrency.decimals <= 0 ||
            nativeCurrency.decimals > 18
        ) {
            throw ethErrors.rpc.invalidParams('nativeCurrency.decimals must be a number between 1 and 18');
        }

        let explorer = '';
        if (Array.isArray(blockExplorerUrls) && blockExplorerUrls.length > 0) {
            if (!blockExplorerUrls.every(url => typeof url === 'string')) {
                throw ethErrors.rpc.invalidParams('blockExplorerUrls must contain only strings');
            }
            explorer = blockExplorerUrls[0];
        }

        const formattedChain = {
            chainId: parseInt(chainId, 16).toString(),   // 转为 decimal 方便管理
            symbol: nativeCurrency.symbol,
            name: chainName,
            rpcUrl: rpcUrls,
            explorer,
            decimals: nativeCurrency.decimals
        };

        return await notificationService.requestApproval(
            {
                data: {
                    chainParams: {
                        chainId: parseInt(chainParams.chainId).toString(),
                        symbol: chainParams.nativeCurrency.symbol,
                        name: chainParams.chainName,
                        rpcUrl: chainParams.rpcUrls,
                        explorer: chainParams.blockExplorerUrls?.[0] || "",
                        decimals: chainParams.nativeCurrency.decimals
                    }
                },
                session: request.session
            },
            { route: "/evokeBoost/notification/addEthereumChain" }
        )
    }

    wallet_revokePermissions = async (request: RequestProps) => {
        const {origin} = request.session
        return await permissionService.removeConnectedSite(origin)
    };

    wallet_getPermissions = async (request: RequestProps) => {
        const {origin} = request.session
        let hasPermisson = await permissionService.hasPermission(origin)
        return hasPermisson ? [{"parentCapability" : "eth_accounts"}] : []
    };

    walletWatchAsset = async (request: RequestProps) => {
        let network = await evmService.getSelectedNetwork()
        const params = request.data?.params;
        if (!params) {
            throw ethErrors.rpc.invalidParams("params is required");
        }

        const { type, options } = params;

        if (typeof type !== "string") {
            throw ethErrors.rpc.invalidParams("type must be a string");
        }

        const SUPPORT_TYPES = ["ERC20", "ERC721", "ERC1155"];
        if (!SUPPORT_TYPES.includes(type)) {
            throw ethErrors.rpc.invalidParams(
                `type must be one of ${SUPPORT_TYPES.join(", ")}`
            );
        }

        if (!options || typeof options !== "object") {
            throw ethErrors.rpc.invalidParams("options must be an object");
        }

        if (typeof options.address !== "string") {
            throw ethErrors.rpc.invalidParams("options.address must be a string");
        }
        if (!/^0x[0-9a-fA-F]{40}$/.test(options.address)) {
            throw ethErrors.rpc.invalidParams("options.address must be a valid eth address");
        }

        if (type === "ERC20") {
            if (typeof options.symbol !== "string" || options.symbol.length === 0) {
                throw ethErrors.rpc.invalidParams("ERC20 symbol must be a non-empty string");
            }

            if (
                typeof options.decimals !== "number" ||
                options.decimals < 0 ||
                options.decimals > 255
            ) {
                throw ethErrors.rpc.invalidParams("ERC20 decimals must be a number 0~255");
            }

            if (options.image && typeof options.image !== "string") {
                throw ethErrors.rpc.invalidParams("image must be a string URL");
            }
        }

        if (type === "ERC721") {
            if (!options.tokenId) {
                throw ethErrors.rpc.invalidParams("ERC721 tokenId is required");
            }
            if (typeof options.tokenId !== "string") {
                throw ethErrors.rpc.invalidParams("tokenId must be a string");
            }
        }

        if (type === "ERC1155") {
            if (!options.tokenId) {
                throw ethErrors.rpc.invalidParams("ERC1155 tokenId is required");
            }
            if (typeof options.tokenId !== "string") {
                throw ethErrors.rpc.invalidParams("tokenId must be a string");
            }
        }


        return await notificationService.requestApproval(
            {
                data: { network, options },
                session: request.session
            },
            { route: "/evokeBoost/notification/addErc20Token" }
        )
    }

    eth_chainId = async () => {
        let chainHex = await evmService.getSelectedChainId()
        return '0x' + Number(chainHex).toString(16)
    }

    personalSign = async (request: RequestProps) => {
        if (!Array.isArray(request.data.params) || request.data.params.length < 2) {
            throw ethErrors.rpc.invalidParams(
                'personal_sign requires params like: [message, address]'
            );
        }
        let [message, address] = request.data.params;
        if (address && typeof address === "string" && !address.startsWith("0x") && message && message.startsWith("0x")) {
            [address, message] = [message, address];
        }
        if (!address || typeof address !== "string" || !address.startsWith("0x") || address.length !== 42) {
            throw ethErrors.rpc.invalidParams('Invalid address for personal_sign');
        }
        if (typeof message !== "string") {
            throw ethErrors.rpc.invalidParams('Message must be a string');
        }
        request.data.params = { message, address }
        return this.signMessage(request)
    }

    net_version = async () => {
        return await evmService.getSelectedChainId()
    }

    eth_getBlockByNumber = async (request: RequestProps) => {
        let [blockNumber, includeTx] = request.data.params || [];
        return await accountEvmService.eth_getBlockByNumber(blockNumber, includeTx)
    }

    eth_getBalance = async (request: RequestProps) => {
        const [address, tag] = request.data.params || [];
        let balance = await accountEvmService.eth_getBalance(address, tag)
        return ethers.toBeHex(balance);
    }

    eth_call = async (request: RequestProps) => {
        const params = request?.data?.params;
        const [ tx ] = params;
        if (typeof tx !== "object" || !tx) {
            throw ethErrors.rpc.invalidParams('eth_estimateGas must be a object');
        }
        return await accountEvmService.eth_call(tx)
    }

    eth_blockNumber = async () => {
        const block = await accountEvmService.eth_blockNumber();
        return ethers.toBeHex(BigInt(block));
    }

    eth_getTransactionReceipt = async (request: RequestProps) => {
        const params = request?.data?.params;
        const [ hash ] = params;
        if (typeof hash !== 'string' || !hash) {
            throw ethErrors.rpc.invalidParams('transaction hash must be a string');
        }
        if (!/^0x([0-9a-fA-F]{64})$/.test(hash)) {
            throw ethErrors.rpc.invalidParams(
                'transaction hash must be 0x-prefixed 32-byte hex string'
            );
        }
        return await accountEvmService.eth_getTransactionReceipt(hash)
    }

    eth_getTransactionByHash = async (request: RequestProps) => {
        const params = request?.data?.params;
        const [ hash ] = params;
        if (typeof hash !== 'string' || !hash) {
            throw ethErrors.rpc.invalidParams('transaction hash must be a string');
        }
        if (!/^0x([0-9a-fA-F]{64})$/.test(hash)) {
            throw ethErrors.rpc.invalidParams(
                'transaction hash must be 0x-prefixed 32-byte hex string'
            );
        }
        return await accountEvmService.eth_getTransactionByHash(hash)
    }

    eth_getTransactionCount = async (request: RequestProps) => {
        const [address, tag] = request.data.params || [];

        if (!ethers.isAddress(address)) {
            throw ethErrors.rpc.invalidParams(
                "eth_getTransactionCount address params invalid"
            );
        }

        let formattedTag: string = 'latest';

        if (tag !== undefined && tag !== null) {
            if (typeof tag === 'string') {
                const predefinedTags = ['latest', 'earliest', 'pending', 'safe', 'finalized'];
                const lowerTag = tag.toLowerCase();

                if (predefinedTags.includes(lowerTag)) {
                    formattedTag = lowerTag;
                } else {
                    try {
                        // hex block number
                        formattedTag = ethers.toQuantity(tag);
                    } catch {
                        throw ethErrors.rpc.invalidParams(
                            `Invalid blockTag: ${tag}. Must be 'latest', 'earliest', 'pending', 'safe', 'finalized', or a valid hex number.`
                        );
                    }
                }
            } else if (typeof tag === 'number' || typeof tag === 'bigint') {
                try {
                    const num =
                        typeof tag === 'bigint'
                            ? tag
                            : BigInt(Math.floor(Number(tag)));

                    if (num < 0n) {
                        throw new Error();
                    }

                    formattedTag = ethers.toQuantity(num);
                } catch {
                    throw ethErrors.rpc.invalidParams(
                        `Invalid blockTag number: ${tag}`
                    );
                }
            } else {
                throw ethErrors.rpc.invalidParams(
                    `Invalid blockTag type: ${typeof tag}. Must be string, number, or bigint.`
                );
            }
        }

        const nonce = await accountEvmService.eth_getTransactionCount(
            address,
            formattedTag
        );

        return ethers.toQuantity(nonce);
    };


    eth_estimateGas = async (request: RequestProps) => {
        const params = request?.data?.params;
        const [ tx ] = params;
        if (typeof tx !== "object" || !tx) {
            throw ethErrors.rpc.invalidParams('eth_estimateGas must be a object');
        }
        return await accountEvmService.eth_estimateGas(tx)
    }

    eth_getCode = async (request: RequestProps) => {
        const params = request?.data?.params;

        if (!Array.isArray(params) || params.length < 2) {
            throw ethErrors.rpc.invalidParams(
                'expected params: [address, blockNumber | blockTag]'
            );
        }

        const [address, blockTag] = params;

        if (!ethers.isAddress(address)) {
            throw ethErrors.rpc.invalidParams(
                'address must be a valid 20-byte hex string (0x-prefixed)'
            );
        }

        const validTags = ['latest', 'earliest', 'pending'];

        const isHexBlock =
            typeof blockTag === 'string' &&
            /^0x[0-9a-fA-F]+$/.test(blockTag);

        const isTag =
            typeof blockTag === 'string' &&
            validTags.includes(blockTag);

        if (!isHexBlock && !isTag) {
            throw ethErrors.rpc.invalidParams(
                'blockTag must be a hex string or one of: latest | earliest | pending'
            );
        }
        return await accountEvmService.eth_getCode(address, blockTag) || "0x"
    };


    walletRequestPermissions = (request: RequestProps) => {
        let params = request.data.params
        if (!params || !Array.isArray(params) || params.length === 0) {
            throw ethErrors.rpc.invalidParams(
                "wallet_requestPermissions requires params like: [{ eth_accounts: {} }]"
            );
        }
        const perm = params[0];
        if (!perm || typeof perm !== "object" || !("eth_accounts" in perm)) {
            throw ethErrors.rpc.methodNotFound(
                "wallet_requestPermissions expects { eth_accounts: {} }"
            );
        }
        return [{ parentCapability: "eth_accounts" }]
    }
}

export default new ProviderController();
