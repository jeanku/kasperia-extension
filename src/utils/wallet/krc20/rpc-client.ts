import { HttpRequest } from './http-request';
import { RpcClient } from '../rpc/index';
import {
  GetKrc20AddressTokenListResponse,
  GetKrc20BalanceResponse,
  GetKrc20TokenInfoResponse,
  Krc20Response,
  GetKrc20TokenListResponse,
  GetKrc20OperationListResponse,
  GetKrc20OperationDetailsResponse,
  GetKrc20VspcDetailsResponse,
  GetKrc20DataByOPrangeResponse,
  GetKrc20ListingListResponse,
  Krc20PagerRequest,
  makeQueryString,
  Krc20TokenListRequest
} from './types';
import { NetworkType } from '../consensus';


export class Krc20Client {
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
        return 'https://api.kasplex.org/v1';
      case NetworkType.Testnet:
        return 'https://tn10api.kasplex.org/v1';
      default:
        throw new Error(`Krc20 not supported for this network ${networkId.toString()}`);
    }
  }

  // Restored get methods
  /**
   * Retrieves the current indexer status, including DAA score and OP score.
   * @returns A promise that resolves to the indexer status.
   */
  async getIndexerStatus(): Promise<any> {
    return await this.httpRequest.get<any>('/info');
  }

  /**
   * Retrieves the list of all KRC-20 tokens.
   * @returns A promise that resolves to the list of all tokens.
   */
  async getKrc20TokenList(req: Krc20PagerRequest): Promise<Krc20Response<GetKrc20TokenListResponse>> {
    const url = this.buildUrl('/krc20/tokenlist', req);
    return await this.httpRequest.get<Krc20Response<GetKrc20TokenListResponse>>(url);
  }

  /**
   * Retrieves information about a specific KRC-20 token.
   * @param tick - The ticker symbol of the KRC-20 token.
   * @returns A promise that resolves to the token information.
   */
  async getKrc20TokenInfo(tick: string): Promise<Krc20Response<GetKrc20TokenInfoResponse>> {
    return await this.httpRequest.get<Krc20Response<GetKrc20TokenInfoResponse>>(`/krc20/token/${tick}`);
  }

  /**
   * Retrieves the list of KRC-20 tokens held by a specific address.
   * @param address - The address to query.
   * @returns A promise that resolves to the list of tokens held by the address.
   */
  async getKrc20AddressTokenList(address: string): Promise<Krc20Response<GetKrc20AddressTokenListResponse>> {
    console.log("fetchKrc20TokenList 3")
    return await this.httpRequest.get<Krc20Response<GetKrc20AddressTokenListResponse>>(
      `/krc20/address/${address}/tokenlist`
    );
  }

  /**
   * Retrieves the balance of a specific KRC-20 token for a given address.
   * @param address - The address to query.
   * @param tick - The ticker symbol of the KRC-20 token.
   * @returns A promise that resolves to the token balance.
   */
  async getKrc20Balance(address: string, tick: string): Promise<Krc20Response<GetKrc20BalanceResponse>> {
    return await this.httpRequest.get<Krc20Response<GetKrc20BalanceResponse>>(
      `/krc20/address/${address}/token/${tick}`
    );
  }

  /**
   * Retrieves the list of operations for a specific address.
   * @param req - The request parameters.
   * @returns A promise that resolves to the list of operations.
   */
  async getKrc20OperationList(req: Krc20TokenListRequest): Promise<Krc20Response<GetKrc20OperationListResponse>> {
    const url = this.buildUrl('/krc20/oplist', req);
    return await this.httpRequest.get<Krc20Response<GetKrc20OperationListResponse>>(url);
  }

  /**
   * Retrieves details of a specific operation.
   * @param operationId - The ID of the operation.
   * @returns A promise that resolves to the operation details.
   */
  async getKrc20OperationDetails(operationId: string): Promise<Krc20Response<GetKrc20OperationDetailsResponse>> {
    return await this.httpRequest.get<Krc20Response<GetKrc20OperationDetailsResponse>>(`/krc20/op/${operationId}`);
  }

  /**
   * Retrieves details of a specific VSPC (Virtual Smart Contract).
   * @param daaScore - The DAA score of the VSPC.
   * @returns A promise that resolves to the VSPC details.
   */
  async getKrc20VspcDetails(daaScore: string): Promise<Krc20Response<GetKrc20VspcDetailsResponse>> {
    return await this.httpRequest.get<Krc20Response<GetKrc20VspcDetailsResponse>>(`/archive/vspc/${daaScore}`);
  }

  /**
   * Retrieves data by operation range.
   * @param oprange - The operation range to query.
   * @returns A promise that resolves to the data for the specified range.
   */
  async getKrc20DataByOPrange(oprange: string): Promise<Krc20Response<GetKrc20DataByOPrangeResponse>> {
    return await this.httpRequest.get<Krc20Response<GetKrc20DataByOPrangeResponse>>(`/archive/oplist/${oprange}`);
  }

  /**
   * Retrieves the list of KRC-20 token listings.
   * @param tick - The ticker symbol of the KRC-20 token.
   * @returns A promise that resolves to the list of token listings.
   */
  async getKrc20ListingList(tick: string): Promise<Krc20Response<GetKrc20ListingListResponse>> {
    return await this.httpRequest.get<Krc20Response<GetKrc20ListingListResponse>>(`/krc20/market/${tick}`);
  }

  private buildUrl(base: string, params: Record<string, any>): string {
    try {
      const queryString = makeQueryString(params);
      return queryString ? `${base}?${queryString}` : base;
    } catch (error: any) {
      throw new Error(`Failed to build URL: ${error.message}`);
    }
  }
}
