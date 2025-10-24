import { NetworkType, AddressType } from '@/types/enum'

export type Address = {
    name: string,
    address: string,
    type: AddressType
    network: NetworkType,
}