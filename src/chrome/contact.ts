import { Address } from '@/model/contact'
import { Chrome } from '@/chrome/chrome'

export class Contact extends Chrome {
    static add(address: Address): Promise<any> {
        return Chrome.request({ action: "Contact.add", address: address })
    }

    static get(): Promise<any> {
        return Chrome.request({ action: "Contact.get" })
    }

    static changeName(address: string, name: string): Promise<any> {
        return Chrome.request({ action: "Contact.changeName", name: name, address: address })
    }

    static remove(address: string): Promise<any> {
        return Chrome.request({ action: "Contact.remove", address: address })
    }
}
