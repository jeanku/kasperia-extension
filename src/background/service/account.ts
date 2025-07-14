import { Preference } from '@/background/service/preference';
import { keyringService } from '@/background/service';
import { Wasm, Rpc, Kiwi } from '@kasplex/kiwi-web'

export class Account {

    private networkId: number = 0;
    private balance: bigint = 0n;
    // private event: bigint = 0n;

    async connect() {
        const network = await Preference.getNetwork()
        if (network == null) {
            return
        }
        this.networkId = network.networkId
        Kiwi.setNetwork(network.networkId)
        if (!Rpc.getInstance() || !Rpc.getInstance().client.isConnected) {
            await Rpc.setInstance(Kiwi.network).connect()
        }
        this.addListener()
    }

    async reconnect() {
        const network = await Preference.getNetwork()
        if (network == null) {
            return
        }
        if (this.networkId == network.networkId) {
            return
        }
        Kiwi.setNetwork(network.networkId)
        if (!Rpc.getInstance() || !Rpc.getInstance().client.isConnected) {
            await Rpc.setInstance(Kiwi.network).connect()
        }
    }

    async addListener() {
        const publicKey = await keyringService.getActiveAccountPublicKey()
        let address = new Wasm.PublicKey(publicKey).toAddress(this.networkId as Wasm.NetworkType).toString()
        const balance = await Rpc.getInstance().client.getBalanceByAddress({address})
        this.balance = balance.balance
        console.log("balance: ", this.balance)

        Rpc.getInstance().client.addEventListener('utxos-changed', async (event: any) => {
            console.log(`UTXO changes detected for address: ${address}`, 'INFO');
            console.log(`Event data: ${JSON.stringify(event, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value, 2)}`, 'DEBUG');
        });
    }

    async getBalance() {
        return this.balance
    }
}

const account = new Account();
account.connect()

export default account;


