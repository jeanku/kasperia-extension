import { AccountType } from '@/types/enum';

export type Account = {
    name: string,
    index: number,
    pubKey: string,
    priKey: string,
}

export type Wallet = {
    id: string,
    name: string,
    index: number,
    active: boolean,
    pubKey: string,
    priKey: string,
    mnemonic: string,
    type: AccountType,
    accountName:string,
    passphrase?: string,
    path?:number,
    drive?:  Account[],
}

export type AccountDisplay = {
    id: string,
    name: string,
    pubKey: string,
    active: boolean,
    accountName:string,
    type: AccountType,
    address: string,
    balance: string,
}

export type SubAccount = {
    name: string,
    index: number,
    address: string,
}

export type SubAccountAdd = {
    name: string,
}

export type AccountWithSubDisplay = {
    id: string,
    name: string,
    type: AccountType,
    path:number,
    drive:  SubAccount[],
}