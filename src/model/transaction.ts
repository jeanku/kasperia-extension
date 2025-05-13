import { TokenList } from '@/model/krc20'
import {Transaction} from '@/model/kaspa'

// export type SendTx = {
//     tick: string,
//     amount: string,
//     dec: number
// }

export type SubmitSendTx =  {
    address: string,
    amount: bigint,
    payload: string,
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