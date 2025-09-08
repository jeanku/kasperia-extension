import { ethers } from "ethers";

// Minimal ERC20 ABI for balanceOf and decimals
export const ERC20_ABI = [
    // Read-Only Functions
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint amount) returns (bool)",
    "function transferFrom(address from, address to, uint amount) returns (bool)",

    // 这三个是 public 变量生成的 getter
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

/**
 * EVMProvider class
 * Provides methods to get ETH and ERC20 token balances
 */
export class Provider {
    private provider: ethers.JsonRpcProvider;

    /**
     * @param rpcUrl - The network RPC URL
     */
    constructor(rpcUrl: string) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    /** Update RPC URL dynamically */
    setRpcUrl(rpcUrl: string) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    /**
     * Get ETH balance of an address
     * @param address - wallet address
     * @returns balance in ETH as string
     */
    async getETHBalance(address: string): Promise<string> {
        const balance = await this.provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    /**
     * Get ERC20 token balance
     * @param address - wallet address
     * @param tokenAddress - token contract address
     * @param decimals - token decimals (optional)
     * @returns token balance as string
     */
    async getTokenBalance(address: string, tokenAddress: string, decimals?: number): Promise<string> {
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const balance = await token.balanceOf(address);
        const tokenDecimals = decimals ?? await token.decimals();
        return ethers.formatUnits(balance, tokenDecimals);
    }

    /**
     * Get ERC20 token info
     * @param tokenAddress - token contract address
     * @returns token balance as string
     */
    async getTokenInfo(tokenAddress: string) {
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const name = await token.name();
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        return {
            address: tokenAddress,
            name, symbol, decimals
        }
    }

    /**
     * Get multiple token balances
     * @param address - wallet address
     * @param tokens - array of { symbol, address, decimals? }
     * @returns record mapping symbol -> balance
     */
    async getMultipleTokenBalances(
        address: string,
        tokens: { symbol: string; address: string; decimals?: number }[]
    ): Promise<Record<string, string>> {
        const balances: Record<string, string> = {};
        for (const token of tokens) {
            balances[token.address] = await this.getTokenBalance(address, token.address, token.decimals);
        }
        return balances;
    }
}


// let prider = new Provider("https://rpc.kasplextest.xyz")
// let balance = await prider.getETHBalance("0x48cf149B9b29E1AaCe8d6ca9cA8E5BB08feCfdC7")
// console.log("balance", balance)
//
// let contractAddress = "0x601da7d2d1d976D43B4c95a179a82f8F22E19E91"
// let token = await prider.getTokenInfo(contractAddress)
// console.log("token", token)
// // let balanceUsdt = await prider.getTokenBalance("0x650FD0871bD1C150Ca479a126Ab3bB0DaA392ED6", contractAddress)
// // console.log("USDT:", balanceUsdt)
//
// let tokenList = [
//     {
//         symbol: "USDT",
//         address: "0xa518a07e7091e942088fc81aa88f10887a774ca5"
//     },
//     {
//         symbol: "USDC",
//         address: "0x46e0b71cc51ee0ea82c28fb84ef30df91f73bae9"
//     }
// ]
// let balanceList = await prider.getMultipleTokenBalances("0x650FD0871bD1C150Ca479a126Ab3bB0DaA392ED6", tokenList)
// console.log("balanceList:", balanceList)
