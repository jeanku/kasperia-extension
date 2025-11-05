import { HttpClient } from '@/utils/http'
import type{  PlainObject, ApiResponse, NetworkNameType } from '@/types/type' 
import { ApiUrl } from '@/types/enum'

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
export async function getKaspaList(urlType: NetworkNameType, params: PlainObject): Promise<OrderListItem[]> {
    const url = ApiUrl[urlType]
    const response = await http.get(`${url}api/kaspa-list`, params, params, true) as ApiResponse
    return response.data as OrderListItem[]
}

export async function getKlayerList(urlType: NetworkNameType, params: PlainObject): Promise<OrderListItem[]> {
    const url = ApiUrl[urlType]
    const response = await http.get(`${url}api/klayer-list`, params, params, true) as ApiResponse
    return response.data as OrderListItem[]
}