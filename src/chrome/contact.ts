import { Address } from '@/model/contact'
import { Chrome } from '@/chrome/chrome'
import {AddressType} from "@/types/enum";

export class Contact extends Chrome {
    
    static add(address: Address): Promise<any> {
        return Chrome.request({ action: "Contact.add", address: address })
    }

    static getAll(): Promise<any> {
        return Chrome.request({ action: "Contact.getAll" })
    }

    static get(type: AddressType | undefined = undefined): Promise<any> {
        return Chrome.request({ action: "Contact.get", type })
    }

    static changeName(address: string, name: string): Promise<any> {
        return Chrome.request({ action: "Contact.changeName", name: name, address: address })
    }

    static remove(address: string): Promise<any> {
        return Chrome.request({ action: "Contact.remove", address: address })
    }
}
