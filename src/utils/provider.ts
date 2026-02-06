import { ethers, FetchRequest } from "ethers";
import {type BlockTag, TransactionRequest} from "ethers/src.ts/providers/provider";
import { ERC20Meta } from "@/model/evm";

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

type RpcHealth = {
    ok: number;
    fail: number;
    latency: number;
};

export class Provider {
    private chainId: number;
    private rpcUrls: string[];

    public provider?: ethers.JsonRpcProvider;
    private providerPromise?: Promise<ethers.JsonRpcProvider>;

    private health = new Map<string, RpcHealth>();
    private decimalsCache = new Map<string, number>();

    constructor(rpcUrls: string[], chainId: number) {
        this.chainId = chainId;
        this.rpcUrls = rpcUrls;
        for (const url of rpcUrls) {
            this.health.set(url, { ok: 0, fail: 0, latency: 9999 });
        }
    }

    private async initProvider(): Promise<ethers.JsonRpcProvider> {
        const url = await this.pickBestRpc();
        const req = new FetchRequest(url);
        req.timeout = 8000;
        req.setHeader("content-type", "application/json");

        const provider = new ethers.JsonRpcProvider(
            req,
            { chainId: this.chainId, name: "custom" },
            { staticNetwork: true, batchMaxCount: 1 }
        );

        await provider.getBlockNumber();
        return provider;
    }

    async get_provider(): Promise<ethers.JsonRpcProvider> {
        try {
            if (this.provider) return this.provider;
            if (!this.providerPromise) {
                this.providerPromise = this.initProvider();
            }
            this.provider = await this.providerPromise;
            return this.provider;
        } catch (error) {
            throw new Error("fetch rpc error")
        }
    }

    private async testRpc(url: string): Promise<number> {
        const start = Date.now();
        try {
            const req = new FetchRequest(url);
            req.timeout = 1000;
            const p = new ethers.JsonRpcProvider(
                req,
                { chainId: this.chainId, name: "custom" },
                { staticNetwork: true, batchMaxCount: 1 }
            );
            await p.getBlockNumber();

            const latency = Date.now() - start;
            this.health.get(url)!.ok++;
            this.health.get(url)!.latency = latency;
            return latency;
        } catch {
            this.health.get(url)!.fail++;
            return Infinity;
        }
    }

    private async pickBestRpc(): Promise<string> {
        const results = await Promise.all(
            this.rpcUrls.map(async url => ({
                url,
                latency: await this.testRpc(url)
            }))
        );
        results.sort((a, b) => a.latency - b.latency);
        return results[0].url;
    }

    /* ================= Safe Call ================= */

    private async safeCall<T>(fn: (p: ethers.JsonRpcProvider) => Promise<T>): Promise<T> {
        const provider = await this.get_provider();
        try {
            return await fn(provider);
        } catch (e) {
            this.provider = undefined;
            this.providerPromise = undefined;
            const p2 = await this.get_provider();
            return await fn(p2);
        }
    }

    getBlockByNumber(block_number: string, flag: boolean) {
        return this.safeCall(p => p.getBlock(block_number, flag));
    }

    getBlockNumber() {
        return this.safeCall(p => p.getBlockNumber());
    }

    getBalance(address: string, blockTag?: BlockTag) {
        return this.safeCall(p => p.getBalance(address, blockTag));
    }

    call(tx: ethers.TransactionRequest) {
        return this.safeCall(p => p.call(tx));
    }

    estimateGas(tx: ethers.TransactionRequest) {
        return this.safeCall(p => p.estimateGas(tx));
    }

    getTransaction(hash: string) {
        return this.safeCall(p => p.getTransaction(hash));
    }

    getTransactionReceipt(hash: string) {
        return this.safeCall(p => p.getTransactionReceipt(hash));
    }

    getCode(address: string, blockTag?: BlockTag) {
        return this.safeCall(p => p.getCode(address, blockTag));
    }

    getTransactionCount(address: ethers.AddressLike, blockTag?: BlockTag) {
        return this.safeCall(p => p.getTransactionCount(address, blockTag));
    }

    async getTokenBalance(address: string, token: { symbol: string; address: string; decimals: number }): Promise<string> {
        return this.safeCall(async p => {
            const c = new ethers.Contract(token.address, ERC20_ABI, p);
            const [bal, dec] = await Promise.all([
                c.balanceOf(address),
                token.decimals
            ]);
            return ethers.formatUnits(bal, dec);
        });
    }

    async getTokenInfo(token: string) {
        return this.safeCall(async p => {
            const c = new ethers.Contract(token, ERC20_ABI, p);
            const [name, symbol, decimals] = await Promise.all([
                c.name(),
                c.symbol(),
                c.decimals()
            ]);
            return {
                address: token,
                name,
                symbol,
                decimals: Number(decimals)
            };
        });
    }

    async getMultipleTokenBalances(
        address: string,
        tokens: { symbol: string; address: string; decimals: number }[]
    ): Promise<Record<string, string>> {
        const result: Record<string, string> = {};
        await Promise.all(
            tokens.map(async token => {
                result[token.address] = await this.getTokenBalance(address, token);
            })
        );
        return result;
    }

