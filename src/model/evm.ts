export type NetworkConfig = {
    chainId: string;             // EVM chain ID
    symbol: string;             // EVM chain ID
    name: string;                // network name
    rpcUrl: string;              // RPC endpoint
    explorer: string;            // optional block explorer
    contracts?: ContractConfig[]
    select?: boolean
}

export type ContractConfig = {
    symbol: string;   // token symbol
    name: string;     // token name
    address: string;  // contract address
    decimals: number; // contract decimals
};


export type EvmTokenList = {
    symbol: string;
    balance: string,
    name: string,
    tokenAddress?: string,
}