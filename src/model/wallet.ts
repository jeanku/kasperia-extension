import { AccountType } from '@/types/enum';

export type SubAccount = {
    name: string,
    priKey: string,
    path: number,
}

export type Account = {
    id: string,
    name: string,
    subName:string,
    index: number,
    priKey: string,
    mnemonic: string,
    type: AccountType,
    passphrase: string,
    path:number,
    drive:  SubAccount[],
}

export type AccountDisplay = {
    id: string,
    name: string,
    subName:string,
    type: AccountType,
    active: boolean,
    address: string,
    ethAddress: string,
    balance: string,
}


export type WalletPrivateKey = {
    priKey: string,
}

export type MnemonicDisplay = {
    mnemonic: string,
    path: string,
    passphrase: string,
}