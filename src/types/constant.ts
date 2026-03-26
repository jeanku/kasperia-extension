import { ethers } from 'ethers';

import IconKasplex from '@/assets/images/chains/167012.svg'
import IconBNB from '@/assets/images/tokens/BNB.svg'

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;

export const KasplexL2TestnetChainId = 167012
export const IGRAL2TestnetChainId = 38836
export const IGRAL2MainnetChainId = 38833
export const KasplexL2MainnetChainId = 202555
export const KasplexL1ToL2BridgeAddressForTestnet = "kaspatest:qyp7xxc2c2u0rs6uhgrs88ljjd0tlgjjxnu5a48899xmma894p68mggzct64wuu"
export const KasplexL2ToL1BridgeAddressForTestnet = "0x6181d079fe60b44077e7a461d31519a53124fd54"
export const KasplexL1ToL2BridgeAddressForMainnet = "kaspa:qypr0qj7luv26laqlquan9n2zu7wyen87fkdw3kx3kd69ymyw3tj4tsh467xzf2"
export const KasplexL2ToL1BridgeAddressForMainnet = "0x34606e6d01280f49791628b311cf33a808d1f7c6"
export const IGRAL1ToL2BridgeAddressForTestnet = "kaspatest:qqmstl2znv9tsfgcmj9shme82my867tapz7pdu4ztwdn6sm9452jj5mm0sxzw"
export const IGRAL1ToL2BridgeAddressForMainnet = "kaspa:ppvnxxzm0rr37zpnwux2f2ntvfpr4uqdpm7zsvsztg3en92r7gs0wkmr72q9n"

export const KNSDomain = "https://api.knsdomains.org"

export const HistoryApiUrl = "https://kasbridge-tn10evm-api.kaspafoundation.org/"

export const FixDecimal = 4


/****** StableCoin Bridge Config ******/

export const USDCBridgeABI = [
    "function deposit(address token,uint256 amount,uint32 toChainId,address toAddress)",
    "function supportedTokens(address token) view returns (bool)"
] as ethers.InterfaceAbi;

export const TokenABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function nonces(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function totalSupply() view returns (uint256)",
    "function minterAllowance(address) view returns (uint256)"
] as ethers.InterfaceAbi;

// Test
export const StableCoinTestnetTokenList = [
    {
        "name": "BSC",
        "symbol": "USDC",
        "fSymbol": "BNB",
        "decimals": 18,
        "feeRate": 0,
        "baseFee": 0,
        "token": "0xc2dF2F567d37Ef4b8A620b41e46b17D7aEc22687",
        iconText: IconBNB,
    },
    {
        "name": "BSC",
        "symbol": "USDT",
        "fSymbol": "BNB",
        "decimals": 18,
        "feeRate": 0,
        "baseFee": 0,
        "token": "0x764f9f2053FA63aE31550AEEa6b1E7dB1bAa6117",
        iconText: IconBNB,
    },
    {
        "name": "KasplexL2",
        "symbol": "USDC",
        "fSymbol": "KAS",
        "decimals": 6,
        "feeRate": 0,
        "baseFee": 10,
        "token": "0xD6f5DDe052640C5960FB651080F77d67Ea76285A",
        iconText: IconKasplex,
    },
    {
        "name": "KasplexL2",
        "symbol": "USDT",
        "fSymbol": "KAS",
        "decimals": 6,
        "feeRate": 0,
        "baseFee": 10,
        "token": "0x406Fd2c59FA5AB66F21486019b3f2AF93B6E3230",
        iconText: IconKasplex,
    }
]

export const ChainListTestnet = [
    {
        chainId: KasplexL2TestnetChainId,
        decimals: 6,
        symbol: "USDC",
        fSymbol: 'KAS',
        name: "KasplexL2",
        rpcUrl: "https://rpc.kasplextest.xyz",
        blockExplorerUrl: "https://explorer.testnet.kasplextest.xyz/",
        token: "0xD6f5DDe052640C5960FB651080F77d67Ea76285A",
        bridgeAddress: "0x4f34Ccabc4642945BEce27a4963189C893b5a899",
        estTime: "1~3",
        minAmount: 15,
        iconText: IconKasplex,
    },
    {
        chainId: 97,
        decimals: 18,
        symbol: "USDC",
        fSymbol: 'BNB',
        name: "BSC",
        rpcUrl: "https://bsc-testnet-rpc.publicnode.com",
        blockExplorerUrl: "https://testnet.bscscan.com/",
        token: "0xc2dF2F567d37Ef4b8A620b41e46b17D7aEc22687",
        bridgeAddress: "0x328686dd5fbe0216faffca824d63613908f4b316",
        estTime: "3~5",
        minAmount: 1,
        iconText: IconBNB,
    }
]

// Token List Mainnet
export const StableCoinMainTokenList = [
    {
        "name": "BSC",
        "symbol": "USDC",
        "fSymbol": "BNB",
        "decimals": 18,
        "feeRate": 0,
        "baseFee": 0,
        "token": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
    },
    {
        "name": "BSC",
        "symbol": "USDT",
        "fSymbol": "BNB",
        "decimals": 18,
        "feeRate": 0,
        "baseFee": 0,
        "token": "0x55d398326f99059fF775485246999027B3197955"
    },
    {
        "name": "KasplexL2",
        "symbol": "USDC",
        "fSymbol": "KAS",
        "decimals": 6,
        "feeRate": 0,
        "baseFee": 10,
        "token": "0x45031B5FC18c7f5C864eDF6E33f3d23Da4285fB1"
    },
    {
        "name": "KasplexL2",
        "symbol": "USDT",
        "fSymbol": "KAS",
        "decimals": 6,
        "feeRate": 0,
        "baseFee": 10,
        "token": "0x18AdEe263E5c8B6df7f803a89C5626148bEb1108"
    }
]

export const ChainListMainnet = [
    {
        chainId: KasplexL2MainnetChainId,
        decimals: 6,
        symbol: "USDC",
        fSymbol: 'KAS',
        name: "KasplexL2",
        rpcUrl: "https://evmrpc.kasplex.org/",
        blockExplorerUrl: "https://explorer.kasplex.org/",
        token: "0x45031B5FC18c7f5C864eDF6E33f3d23Da4285fB1",
        bridgeAddress: "0x4D97210eb885952575F48Ffe4822CE84035832B7",
        estTime: "1~3",
        minAmount: 15,
        iconText: IconKasplex,
    },
    {
        chainId: 56,
        decimals: 18,
        symbol: "USDC",
        fSymbol: 'BNB',
        name: "BSC",
        rpcUrl: "https://bsc.publicnode.com/",
        blockExplorerUrl: "https://bscscan.com/",
        token: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        bridgeAddress: "0xd32121441965b3cfe4b8dcb29615d4c849e952e2",
        estTime: "3~5",
        minAmount: 1,
        iconText: IconBNB,
    }
]
export const ApiChainId =  [KasplexL2TestnetChainId, KasplexL2MainnetChainId, IGRAL2TestnetChainId]

export const TokenListApi: Record<string, string> = {
    [IGRAL2TestnetChainId]: 'https://explorer.galleon-testnet.igralabs.com/api/v2/addresses/',
    [IGRAL2MainnetChainId]: 'https://explorer.igralabs.com/api/v2/addresses/',
    [KasplexL2TestnetChainId]: 'https://explorer.testnet.kasplextest.xyz/api/v2/addresses/',
    [KasplexL2MainnetChainId] : 'https://api-explorer.kasplex.org/api/v2/addresses/',
}
