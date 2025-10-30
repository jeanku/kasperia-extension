import { AddressType } from '@/types/enum'
import { NetworkType } from "@/utils/wallet/consensus";

export type Address = {
    name: string,
    address: string,
    type: AddressType
    network: NetworkType,
}