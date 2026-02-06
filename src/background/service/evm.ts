import {Storage} from '@/utils/storage';
import {Erc20Options, EvmNetwork} from '@/model/evm';
import {ObservableStore} from '@metamask/obs-store';
import {sessionService} from './index';

/**
 * EVM Service
 * Manages EVM networks and contracts using ObservableStore and persists data via Storage utility
 */
export class EVM {

    private store: ObservableStore<{
        selected: string
        networks: Record<string, EvmNetwork>
    }> | undefined;

    /** Initialize store from storage */
    private async load() {
        if (!this.store) {
            const data = await Storage.getData<{
                selected: string
                networks: Record<string, EvmNetwork>
            }>('evmRpcConfig');
            this.store = new ObservableStore(
                data || {
                    selected: '202555', networks: {
                        "202555": {
                            chainId: "202555",
                            symbol: "KAS",
                            name: "Kasplex-L2-Mainnet",
                            rpcUrl: ["https://evmrpc.kasplex.org/"],
                            explorer: "https://explorer.kasplex.org",
                            decimals: 18,
                            select: true,
                        },
                        "167012": {
                            chainId: "167012",
                            symbol: "TKAS",
                            name: "Kasplex-L2-Testnet",
                            rpcUrl: ["https://rpc.kasplextest.xyz"],
                            explorer: "https://explorer.testnet.kasplextest.xyz",
                            decimals: 18,
                            select: false,
                        },
                        "38836": {
                            chainId: "38836",
                            symbol: "iKAS",
                            name: "Igra Caravel",
                            rpcUrl: ["https://galleon-testnet.igralabs.com:8545"],
                            explorer: "https://explorer.galleon-testnet.igralabs.com/",
                            decimals: 18,
                            select: false,
                        }
                    }
                }
            );
        }
    }

    /** Get all network configs */
    async getNetworks(): Promise<EvmNetwork[]> {
        await this.load();
        let networks = Object.values(this.store!.getState().networks);
        return networks.map(({contracts, ...rest}) => {
            rest.select = rest.chainId == this.store!.getState().selected
            return rest
        });
    }

    /** Get a network by ID */
    async getNetwork(chainId: string): Promise<EvmNetwork | undefined> {
        await this.load();
        let network = this.store!.getState().networks[chainId];
        if (network) {
            network.contracts = undefined
            network.select = network.chainId == this.store!.getState().selected
        }
        return network
    }

    /** Add a new network or replace existing */
    async addNetwork(network: EvmNetwork) {
        await this.load();
        const state = this.store!.getState();
        state.selected = network.chainId
        if (!state.networks[network.chainId]) {
            this.store!.updateState({
                ...state,
                networks: {...state.networks, [network.chainId]: network},
            });
        } else {
            this.store!.updateState({
                ...state,
                networks: {...state.networks, [network.chainId]: {
                    ...state.networks[network.chainId],
                    ...network
                }},
            });
        }
        return this.persistToStorage();
    }

    /** Remove a network by ID */
    async removeNetwork(chainId: string) {
        await this.load();
        const state = this.store!.getState();
        if (!state.networks[chainId]) return;
        const {[chainId]: _, ...rest} = state.networks;
        if (state.selected == chainId) {
            let temp = Object.values(rest)
            state.selected = temp.length > 0 ? temp[0].chainId : ""
            sessionService.broadcastEvent('chainChanged', '0x' + Number(state.selected).toString(16));
        }
        this.store!.updateState({...state, networks: rest});
        return this.persistToStorage();
    }

    /** Get the currently selected network */
    async getSelectedChainId(): Promise<string> {
        await this.load();
        const state = this.store!.getState();
        return state.selected;
    }

    async checkChainIdExist(chainId: string): Promise<boolean> {
        await this.load();
        const state = this.store!.getState();
        return state.networks[chainId] != undefined;
    }


    /** Get the currently selected network */
    async getSelectedNetwork(): Promise<EvmNetwork | undefined> {
        await this.load();
        const state = this.store!.getState();
        return state.networks[state.selected];
    }

    /** Set a new selected network */
    async setSelectedNetwork(chainId: string) {
        await this.load();
        const state = this.store!.getState();
        if (!state.networks[chainId]) {
            throw new Error(`Network ${chainId} not found`);
        }
        this.store!.updateState({
            ...state,
            selected: chainId,
        });
        sessionService.broadcastEvent('chainChanged', '0x' + Number(chainId).toString(16));
        return this.persistToStorage();
    }

    /** Get all contracts in a network */
    async getContracts(chainId: string): Promise<Erc20Options[]> {
        const network = await this.getNetwork(chainId);
        return network?.contracts || [];
    }

    /**
     * Add or update a contract in a network
     * Update is based on `address`, not symbol
     */
    async addContract(chainId: string, contract: Erc20Options) {
        await this.load();
        const state = this.store!.getState();
        const network = state.networks[chainId];
        if (!network) throw new Error(`Network ${chainId} not found`);
        const contracts = network.contracts || [];
        const idx = contracts.findIndex(c => c.address === contract.address);
        if (idx >= 0) {
            contracts[idx] = contract; // update existing
        } else {
            contracts.push(contract); // add new
        }
        this.store!.updateState({
            ...state,
            networks: {
                ...state.networks,
                [chainId]: {...network, contracts},
            },
        });
        return this.persistToStorage();
    }

    /** Remove a contract by address */
    async removeContract(chainId: string, address: string) {
        await this.load();
        const state = this.store!.getState();
        const network = state.networks[chainId];
        if (!network || !network.contracts) return;

        const contracts = network.contracts.filter(c => c.address !== address);
        this.store!.updateState({
            ...state,
            networks: {
                ...state.networks,
                [chainId]: {...network, contracts},
            },
        });
        return this.persistToStorage();
    }

    /** Persist store to storage */
    async persistToStorage(): Promise<void> {
        await Storage.setData('evmRpcConfig', this.store!.getState());
    }
}

const evm = new EVM();

export default evm;
