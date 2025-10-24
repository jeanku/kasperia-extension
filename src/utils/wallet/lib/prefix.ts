/**
 * Enum representing different address prefixes for various network types.
 */
enum AddressPrefix {
    Mainnet = 'kaspa',
    Testnet = 'kaspatest',
    Simnet = 'kaspasim',
    Devnet = 'kaspadev',
}

enum NetworkType {
    Mainnet = 'mainnet',
    Testnet = 'testnet',
    Devnet = 'devnet',
    Simnet = 'simnet'
}

/**
 * Helper class for working with AddressPrefix.
 */
class AddressPrefixHelper {

    /**
     * Parses a string to an AddressPrefix.
     * @param {string} prefix - The string representation of the address prefix.
     * @returns {AddressPrefix} The corresponding AddressPrefix enum value.
     * @throws {Error} If the prefix is unknown.
     */
    public static parse(prefix: string): AddressPrefix {
        switch (prefix) {
            case 'kaspa':
                return AddressPrefix.Mainnet;
            case 'kaspatest':
                return AddressPrefix.Testnet;
            case 'kaspasim':
                return AddressPrefix.Simnet;
            case 'kaspadev':
                return AddressPrefix.Devnet;
            default:
                throw new Error(`Unknown prefix: ${prefix}`);
        }
    }

    /**
     * Converts an AddressPrefix to a NetworkType.
     * @param {AddressPrefix} addressPrefix - The address prefix to convert.
     * @returns {NetworkType} The corresponding NetworkType enum value.
     * @throws {Error} If the address prefix is unknown.
     */
    public static toNetworkType(addressPrefix: AddressPrefix): NetworkType {
        switch (addressPrefix) {
            case AddressPrefix.Mainnet:
                return NetworkType.Mainnet;
            case AddressPrefix.Testnet:
                return NetworkType.Testnet;
            case AddressPrefix.Simnet:
                return NetworkType.Simnet;
            case AddressPrefix.Devnet:
                return NetworkType.Devnet;
            default:
                throw new Error(`Unknown address prefix: ${addressPrefix}`);
        }
    }
}

class NetworkTypeHelper {
    public static toAddressPrefix(network: NetworkType): AddressPrefix {
        switch (network) {
            case NetworkType.Mainnet:
                return AddressPrefix.Mainnet;
            case NetworkType.Testnet:
                return AddressPrefix.Testnet;
            case NetworkType.Simnet:
                return AddressPrefix.Simnet;
            case NetworkType.Devnet:
                return AddressPrefix.Devnet;
            default:
                throw new Error(`Unknown network: ${network}`);
        }
    }
}

export { AddressPrefix, AddressPrefixHelper, NetworkType, NetworkTypeHelper };