import { Chrome } from '@/chrome/chrome'
import { NetworkConfig, ContractConfig } from '@/model/evm';

export class Evm {

    static async getNetworks(): Promise<NetworkConfig[]> {
        return Chrome.request({ action: "Evm.getNetworks" })
    }

    static async getNetwork(chainId: string): Promise<NetworkConfig | undefined> {
        return Chrome.request({ action: "Evm.getNetwork", chainId })
    }

    static async addNetwork(network: NetworkConfig): Promise<void> {
        return Chrome.request({ action: "Evm.addNetwork", network })
    }

    static async removeNetwork(chainId: string): Promise<void> {
        return Chrome.request({ action: "Evm.removeNetwork", chainId })
    }

    static async getSelectedNetwork(): Promise<NetworkConfig | undefined> {
        return Chrome.request({ action: "Evm.getSelectedNetwork" })
    }

    static async setSelectedNetwork(chainId: string): Promise<void> {
        return Chrome.request({ action: "Evm.setSelectedNetwork", chainId })
    }

    static async getContracts(chainId: string): Promise<void> {
        return Chrome.request({ action: "Evm.getContracts", chainId })
    }

    static async addContract(chainId: string, contract: ContractConfig): Promise<void> {
        return Chrome.request({ action: "Evm.getContracts", chainId, contract })
    }

    static async removeContract(chainId: string, address: string): Promise<void> {
        return Chrome.request({ action: "Evm.removeContract", chainId, address })
    }

}
