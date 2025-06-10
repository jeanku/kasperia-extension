import { MINUTE } from '@/types/constant'

export enum NetworkType {
    Mainnet = 0,
    Testnet = 1,
}

export enum NetworkName {
    Mainnet = 'Mainnet',
    Testnet = 'Testnet10',
}

export enum TipMsgType  {
    default = "default",
    success = "success",
    error = "error",
    alert = "alert",
    info = "info",
}

export enum KaspaExplorerUrl {
    Mainnet = 'https://kas.fyi/txs/',
    Testnet = 'https://explorer-tn10.kaspa.org/txs/',
}

export enum KaspaEnum {
    KAS = "KAS"
}

export enum LockTime {
    Never = 360000000000000,
    FIVE_MINUTES = 300000,
    TEN_MINUTES = 600000,
    THIRTY_MINUTES = 1800000,
    ONE_HOUR = 3600000,
}

export const LockTimeList = [
    {
        name: '5 minutes after idle',
        value: LockTime.FIVE_MINUTES
    },
    {
        name: '10 minutes after idle',
        value: LockTime.TEN_MINUTES
    },
    {
        name: '30 minutes after idle',
        value: LockTime.THIRTY_MINUTES
    },
    {
        name: '1 hours after idle',
        value: LockTime.ONE_HOUR
    },
    {
        name: 'Never',
        value: LockTime.Never
    },
]

export enum TickState {
    Deployed,
    Finished,
    NotFind,
}

export enum AccountType {
    Mnemonic,
    PrivateKey,
}