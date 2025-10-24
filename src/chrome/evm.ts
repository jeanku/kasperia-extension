import { Chrome } from '@/chrome/chrome'
import { EvmNetwork, Erc20Options } from '@/model/evm';

export class Evm {

    static async getNetworks(): Promise<EvmNetwork[]> {
        return Chrome.request({ action: "Evm.getNetworks" })
    }

    static async getNetwork(chainId: string): Promise<EvmNetwork | undefined> {
        return Chrome.request({ action: "Evm.getNetwork", chainId })
    }

    static async addNetwork(network: EvmNetwork): Promise<void> {
        return Chrome.request({ action: "Evm.addNetwork", network })
    }

    static async removeNetwork(chainId: string): Promise<void> {
        return Chrome.request({ action: "Evm.removeNetwork", chainId })
    }

    static async getSelectedNetwork(): Promise<EvmNetwork | undefined> {
        return Chrome.request({ action: "Evm.getSelectedNetwork" })
    }

    static async setSelectedNetwork(chainId: string): Promise<void> {
        return Chrome.request({ action: "Evm.setSelectedNetwork", chainId })
    }

    static async getContracts(chainId: string): Promise<void> {
        return Chrome.request({ action: "Evm.getContracts", chainId })
    }

    static async addContract(chainId: string, contract: Erc20Options): Promise<void> {
        return Chrome.request({ action: "Evm.addContract", chainId, contract })
    }

    static async removeContract(chainId: string, address: string): Promise<void> {
        return Chrome.request({ action: "Evm.removeContract", chainId, address })
    }

}
