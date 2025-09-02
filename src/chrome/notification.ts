import { Chrome } from '@/chrome/chrome'
import { Network, KasPrice } from '@/model/account'
import { TokenList, Oplist, } from '@/model/krc20'

export class Notification extends Chrome {

    static resolveApproval(data?: any, forceReject = false): Promise<any> {
        return Chrome.request({ action: "Notification.resolveApproval", data, forceReject })
    }

    static rejectApproval(err?: string, stay = false, isInternal = false): Promise<any> {
        return Chrome.request({ action: "Notification.rejectApproval" ,err, stay, isInternal })
    }

    static getApproval(): Promise<any> {
        return Chrome.request({ action: "Notification.getApproval" })
    }
}
