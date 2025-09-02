import { Wasm, Rpc, Kiwi } from '@kasplex/kiwi-web'

type BalanceCallback = (balance: number) => void;

interface AddressProcessor {
    processor: Wasm.UtxoProcessor;
    context: Wasm.UtxoContext;
    lastBalance: number;
    callback: BalanceCallback;
    listener: (event: any) => void;
}

export class WatchBalance {
    private client: Wasm.RpcClient | null = null;
    private networkId: string;
    private addressProcessors: Map<string, AddressProcessor> = new Map();

    constructor(networkId: string, client: Wasm.RpcClient | null) {
        this.client = client;
        this.networkId = networkId;
    }

    public async addAddress(address: string, callback: BalanceCallback) {
        if (this.addressProcessors.has(address)) {
            return;
        }

        try {
            const processor = new Wasm.UtxoProcessor({
                rpc: this.client!,
                networkId: this.networkId,
            });
            await processor.start();
            const context = new Wasm.UtxoContext({ processor });
            const addressObj = new Wasm.Address(address);
            await context.trackAddresses([addressObj]);
            const listener = (event: any) => {
                const mature = Number(event.data?.balance?.mature ?? 0);
                const pending = Number(event.data?.balance?.pending ?? 0);
                const state = this.addressProcessors.get(address);
                if (!state) return;

                if (pending === 0 && state.lastBalance !== mature) {
                    state.lastBalance = mature;
                    state.callback(mature);
                }
            };

            processor.addEventListener('balance', listener);
            this.addressProcessors.set(address, {
                processor,
                context,
                lastBalance: 0,
                callback,
                listener,
            });
        } catch (error) {
            console.error(`Error adding address ${address}:`, error);
            throw error;
        }
    }

    public async removeAddress(address: string) {
        const state = this.addressProcessors.get(address);
        if (!state) return;

        state.processor.removeEventListener('balance', state.listener);
        await state.processor.stop();
        this.addressProcessors.delete(address);
    }

    public async stop() {
        for (const address of this.addressProcessors.keys()) {
            await this.removeAddress(address);
        }
    }
}