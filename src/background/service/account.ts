import { keyringService, preferenceService } from './index';
import { Rpc, Kiwi, initialize } from '@kasplex/kiwi-web'

export class Account {

    private isLoadWasm: boolean = false;

    async init() {
        if (this.isLoadWasm) {
            return
        }
        const wasmUrl = chrome.runtime.getURL('kaspa_bg.wasm');
        await initialize(wasmUrl);
        const network = await preferenceService.getNetwork()
        console.log("Account init ....")
        this.isLoadWasm = true
    }

    // getBalance returns current address balance
    async getBalance() {
        await this.init()
        try {
            let instance = Rpc.getInstance()
            if (!instance.client.isConnected) {
                throw Error("connect first")
            }
        } catch (Error) {
            let network = await preferenceService.getNetwork()
            Kiwi.setNetwork(network.networkId)
            await Rpc.setInstance(network.networkId, network.url).connect()
        }
        const address = await keyringService.getActiveAddress()
        return Rpc.getInstance().client.getBalanceByAddress({address: address!})
    }
}

const account = new Account();

export default account;


