import {Oplist, TokenList } from '@/model/krc20'
import { Transaction } from '@/model/kaspa'
import { Wallet, AccountDisplay } from '@/model/wallet'

// export type TokenList = {
//     balance: string,
//     dec: string
//     locked: string
//     opScoreMod: string
//     tick: string
// }

export type KeyRingAccess = {
    isBooted: boolean,
    isLocked: boolean
}

export type KeyRingAccount = {
    password: string,
    account: Wallet[],
}

export type KeyRingState = {
    booted: string,
    vault: string
}

// export type Krc20List = {
//     tick: string,
//     name: string,
//     balance: string,
//     dec: string
// }

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

export type AddressListDisplay = {
    id: string,
    name: string,
    drive: Array<{name: string, address: string, active: boolean, index: number}>,
}