import { Address } from '@/model/contact'
import { Chrome } from '@/chrome/chrome'
import { AccountDisplay } from "@/model/wallet"

export class Common extends Chrome {

    static addressFromPrivateKey(privateKey: string): Promise<any> {
        return Chrome.request({ action: "Common.addressFromPrivateKey", privateKey })
    }

    static checkMnemonic(mnemonic: string): Promise<boolean> {
        return Chrome.request({ action: "Common.checkMnemonic", mnemonic })
    }

    static addressFromMnemonic(mnemonic: string, passphrase: string): Promise<any> {
        return Chrome.request({ action: "Common.addressFromMnemonic", mnemonic, passphrase })
    }

}
