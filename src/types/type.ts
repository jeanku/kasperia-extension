import {ethers } from 'ethers'

export interface HeadNavProps {
    title?: string;
    rightTit?: string;
    url?: string;
    leftDom?: React.ReactNode;
    rightType?: string;
    loading?: boolean;
    showLeft?: boolean;
    state?: Object;
    onBack?: () => void;
    onClickRight?: () => void;
}
export type MessageType = 'info' | 'success' | 'warning' | 'error';
export interface MessageConfig {
    content: React.ReactNode;
    duration?: number;
    type?: MessageType;
    closable?: boolean;
    leftIcon?: React.ReactNode | null;
    key?: string;
}
export interface MessageContextType {
    add: (config: MessageConfig) => string;
    remove: (key: string) => void;
}

export interface AccountData {
    key: string,
    text: string,
    icon: string,
    url: string
}

export interface Session {
    origin: string;
    icon: string;
    name: string;
}

export interface PlainObject {
    [key: string]: string | number | boolean | null | undefined | Record<string, unknown> | Array<unknown>;
}

export interface ApiResponse<T = unknown> {
    code?: number;
    message?: string;
    data: T;
}

export interface AppKey {
    appid: number  | string;
    appsecret: string;
}
export type NetworkNameType = 'Mainnet' | 'Testnet'

export interface ContactAddress {
    name: string
    address: string
}

export interface AccountDrive {
    name: string
    address: string
}

export interface AccountGroup {
    name: string
    drive: AccountDrive[]
}

export type AddressSelectResult = {
    source: 'Contacts' | 'Accounts'
    name: string
    address: string
    groupName?: string
}


export interface ChainConfig {
    name?: string;
    rpcUrl: string[];
    chainId: number;
    symbol?: string;
    fSymbol?: string;
    decimals: number;
    token: string;
    estTime: string;
    isTestnet?: boolean;
    iconText?: string;
    bridgeAddress: string;
    blockExplorerUrl?: string;
    networkName?: string;
    minAmount?: number;
}

export interface StableCoinData extends ChainConfig {
    address: string;
    balance: string;
    baseFee?: number;
}

export interface TokenListItem {
    name: string;
    symbol: string;
    fSymbol: string;
    decimals: number;
    token: string;
    feeRate?: number; 
    baseFee?: number;
    iconText?: string;
    chainId?: number;
}
export interface ApiTokenInfo {
    address: string
    address_hash: string
    circulating_market_cap: number | null
    decimals: string
    exchange_rate: number | null
    holders: string
    holders_count: string
    icon_url: string | null
    name: string
    symbol: string
    total_supply: string
    type: string
    volume_24h: number | null
}

export interface TokenBalanceItem {
    token: ApiTokenInfo
    token_id: string | null
    token_instance: string | null
    value: string
}


export interface StableCoinItem {
    chainId: number
    address: string;
    name: string;
    rpcUrl: string[];
    networkName: string;
    symbol: string;
    balance: string;
    fSymbol: string;
    decimals: number;
    token: string
    baseFee: number
    estTime: string
}

export interface EvmNetworkItem {
    chainId: string;
    name: string;
}

export type uiModel = "sidepanel" | "main";