import { keyringService, preferenceService, contactService, notificationService, permissionService } from './service';

const handlers: Record<string, (message: any) => Promise<any> | any> = {
    "Keyring.isBoot": () => keyringService.isBoot(),
    "Keyring.state": () => keyringService.state(),
    "Keyring.boot": (msg) => keyringService.boot(msg.password),
    "Keyring.isLocked": () => keyringService.isLocked(),
    "Keyring.lock": () => keyringService.lock(),
    "Keyring.unlock": (msg) => keyringService.unlock(msg.password),
    // "Keyring.getWalletById": (msg) => keyringService.getWalletById(msg.password, msg.id),

    "Keyring.setActiveWallet": (msg) => keyringService.setActiveWallet(msg.id),
    "Keyring.getActiveWalletPrivateKeyForKaspa": () => keyringService.getActiveWalletPrivateKeyForKaspa(),
    "Keyring.getActiveAccountDisplay": () => keyringService.getActiveAccountDisplay(),
    "Keyring.getActiveAccountAndSyncPreference": () => keyringService.getActiveAccountAndSyncPreference(),
    "Keyring.getAccountSubAccountsDisplay": () => keyringService.getAccountSubAccountsDisplay(),
    "Keyring.getActivePublicKey": (msg) => keyringService.getActivePublicKey(),
    
    "Keyring.getAccountList": () => keyringService.getAccountList(),
    "Keyring.getAccountsSubListDisplay": () => keyringService.getAccountsSubListDisplay(),

    "Keyring.addAccountFromPrivateKey": (msg) => keyringService.addAccountFromPrivateKey(msg.privateKey),
    "Keyring.addAccountFromMnemonic": (msg) => keyringService.addAccountFromMnemonic(msg.mnemonic, msg.passphrase),
    "Keyring.removeAccount": (msg) => keyringService.removeAccount(msg.id),
    "Keyring.setAccountName": (msg) => keyringService.setAccountName(msg.id, msg.name),
    "Keyring.checkPassword": (msg) => keyringService.checkPassword(msg.password),
    "Keyring.setNewPassword": (msg) => keyringService.setNewPassword(msg.password),
    "Keyring.addSubAccount": (msg) => keyringService.addSubAccount(msg.id),
    "Keyring.removeSubAccount": (msg) => keyringService.removeSubAccount(msg.id, msg.path),
    "Keyring.switchSubAccount": (msg) => keyringService.switchSubAccount(msg.id, msg.path),
    "Keyring.setSubAccountName": (msg) => keyringService.setSubAccountName(msg.id, msg.path, msg.name),

    "Keyring.getPrivateKey": (msg) => keyringService.getPrivateKey(msg.password, msg.id, msg.index),
    "Keyring.getMnemonic": (msg) => keyringService.getMnemonic(msg.password, msg.id),
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

    "Notification.resolveApproval": (msg) => notificationService.resolveApproval(msg.data, msg.forceReject),
    "Notification.rejectApproval": (msg) => notificationService.rejectApproval(msg.err, msg.stay, msg.isInternal),
    "Notification.getApproval": () => notificationService.getApproval(),
    "Permission.addConnectedSite": (msg) => permissionService.addConnectedSite(msg.origin, msg.name, msg.icon),


    // Contact handlers
    "Contact.add": (msg) => contactService.add(msg.address),
    "Contact.get": () => contactService.get(),
    "Contact.changeName": (msg) => contactService.changeName(msg.address, msg.name),
    "Contact.remove": (msg) => contactService.remove(msg.address),
};
const handleError = (error: unknown, sendResponse: (response: any) => void) => {
    const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
    console.log(`[bg] onMessage error:, ${errorMessage}`);
    sendResponse({ error: errorMessage });
};
const addServiceListener = () => chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    const { action } = message;
    console.log(`[bg] onMessage:, ${action}`);
    try {
        const handler = handlers[action];
        if (!handler) {
            throw Error(`${action} not found`)
        }
        handler(message).then((result: any) => {
            console.log("result", result);
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
