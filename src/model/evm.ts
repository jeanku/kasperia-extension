export type EvmNetwork = {
    chainId: string;             // EVM chain ID
    symbol: string;              // EVM chain ID
    name: string;                // network name
    rpcUrl: string[];            // RPC endpoint
    explorer: string;            // optional block explorer
    decimals: number;            // optional block explorer
    contracts?: Erc20Options[]
    select?: boolean
}

export type Erc20Options = {
    symbol: string;   // token symbol
    name: string;     // token name
    address: string;  // contract address
    decimals: number; // contract decimals
    image?: string;
};


export type EvmTokenList = {
    native: boolean,
    symbol: string;
    balance: string,
    name: string,
    address: string,
    decimals: number
}


// src/types/api.ts
export interface TransactionResponse {
    items: TransactionItem[];
    next_page_params: NextPageParams;
}

export interface TransactionItem {
    priority_fee: string;
    raw_input: string;
    result: string;
    hash: string;
    max_fee_per_gas: string;
    revert_reason: string | null;
    confirmation_duration: [number, number];
    transaction_burnt_fee: string;
    type: number;
    token_transfers_overflow: any | null;
    confirmations: number;
    position: number;
    max_priority_fee_per_gas: string;
    transaction_tag: string | null;
    created_contract: string | null;
    value: string;
    from: AddressInfo;
    gas_used: string;
    status: string;
    to: AddressInfo;
    authorization_list: any[];
    method: string | null;
    fee: {
        type: string;
        value: string;
    };
    actions: any[];
    gas_limit: string;
    gas_price: string;
    decoded_input: any | null;
    token_transfers: any | null;
    base_fee_per_gas: string;
    timestamp: string;
    nonce: number;
    historic_exchange_rate: string | null;
    transaction_types: string[];
    exchange_rate: string | null;
    block_number: number;
    has_error_in_internal_transactions: boolean | null;
}

export interface AddressInfo {
    ens_domain_name: string | null;
    hash: string;
    implementations: any[];
    is_contract: boolean;
    is_scam: boolean;
    is_verified: boolean;
    metadata: any | null;
    name: string | null;
    private_tags: any[];
    proxy_type: string | null;
    public_tags: any[];
    watchlist_names: any[];
}

export interface NextPageParams {
    block_number: number;
    fee: string;
    hash: string;
    index: number;
    inserted_at: string;
    items_count: number;
    value: string;
}


// Token 信息
export interface TokenInfo {
    address: string;
    address_hash: string;
    circulating_market_cap: string | null;
    decimals: string;
    exchange_rate: string | null;
    holders: string;
    holders_count: string;
    icon_url: string | null;
    name: string;
    symbol: string;
    total_supply: string;
    type: string;
    volume_24h: string | null;
}

// 转账总额信息
export interface TotalInfo {
    decimals: string;
    value: string;
}

// 地址信息
export interface AddressTokenInfo {
    ens_domain_name: string | null;
    hash: string;
    implementations: any[];
    is_contract: boolean;
    is_scam: boolean;
    is_verified: boolean;
    metadata: any | null;
    name: string | null;
    private_tags: any[];
    proxy_type: any | null;
    public_tags: any[];
    watchlist_names: any[];
}

// 单条交易记录
export interface TransactionTokenItem {
    block_hash: string;
    block_number: number;
    from: AddressTokenInfo;
    to: AddressTokenInfo;
    log_index: number;
    method: string | null;
    timestamp: string; // UTC 时间
    token: TokenInfo | null;
    total: TotalInfo | null;
    transaction_hash: string;
    type: "token_transfer" | "coin_transfer";
}

export interface TransactionTokenResponse {
    items: TransactionTokenItem[];
    next_page_params: Record<string, any> | null;
}

export interface AddEthereumChainParameter {
    /**
     * Chain ID in hexadecimal format (must be a string, e.g. '0x1')
     */
    chainId: string;

    /**
     * Human-readable name of the network
     */
    chainName: string;

    /**
     * Native currency details (optional)
     */
    nativeCurrency: {
        /**
         * Name of the native currency (e.g. Ethereum, Kaspa)
         */
        name: string;

        /**
         * Symbol of the native currency (3–6 characters)
         */
        symbol: string;

        /**
         * Number of decimals (commonly 18 or 8)
         */
        decimals: number;
    };

    /**
     * Array of RPC endpoint URLs (at least one required)
     */
    rpcUrls: string[];

    /**
     * Array of block explorer URLs (optional)
     */
    blockExplorerUrls?: string[];

    /**
     * Array of icon resource URLs (optional)
     */
    iconUrls?: string[];
}


export interface KnsAsset {
    id: string;
    assetId: string;
    mimeType: string;
    asset: string;
    owner: string;
    creationBlockTime: string;
    isDomain: boolean;
    isVerifiedDomain?: boolean; // 可选，因为非域名资产没有这个字段
    status: string;
    transactionId: string;
}

export interface KnsPagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface KnsAssetsResponse {
    success: boolean;
    data: {
        assets: KnsAsset[];
        pagination: KnsPagination;
    };
}



export interface ERC20TokenMeta {
    address: string;
    decimals: number;
    symbol: string;
    name: string;
}

export interface ERC20ApproveMeta {
    type: "ERC20";
    method: "approve";
    signature: string;
    args: {
        spender: string;
        amount: string;
    };
    token: ERC20TokenMeta;
}

export interface ERC20TransferMeta {
    type: "ERC20";
    method: "transfer";
    signature: string;
    args: {
        to: string;
        amount: string;
    };
    token: ERC20TokenMeta;
}

export interface ERC20TransferFromMeta {
    type: "ERC20";
    method: "transferFrom";
    signature: string;
    args: {
        from: string;
        to: string;
        amount: string;
    };
    token: ERC20TokenMeta;
}

export type ERC20Meta =
    | ERC20ApproveMeta
    | ERC20TransferMeta
    | ERC20TransferFromMeta;


