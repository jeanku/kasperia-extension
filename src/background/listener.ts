import {
    keyringService, preferenceService, contactService, notificationService, permissionService,
    evmService, shareService, tokenService, accountService
} from './service';

const handlers: Record<string, (message: any) => Promise<any> | any> = {
    "Keyring.isBoot": () => keyringService.isBoot(),
    "Keyring.state": () => keyringService.state(),
    "Keyring.boot": (msg) => keyringService.boot(msg.password),
    "Keyring.isLocked": () => keyringService.isLocked(),
    "Keyring.lock": () => keyringService.lock(),
    "Keyring.unlock": (msg) => keyringService.unlock(msg.password),

    "Keyring.setActiveWallet": (msg) => keyringService.setActiveWallet(msg.id),
    "Keyring.getActiveAccountDisplay": () => keyringService.getActiveAccountDisplay(),
    "Keyring.getActiveAccountAndSyncPreference": () => keyringService.getActiveAccountAndSyncPreference(),
    "Keyring.getAccountSubAccountsDisplay": () => keyringService.getAccountSubAccountsDisplay(),
    "Keyring.getActivePublicKey": () => keyringService.getActivePublicKey(),
    
    "Keyring.getAccountList": () => keyringService.getAccountList(),
    "Keyring.getAccountsSubListDisplay": (msg) => keyringService.getAccountsSubListDisplay(msg.type),

    "Keyring.addAccountFromPrivateKey": (msg) => keyringService.addAccountFromPrivateKey(msg.privateKey),
    "Keyring.addAccountFromMnemonic": (msg) => keyringService.addAccountFromMnemonic(msg.mnemonic, msg.passphrase),
    "Keyring.removeAccount": (msg) => keyringService.removeAccount(msg.id),
    "Keyring.setAccountName": (msg) => keyringService.setAccountName(msg.id, msg.name),
    "Keyring.checkPassword": (msg) => keyringService.checkPassword(msg.password),
    "Keyring.setNewPassword": (msg) => keyringService.setNewPassword(msg.password),
    "Keyring.addSubAccount": (msg) => keyringService.addSubAccount(msg.id, msg.name),
    "Keyring.removeSubAccount": (msg) => keyringService.removeSubAccount(msg.id, msg.path),
    "Keyring.switchSubAccount": (msg) => keyringService.switchSubAccount(msg.id, msg.path),
    "Keyring.setSubAccountName": (msg) => keyringService.setSubAccountName(msg.id, msg.path, msg.name),

    "Keyring.getPrivateKey": (msg) => keyringService.getPrivateKey(msg.password, msg.id, msg.index),
    "Keyring.getMnemonic": (msg) => keyringService.getMnemonic(msg.password, msg.id),
    "Keyring.getActiveAddressForEvm": (msg) => keyringService.getActiveAddressForEvm(),
    "Keyring.clear": () => keyringService.clear(),

    // Preference handlers
    "Preference.getNetwork": () => preferenceService.getNetwork(),
    "Preference.setNetwork": (msg) => preferenceService.setNetwork(msg.network),

    "Preference.getCurrentAccount": () => preferenceService.getCurrentAccount(),
    "Preference.setCurrentAccount": (msg) => preferenceService.setCurrentAccount(msg.account),
    "Preference.setKrc20TokenList": (msg) => preferenceService.setKrc20TokenList(msg.data),
    "Preference.getKrc20TokenList": () => preferenceService.getKrc20TokenList(),
    "Preference.setKrc20OpList": (msg) => preferenceService.setKrc20OpList(msg.data),
    "Preference.getKrc20OpList": () => preferenceService.getKrc20OpList(),
    "Preference.setKaspaTxList": (msg) => preferenceService.setKaspaTxList(msg.data),
    "Preference.getKaspaTxList": () => preferenceService.getKaspaTxList(),
    "Preference.getAll": () => preferenceService.getAll(),
    "Preference.getNetworkConfig": () => preferenceService.getNetworkConfig(),
    "Preference.setNetworkConfig": (msg) => preferenceService.setNetworkConfig(msg.network),
    "Preference.setAccountsBalance": (msg) => preferenceService.setAccountsBalance(msg.accountsBalance),
    "Preference.getAccountsBalance": () => preferenceService.getAccountsBalance(),
    "Preference.updateAccountsBalance": (msg) => preferenceService.updateAccountsBalance(msg.address, msg.balance),
    "Preference.getLockTime": () => preferenceService.getLockTime(),
    "Preference.setLockTime": (msg) => preferenceService.setLockTime(msg.lockTime),
    "Preference.setKasPrice": (msg) => preferenceService.setKasprice(msg.price),
    "Preference.setContractAddress": (msg) => preferenceService.setContractAddress(msg.data),
    "Preference.setEvm20TokenList": (msg) => preferenceService.setEvm20TokenList(msg.chainId, msg.data),
    "Preference.setIndex": (msg) => preferenceService.setIndex(msg.index),

    "Permission.addConnectedSite": (msg) => permissionService.addConnectedSite(msg.origin, msg.name, msg.icon),
    "Permission.getConnectedSites": () => permissionService.getConnectedSites(),
    "Permission.removeConnectedSite": (msg) => permissionService.removeConnectedSite(msg.origin),

    "Notification.resolveApproval": (msg) => notificationService.resolveApproval(msg.data, msg.forceReject),
    "Notification.rejectApproval": (msg) => notificationService.rejectApproval(msg.err, msg.stay, msg.isInternal),
    "Notification.getApproval": () => notificationService.getApproval(),

    // Contact handlers
    "Contact.add": (msg) => contactService.add(msg.address),
    "Contact.get": (msg) => contactService.get(msg.type),
    "Contact.getAll": () => contactService.getAll(),
    "Contact.changeName": (msg) => contactService.changeName(msg.address, msg.name),
    "Contact.remove": (msg) => contactService.remove(msg.address),
    
    // Evm handlers
    "Evm.getNetworks": () => evmService.getNetworks(),
    "Evm.getNetwork": (msg) => evmService.getNetwork(msg.chainId),
    "Evm.addNetwork": (msg) => evmService.addNetwork(msg.network),
    "Evm.removeNetwork": (msg) => evmService.removeNetwork(msg.chainId),
    "Evm.getSelectedNetwork": () => evmService.getSelectedNetwork(),
    "Evm.setSelectedNetwork": (msg) => evmService.setSelectedNetwork(msg.chainId),
    "Evm.getContracts": (msg) => evmService.getContracts(msg.chainId),
    "Evm.addContract": (msg) => evmService.addContract(msg.chainId, msg.contract),
    "Evm.removeContract": (msg) => evmService.removeContract(msg.chainId, msg.address),

    // Share handlers
    "Share.getAll": () => shareService.getAll(),
    "Share.add": (msg) => shareService.add(msg.item),
    "Share.remove": (msg) => shareService.remove(msg.id),

    // "Token.sendEth": (msg) => tokenService.sendEth(msg.to, msg.amount),
    "Token.createTransaction": (msg) => tokenService.createTransaction(msg.from, msg.to, msg.amount),
    "Token.createERC20TransferTx": (msg) => tokenService.createERC20TransferTx(msg.from, msg.tokenAddress, msg.toAddress, msg.amount, msg.tokenDecimals),
    "Token.sendTransaction": (msg) => tokenService.sendTransaction(msg.tx),

    "Account.signMessage": (msg) => accountService.signMessage(msg.message),
    "Account.getBalance": (msg) => accountService.getBalance(msg.address),
    "Account.getAddressesBalance": (msg) => accountService.getAddressesBalance(msg.addresses),
    "Account.transferKrc20": (msg) => accountService.transferKrc20(msg.tick, msg.ca, msg.amount, msg.to),
    "Account.deployKrc20": (msg) => accountService.deployKrc20(msg.data),
    "Account.mintKrc20": (msg) => accountService.mintKrc20(msg.txid, msg.balance, msg.tick, msg.times, msg.useUtxo),
    "Account.estimateFee": (msg) => accountService.estimateFee(msg.to, msg.amount, msg.payload),
    "Account.transferKas": (msg) => accountService.transferKas(msg.to, msg.amount, msg.payload),
};

const handleError = (error: unknown, sendResponse: (response: any) => void) => {
    const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
    console.log(`【bg event error】 error:, ${errorMessage}`);
    sendResponse({ error: errorMessage });
};

const addServiceListener = () => chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    const { action } = message;
    console.log(`【bg event start】 onMessage:, ${action}`);
    try {
        const handler = handlers[action];
        if (!handler) {
            throw Error(`${action} not found`)
        }
        handler(message).then((result: any) => {
            console.log("【bg event end】", result);
            sendResponse(result);
        }).catch((error: { toString: () => any; }) => {
            handleError(error, sendResponse);
        });
    } catch (error) {
        handleError(error, sendResponse);
    }
    return true;
});

export default addServiceListener;
