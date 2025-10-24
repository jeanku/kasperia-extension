import { ethers } from "ethers";

// Minimal ERC20 ABI for balanceOf and decimals
export const ERC20_ABI = [
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint amount) returns (bool)",
    "function transferFrom(address from, address to, uint amount) returns (bool)",

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
    public chainId: number;

    constructor(rpcUrl: string, chainId: number) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl, { chainId, name: "custom" }, {batchMaxCount: 1});
        this.chainId = chainId
    }

    /**
     * Get ETH balance of an address
     * @param address - wallet address
     * @returns balance in ETH as string
     */
    async getBalance(address: string): Promise<string> {
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
            name, symbol,
            decimals: parseInt(decimals.toString())
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

    /** Send native ETH */
    async sendEth(
        privateKey: string,
        toAddress: string,
        ethAmount: string
    ): Promise<string> {
        if (!privateKey.startsWith("0x")) privateKey = "0x" + privateKey;
        const wallet = new ethers.Wallet(privateKey, this.provider);
        try {
            const feeData = await this.provider.getFeeData();
            const gasPrice = feeData.gasPrice;
            const nonce = await this.provider.getTransactionCount(wallet.address, "pending");
            let fromAddress = wallet.address
            let amount = ethers.parseEther(ethAmount)
            const gasLimit = await this.provider.estimateGas({
                from: fromAddress,
                to: toAddress,
                value: amount
            });

            const signedTx = await wallet.signTransaction({
                type: 0,
                to: toAddress,
                value: ethers.parseEther(ethAmount),
                gasPrice,
                gasLimit: gasLimit,
                nonce,
                chainId: this.chainId
            });
            return await this.provider.send("eth_sendRawTransaction", [signedTx]);
        } catch (error: any) {
            throw new Error("error:" + error.message);
        }
    }

    /** Send ERC20 tokens */
    async sendToken(
        privateKey: string,
        tokenAddress: string,
        toAddress: string,
        amount: string,
        decimals?: number   // Optional: if provided, use directly; otherwise fetch from contract
    ): Promise<string> {
        if (!privateKey.startsWith("0x")) privateKey = "0x" + privateKey;
        const wallet = new ethers.Wallet(privateKey, this.provider);

        try {
            // Initialize ERC20 contract with global ABI
            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);

            // Use provided decimals if available, otherwise fetch from contract
            const tokenDecimals: number = decimals ?? await contract.decimals();

            // Convert human-readable amount into smallest unit (wei-like)
            const amountInWei = ethers.parseUnits(amount, tokenDecimals);

            // Encode ERC20 transfer function call
            const data = contract.interface.encodeFunctionData("transfer", [toAddress, amountInWei]);

            // Fetch gas price and nonce
            const feeData = await this.provider.getFeeData();
            const gasPrice = feeData.gasPrice;
            const nonce = await this.provider.getTransactionCount(wallet.address, "pending");

            // Estimate gas limit for the transaction
            const gasLimit = await this.provider.estimateGas({
                from: wallet.address,
                to: tokenAddress,
                data: data
            });

            // Build legacy transaction (type: 0)
            const tx = {
                type: 0,
                to: tokenAddress,
                data: data,
                gasPrice,
                gasLimit,
                nonce,
                chainId: this.chainId
            };

            // Sign the transaction with the sender's private key
            const signedTx = await wallet.signTransaction(tx);

            // Send the raw signed transaction to the network
            return await this.provider.send("eth_sendRawTransaction", [signedTx]);
        } catch (error: any) {
            throw new Error("sendERC20 error: " + error.message);
        }
    }

    /** Send native ETH */
    async getNonce(
        address: string,
    ): Promise<number> {
        return await this.provider.getTransactionCount(address, "pending");
    }

    /** Send native ETH */
    async getBlockNumber(
    ): Promise<number> {
        return await this.provider.getBlockNumber();
    }
}