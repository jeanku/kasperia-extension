import { Chrome } from '@/chrome/chrome'
import { Network, KasPrice } from '@/model/account'
import { TokenList, Oplist, } from '@/model/krc20'
import { Transaction } from '@/model/kaspa'

export class Permission extends Chrome {

    static addConnectedSite(origin: string, name: string, icon: string): Promise<any> {
        return Chrome.request({ action: "Permission.addConnectedSite", origin, name, icon })
    }
}
