import { TokenList } from '@/model/krc20'

export type SubmitSendTx =  {
    address: string,
    amount: bigint,
    payload: string | undefined,
    token: TokenList,
}

export type AddressBook = {
    name: string,
    address: string,
    drive?: Array<{name: string, pubKey: string, address: string}>,
}

export type AccountDrive = {
    name: string,
    pubKey: string,
    address: string,
}