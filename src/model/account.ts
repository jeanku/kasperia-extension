import {Oplist, TokenList } from '@/model/krc20'
import { Transaction } from '@/model/kaspa'
import { Account, AccountDisplay } from '@/model/wallet'
import { AccountType } from '@/types/enum';

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
    name: string,
    networkId: number,
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
    krc20OpList?: Oplist[],
    kaspaTxList?: Transaction[],
    networkConfig?: Record<number, Network>,
    accountsBalance?: Record<string, string>,
    contractAddress?: Record<string, string>,
    lockTime: number,
    kasPrice?: KasPrice,
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