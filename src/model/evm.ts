export type NetworkConfig = {
    chainId: number;             // EVM chain ID
    name: string;                // network name
    rpcUrl: string;              // RPC endpoint
    explorer: string;            // optional block explorer
    contracts?: ContractConfig[]
}

export type ContractConfig = {
    symbol: string;   // token symbol
    name: string;     // token name
    address: string;  // contract address
    decimals: number; // contract decimals
};