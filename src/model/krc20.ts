export type TokenListResponse = {
    message: string,
    next: string,
    prev: string,
    result: TokenList[]
}

export type TokenList = {
    tick?: string
    ca?: string
    balance: string,
    dec: string
    locked: string
    name: string
}

export type Oplist = {
    amt: string
    checkpoint: string
    feeRev: string
    from: string
    hashRev: string
    mtsAdd: string
    mtsMod: string
    op: string
    opAccept: string
    opError: string
    opScore: string
    p: string
    tick: string
    to: string
    txAccept: string
    dec?: string
    pre?: string
    ca?: string
    name?: string
}

export type OpInfo = {
    dec: string
    hashRev: string
    holder: any
    holderTotal: string
    lim: string
    max: string
    mintTotal: string
    minted: string
    mtsAdd: string
    opScoreAdd: string
    opScoreMod: string
    pre: string
    state: string
    tick: string
    to: string
    transferTotal: string
}