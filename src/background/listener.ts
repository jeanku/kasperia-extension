import { keyringService, preferenceService, contactService, notificationService, permissionService,
    accountService, commonService
} from './service';

const handlers: Record<string, (message: any) => Promise<any> | any> = {
    "Keyring.isBoot": () => keyringService.isBoot(),
    "Keyring.state": () => keyringService.state(),
    "Keyring.boot": (msg) => keyringService.boot(msg.password),
    "Keyring.isLocked": () => keyringService.isLocked(),
    "Keyring.lock": () => keyringService.lock(),
    "Keyring.unlock": (msg) => keyringService.unlock(msg.password),
    "Keyring.getWalletById": (msg) => keyringService.getWalletById(msg.password, msg.id),
    "Keyring.setActiveWallet": (msg) => keyringService.setActiveWallet(msg.id),
    "Keyring.getActiveWalletKeys": () => keyringService.getActiveWalletKeys(),
    "Keyring.getActiveAccount": () => keyringService.getActiveAccount(),
    "Keyring.getActiveAccountWithSubAccounts": () => keyringService.getActiveAccountWithSubAccounts(),
    "Keyring.getWalletList": () => keyringService.getWalletList(),
    // "Keyring.addWallet": (msg) => keyringService.addWallet(msg.wallet),
    "Keyring.removeWallet": (msg) => keyringService.removeWallet(msg.id),
    "Keyring.setWalletName": (msg) => keyringService.setWalletName(msg.id, msg.name),
    "Keyring.checkPassword": (msg) => keyringService.checkPassword(msg.password),
    "Keyring.setNewPassword": (msg) => keyringService.setNewPassword(msg.password),
    "Keyring.addDriveAccount": (msg) => keyringService.addDriveAccount(msg.id, msg.account),
    "Keyring.switchDriveAccount": (msg) => keyringService.switchDriveAccount(msg.id, msg.index),
    "Keyring.setAccountName": (msg) => keyringService.setAccountName(msg.id, msg.index, msg.name),
    "Keyring.getPrivateKey": (msg) => keyringService.getPrivateKey(msg.password, msg.id, msg.index),
    "Keyring.removeAccount": (msg) => keyringService.removeAccount(msg.id, msg.index),
    "Keyring.getAccountBook": () => keyringService.getAccountBook(),
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

    // Contact handlers
    "Contact.add": (msg) => contactService.add(msg.address),
    "Contact.get": () => contactService.get(),
    "Contact.changeName": (msg) => contactService.changeName(msg.address, msg.name),
    "Contact.remove": (msg) => contactService.remove(msg.address),

    "Notification.resolveApproval": (msg) => notificationService.resolveApproval(msg.data, msg.forceReject),
    "Notification.rejectApproval": (msg) => notificationService.rejectApproval(msg.err, msg.stay, msg.isInternal),
    "Notification.getApproval": () => notificationService.getApproval(),
    
    "Permission.addConnectedSite": (msg) => permissionService.addConnectedSite(msg.origin, msg.name, msg.icon),

    "Account.getBalance": () => accountService.getBalance(),
    "Account.addListener": () => accountService.addListener(),
    "Account.getConnectState": () => accountService.getConnectState(),
    "Account.accounts": () => accountService.accounts(),
    "Account.accountsBalance": (msg) => accountService.accountsBalance(msg.addresses),
    "Account.setActiveAccount": (msg) => accountService.setActiveAccount(msg.id),
    "Account.addAccountFromPrivateKey": (msg) => accountService.addAccountFromPrivateKey(msg.privateKey),
    "Account.addAccountFromMnemonic": (msg) => accountService.addAccountFromMnemonic(msg.mnemonic, msg.passphrase),

    "Common.addressFromPrivateKey": (msg) => commonService.addressFromPrivateKey(msg.privateKey),
    "Common.checkMnemonic": (msg) => commonService.checkMnemonic(msg.mnemonic),
    "Common.addressFromMnemonic": (msg) => commonService.addressFromMnemonic(msg.mnemonic, msg.passphrase),
};

const handleError = (error: unknown, sendResponse: (response: any) => void) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`[bg] onMessage error:, ${errorMessage}`, error);
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
            sendResponse(convertBigIntToString(result))
        }).catch((error: { toString: () => any; }) => {
            handleError(error, sendResponse);
        });
    } catch (error) {
        handleError(error, sendResponse);
    }
    return true;
});

function convertBigIntToString(obj: any): any {
    if (typeof obj === 'bigint') {
        return obj.toString();
    } else if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString);
    } else if (obj && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = convertBigIntToString(obj[key]);
        }
        return newObj;
    }
    return obj;
}

export default addServiceListener;
