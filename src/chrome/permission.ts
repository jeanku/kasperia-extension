import { Chrome } from '@/chrome/chrome'
import { Network, KasPrice } from '@/model/account'
import { TokenList, Oplist } from '@/model/krc20'
import {ConnectedSite} from "@/background/service/permission";

export class Permission extends Chrome {

    static addConnectedSite(origin: string, name: string, icon: string): Promise<any> {
        return Chrome.request({ action: "Permission.addConnectedSite", origin, name, icon })
    }

    static getConnectedSites(): Promise<ConnectedSite[]> {
        return Chrome.request({ action: "Permission.getConnectedSites" })
    }

    static removeConnectedSite(origin: string): Promise<ConnectedSite[]> {
        return Chrome.request({ action: "Permission.removeConnectedSite", origin })
    }
}
