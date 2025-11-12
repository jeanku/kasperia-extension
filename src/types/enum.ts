
export enum AddressType {
    KaspaAddress = 1,
    EvmAddress = 2,
}

export enum NetworkType {
    Default = -1,
    Mainnet = 0,
    Testnet = 1,
}

export enum NetworkName {
    Mainnet = 'Mainnet',
    Testnet = 'Testnet 10',
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

export enum EvmExplorerUrl {
    Mainnet = 'https://explorer.kasplex.org/tx/',
    Testnet = 'https://explorer.testnet.kasplextest.xyz/tx/',
}

export enum ApiUrl {
    Mainnet = 'https://kasbridge-evm-api.kaspafoundation.org/',
    Testnet = 'https://kasbridge-tn10evm-api.kaspafoundation.org/',
}

export const OrderApiKay = {
    Mainnet:  {
        appid: "25070309",
        appsecret: 'e50a2796234a2b7ab65b896dd1d0ed16'
    },
    Testnet: {
        appid: "36274501",
        appsecret: '097e4886510707a1ddb9cd22140779ee'
    }
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


export enum ChainPath {
    KaspaPath = "m/44'/111111'/0'/0/",
    KaspaL2Path = "m/44'/60'/0'/0/"
}
