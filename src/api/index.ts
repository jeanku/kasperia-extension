import { HttpClient } from '@/utils/http'
import type{  PlainObject, ApiResponse, NetworkNameType, TokenBalanceItem } from '@/types/type' 
import { ApiUrl, OrderApiKay } from '@/types/enum'
import { TokenListApi, HistoryApiUrl } from '@/types/constant'
import { StableCoin } from '@/pages/stablecoin';

const http = new HttpClient();

export interface OrderListItem {
    id: number;
    txid: string;
    from_address?: string;
    from?: string;
    to?: string;
    to_address: string;
    to_eth_address?: string;
    to_kaspa_address?: string;
    amount: string;
    type?: string;
    amountSent?: string;
    amountFee: string;
    block_time: number;
    bridge_amount: string;
    bridgeAmount: string;
    fee: string;
    hash: string;
    state: string;
    height?: number;
    create_time: string;
    showTime?: string
}

export interface StablecoinItem {
    id: number;
    amount: string;
    bridgeAmount: string;
    claimHash: string;
    createTime: string;
    fee: string;
    fromAddress: string;
    fromNetwork: number;
    hash: string;
    remark: string;
    state: string;
    status: number;
    toAddress: string;
    toNetwork: number;
    token: string;
    tokenAddress: string;
    decimal: number;
    to_decimal: number;
    showFee?: string;
    explorerUrl?: string;
    statusStr?: string;
    showTime?: string;
}
export async function getKaspaList(urlType: NetworkNameType, params: PlainObject): Promise<OrderListItem[]> {
    const url = ApiUrl[urlType]
    const apiKey = OrderApiKay[urlType]
    const response = await http.get(`${url}api/kaspa-list`, params, params, apiKey) as ApiResponse
    return response.data as OrderListItem[]
}

export async function getKlayerList(urlType: NetworkNameType, params: PlainObject): Promise<OrderListItem[]> {
    const url = ApiUrl[urlType]
    const apiKey = OrderApiKay[urlType]
    const response = await http.get(`${url}api/klayer-list`, params, params, apiKey) as ApiResponse
    return response.data as OrderListItem[]
}

export async function getTokenBalanceByAddress(chainId: string, params: PlainObject) {
    const url = `${TokenListApi[chainId]}${params.address}/token-balances`;
    return await http.get(url) as TokenBalanceItem[]
}

// StableCoin History
export async function getDepositList(urlType: NetworkNameType, params: PlainObject) {
    const apiKey = OrderApiKay[urlType]
    const response = await http.get(`${HistoryApiUrl}api/deposit-list`, params, params, apiKey) as ApiResponse
    return response.data as StablecoinItem[]
}

export async function getWithdrawList(urlType: NetworkNameType, params: PlainObject) {
    const apiKey = OrderApiKay[urlType]
    const response = await http.get(`${HistoryApiUrl}api/withdraw-list`, params, params, apiKey) as ApiResponse
    return response.data as StablecoinItem[]
}