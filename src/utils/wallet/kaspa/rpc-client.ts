import { HttpRequest } from './http-request';
import { RpcClient } from '../rpc/index';
import {
   KaspaFullTransactionsRequest, KaspaFullTransactionsResponse,
} from './types';
import { NetworkType } from '../consensus';


export class KaspaClient {
  private httpRequest: HttpRequest;
  private readonly rpcClient?: RpcClient;

  /**
   * Creates an instance of Krc20RpcClient.
   * @param options - The options for the Krc20RpcClient.
   */
  constructor(networkType: NetworkType) {
    let domain = this.getDefaultEndpoint(networkType);
    this.httpRequest = new HttpRequest(domain);
  }

  /**
   * Retrieves the default endpoint based on the network ID.
   * @param networkId - The network ID.
   * @returns The default endpoint URL.
   */
  private getDefaultEndpoint(networkId: NetworkType): string {
    switch (networkId) {
      case NetworkType.Mainnet:
        return 'https://api.kaspa.org';
      case NetworkType.Testnet:
        return 'https://api-tn10.kaspa.org';
      default:
        throw new Error(`Krc20 not supported for this network ${networkId.toString()}`);
    }
  }

  /**
   * Retrieves full transaction details for a specific Kaspa address.
   * @param address The Kaspa wallet address to query.
   * @param param Optional query parameters (e.g., limit, offset, fields, resolve_previous_outpoints).
   * @returns A Promise resolving to the full transaction details.
   */
  async getFullTransactions(address: string, req: KaspaFullTransactionsRequest) {
    const url = this.buildUrl(`/addresses/${address}/full-transactions`, req);
    return await this.httpRequest.get<KaspaFullTransactionsResponse>(url);
  }

  private buildUrl(base: string, params: Record<string, any>): string {
    try {
      const queryString = Object.keys(params)
          .filter((key) => params[key] !== undefined)
          .map((key) => `${key}=${encodeURIComponent(params[key]!.toString())}`)
          .join('&');
      return queryString ? `${base}?${queryString}` : base;
    } catch (error: any) {
      throw new Error(`Failed to build URL: ${error.message}`);
    }
  }
}
