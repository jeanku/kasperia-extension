import {Oplist, TokenList } from '@/model/krc20'
import { KaspaTransaction } from '@/utils/wallet/kaspa'
import { Account, AccountDisplay } from '@/model/wallet'
import { AccountType } from '@/types/enum';
import { EvmTokenList } from "@/model/evm";
import { NetworkType } from "@/utils/wallet/consensus";
import { NetworkId, ScriptPublicKey } from '../utils/wallet/consensus';

export type KeyRingAccess = {
    isBooted: boolean,
    isLocked: boolean
}

export type KeyRingAccount = {
    password: string,
    id: string,
    account: Map<string, Account>,
}

export type KeyRingState = {
    booted: string,
    vault: string
}

export type AccountBalance = {
    address: string,
    balance: string,
    dec: string
}

export type Network = {
    networkType: NetworkType,
    url: string,
}

export type KasPrice = {
    time: number
    price: number
}

export type PreferenceState = {
    network: Network,
    currentAccount?: AccountDisplay,
    krc20TokenList?: TokenList[],
    evmTokenList: Record<string, EvmTokenList[]>,
    krc20OpList?: Oplist[],
    kaspaTxList?: KaspaTransaction[],
    networkConfig?: Partial<Record<NetworkType, Network>>,
    accountsBalance?: Record<string, string>,
    contractAddress?: Record<string, string>,
    lockTime: number,
    kasPrice?: KasPrice,
    index?: string,
}

export type AccountSubListDisplay = {
    id: string,
    type: AccountType,
    path: number,
    drive: Array<{name: string, address: string, active: boolean, path: number}>,
}

export type AccountsSubListDisplay = {
    id: string,
    name: string,
    drive: Array<{name: string, address: string, active: boolean, path: number}>,
}

export type SubmitSetting = {
    outputs: Array<{address: string, amount: string}>;
    priorityFee?: number;
    payload?: string;
}

export type SubmitBuilderOptions = {
    protocol: string;
    action: string;
}