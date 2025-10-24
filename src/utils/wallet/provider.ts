import {Block, ethers} from "ethers";
import {type BlockTag, TransactionRequest} from "ethers/src.ts/providers/provider";

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
     * @param blockTag
     * @returns balance in ETH as string
     */
    async getBalance(address: string, blockTag?: BlockTag): Promise<string> {
        const balance = await this.provider.getBalance(address, blockTag);
        return balance.toString()
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

            const tx = {
                type: 0,
                to: tokenAddress,
                data: data,
                gasPrice,
                gasLimit,
                nonce,
                chainId: this.chainId
            };

            const signedTx = await wallet.signTransaction(tx);
            return await this.provider.send("eth_sendRawTransaction", [signedTx]);
        } catch (error: any) {
            throw new Error("sendERC20 error: " + error.message);
        }
    }

    async createTransaction(
        fromAddress: string,
        toAddress: string,
        amount: string
    ) {
        try {
            const balance = await this.provider.getBalance(fromAddress);
            const feeData = await this.provider.getFeeData();
            const supports1559 = !!(feeData.maxFeePerGas && feeData.maxPriorityFeePerGas);
            const nonce = await this.provider.getTransactionCount(fromAddress, "pending");
            const amountToWei = ethers.parseEther(amount);

            const gasLimit = await this.provider.estimateGas({
                from: fromAddress,
                to: toAddress,
                value: amountToWei
            });

            let gasFee: bigint;
            let gasConfig: any = {};

            if (supports1559) {
                const maxFeePerGas = feeData.maxFeePerGas!;
                const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas!;
                gasFee = gasLimit * maxFeePerGas;
                gasConfig = { maxFeePerGas: maxFeePerGas.toString(), maxPriorityFeePerGas: maxPriorityFeePerGas.toString(), type: 2 };
            } else {
                const gasPrice = feeData.gasPrice ?? ethers.parseUnits("1", "gwei");
                gasFee = gasLimit * gasPrice;
                gasConfig = { gasPrice: gasPrice.toString(), type: 0 };
            }

            let sendValue = amountToWei;
            if (balance < sendValue + gasFee) {
                const adjusted = balance - gasFee;
                if (adjusted <= 0n) {
                    throw new Error("Insufficient balance to cover gas fee");
                }
                sendValue = adjusted;
            }

            return {
                from: fromAddress,
                to: toAddress,
                value: sendValue.toString(),
                gasLimit: gasLimit.toString(),
                nonce,
                chainId: this.chainId,
                ...gasConfig,
            };

        } catch (error: any) {
            throw new Error("createTransaction error: " + error.message);
        }
    }

    async createERC20TransferTx(
        fromAddress: string,
        tokenAddress: string,
        toAddress: string,
        amount: string,
        tokenDecimals: number
    ) {
        try {
            const balance = await this.provider.getBalance(fromAddress);
            const feeData = await this.provider.getFeeData();
            const supports1559 = !!(feeData.maxFeePerGas && feeData.maxPriorityFeePerGas);
            const nonce = await this.provider.getTransactionCount(fromAddress, "pending");

            const iface = new ethers.Interface(["function transfer(address to, uint256 value)"]);
            const amountToSend = ethers.parseUnits(amount, tokenDecimals);
            const data = iface.encodeFunctionData("transfer", [toAddress, amountToSend]);

            const gasLimit = await this.provider.estimateGas({
                from: fromAddress,
                to: tokenAddress,
                data: data
            });

            let gasFee: bigint;
            let gasConfig: any = {};

            if (supports1559) {
                const maxFeePerGas = feeData.maxFeePerGas!;
                const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas!;
                gasFee = gasLimit * maxFeePerGas;
                gasConfig = {
                    maxFeePerGas: maxFeePerGas.toString(),
                    maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                    type: 2,
                };
            } else {
                const gasPrice = feeData.gasPrice ?? ethers.parseUnits("1", "gwei");
                gasFee = gasLimit * gasPrice;
                gasConfig = { gasPrice: gasPrice.toString(), type: 0 };
            }

            if (balance < gasFee) {
                throw new Error("Insufficient main token balance to cover gas fee");
            }

            return {
                from: fromAddress,
                to: tokenAddress,
                data: data,
                gasLimit: gasLimit.toString(),
                nonce,
                chainId: this.chainId,
                ...gasConfig,
            };

        } catch (error: any) {
            throw new Error("createERC20TransferTx error: " + error.message);
        }
    }

    async sendTransaction(privateKey: string, tx: TransactionRequest): Promise<string> {
        if (!privateKey.startsWith("0x")) privateKey = "0x" + privateKey;
        const wallet = new ethers.Wallet(privateKey, this.provider);
        if (tx.from != wallet.address) {
            throw new Error("sendTransaction error: invalid from" );
        }
        try {
            tx.from = wallet.address;

            const nonce = await this.provider.getTransactionCount(wallet.address, "pending");

            // Get network fee data
            const feeData = await this.provider.getFeeData();

            // Estimate gas limit if not provided
            const gasLimit = tx.gasLimit ?? await this.provider.estimateGas(tx);

            // Prefer EIP-1559 (type 2) if the network supports it, otherwise use legacy type 0
            if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
                tx.type = 2;
                tx.maxFeePerGas = feeData.maxFeePerGas;
                tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
            } else {
                tx.type = 0;
                tx.gasPrice = tx.gasPrice ?? feeData.gasPrice;
            }

            // Fill in missing basic parameters
            tx.nonce = nonce;
            tx.chainId = this.chainId;
            tx.gasLimit = gasLimit;

            // Sign and send the raw transaction
            const signedTx = await wallet.signTransaction(tx);
            return await this.provider.send("eth_sendRawTransaction", [signedTx]);

        } catch (error: any) {
            throw new Error("sendTransaction error: " + error.message);
        }
    }

    async blockNumber(): Promise<number> {
        return await this.provider.getBlockNumber();
    }

    async getBlockByNumber(block_number: string, flag: boolean): Promise<Block | null> {
        return await this.provider.getBlock(block_number, flag);
    }

    async getTransactionReceipt(hash: string) {
        return await this.provider.getTransactionReceipt(hash)
    }

    async ethCall(tx: TransactionRequest): Promise<string> {
        return await this.provider.call(tx)
    }
}