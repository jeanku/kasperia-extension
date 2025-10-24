import { Chrome } from '@/chrome/chrome'
import { LinkItem } from '@/model/links';

export class Share {

    static async getAll(): Promise<LinkItem[]> {
        return Chrome.request({ action: "Share.getAll" })
    }

    static async add(item: Partial<LinkItem>): Promise<void> {
        return Chrome.request({ action: "Share.add", item })
    }

    static async remove(id: string): Promise<void> {
        return Chrome.request({ action: "Share.remove", id })
    }
    
}