    async buildTx(tx: ethers.TransactionRequest): Promise<ethers.TransactionRequest> {
        return this.safeCall(async p => {
            if (!tx.from) {
                throw new Error("tx.from is required");
            }

            if (tx.nonce == null) {
                tx.nonce = await p.getTransactionCount(tx.from, "pending");
            }

            if (tx.chainId == null) {
                tx.chainId = this.chainId;
            }

            if (tx.gasLimit == null) {
                const estimated = await p.estimateGas(tx);
                tx.gasLimit = (estimated * 120n / 100n).toString();
            }

            const needFee =
                tx.gasPrice == null &&
                tx.maxFeePerGas == null &&
                tx.maxPriorityFeePerGas == null;

            if (needFee) {
                const fee = await p.getFeeData();
                if (fee.maxFeePerGas && fee.maxPriorityFeePerGas) {
                    tx.gasPrice = fee.gasPrice?.toString()
                    tx.maxFeePerGas = fee.maxFeePerGas.toString();
                    tx.maxPriorityFeePerGas = fee.maxPriorityFeePerGas.toString();
                } else if (fee.gasPrice) {
                    tx.gasPrice = fee.gasPrice.toString();
                }
            }

            if (tx.value == null) {
                tx.value = 0;
            } else {
                tx.value = tx.value.toString()
            }
            return tx;
        });
    }

    async buildERC20TransferTx(params: {
        from: string;
        token: string;
        to: string;
        amount: string;
    }): Promise<ethers.TransactionRequest> {
        const iface = new ethers.Interface([
            "function transfer(address to, uint256 amount)"
        ]);
        const data = iface.encodeFunctionData("transfer", [
            params.to,
            params.amount
        ]);

        return this.buildTx({
            from: params.from,
            to: params.token,
            data
        });
    }

    async buildSendEthTx(params: {
        from: string;
        to: string;
        amount: string; // wei string
    }): Promise<ethers.TransactionRequest> {
        const balance = await this.getBalance(params.from);
        const tx = await this.buildTx({
            from: params.from,
            to: params.to,
            value: 0
        });

        let gasFee: bigint;
        if (tx.maxFeePerGas != null) {
            // @ts-ignore
            gasFee = BigInt(tx.gasLimit!) * BigInt(tx.maxFeePerGas);
        } else if (tx.gasPrice != null) {
            // @ts-ignore
            gasFee = BigInt(tx.gasLimit!) * BigInt(tx.gasPrice);
        } else {
            throw new Error("Missing gas price");
        }

        const amountBI = BigInt(params.amount);
        if (amountBI + gasFee > balance) {
            const adjusted = balance - gasFee;
            if (adjusted <= 0n) {
                throw new Error("Insufficient balance to cover gas fee");
            }
            tx.value = adjusted.toString()
        } else {
            tx.value = amountBI.toString()
        }
        return tx;
    }

    async sendTx(
        signer: ethers.Signer,
        tx: ethers.TransactionRequest
    ): Promise<ethers.TransactionResponse> {
        if (tx.maxFeePerGas && tx.maxPriorityFeePerGas && tx.gasPrice) {
            tx.gasPrice = null
        }
        return await signer.sendTransaction(tx);
    }

    async parseERC20Meta(tx: any): Promise<ERC20Meta | null> {
        if (!tx.to || !tx.data || tx.data === "0x") return null;
        const erc20Interface = new ethers.Interface(ERC20_ABI);
        let parsed;
        try {
            parsed = erc20Interface.parseTransaction({ data: tx.data });
        } catch {
            return null;
        }

        if (!parsed || !["approve", "transfer", "transferFrom"].includes(parsed.name)) {
            return null;
        }

        const token = new ethers.Contract(tx.to, ERC20_ABI, this.provider);

        let decimals = 18;
        let symbol = "";
        let name = "";

        try { decimals = Number(await token.decimals()); } catch {}
        try { symbol = await token.symbol(); } catch {}
        try { name = await token.name(); } catch {}

        switch (parsed.name) {
            case "approve":
                return {
                    type: "ERC20",
                    method: "approve",
                    signature: parsed.signature,
                    args: {
                        spender: parsed.args.spender as string,
                        amount: parsed.args.amount.toString()
                    },
                    token: {
                        address: tx.to,
                        decimals,
                        symbol,
                        name
                    }
                };

            case "transfer":
                return {
                    type: "ERC20",
                    method: "transfer",
                    signature: parsed.signature,
                    args: {
                        to: parsed.args.to as string,
                        amount: parsed.args.amount.toString()
                    },
                    token: {
                        address: tx.to,
                        decimals,
                        symbol,
                        name
                    }
                };

            case "transferFrom":
                return {
                    type: "ERC20",
                    method: "transferFrom",
                    signature: parsed.signature,
                    args: {
                        from: parsed.args.from as string,
                        to: parsed.args.to as string,
                        amount: parsed.args.amount.toString()
                    },
                    token: {
                        address: tx.to,
                        decimals,
                        symbol,
                        name
                    }
                };
        }

        return null
    }
}
