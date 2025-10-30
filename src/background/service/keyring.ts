import {decrypt, encrypt} from '@metamask/browser-passworder';
import {
    AccountsSubListDisplay,
    AccountSubListDisplay,
    KeyRingAccess,
    KeyRingAccount,
    KeyRingState
} from '@/model/account';
import {Account, AccountDisplay} from '@/model/wallet';
import {Storage} from '@/utils/storage';
import {Wallet} from '@/utils/wallet/wallet';
import {AccountType, AddressType, ChainPath, LockTime} from '@/types/enum';
import {hashString} from '@/utils/util';
import {ObservableStore} from '@metamask/obs-store';
import {preferenceService, sessionService} from './index';
import {NetworkType} from "@/utils/wallet/consensus";
import {Keypair} from "@/utils/wallet/tx/keypair";


export class KeyRing {

    private locked: boolean = true;
    private expire: number = 0;

    private store: ObservableStore<KeyRingAccount> = new ObservableStore({
        password: "",
        id: "",
        account: new Map(),
    });

    async state(): Promise<KeyRingAccess> {
        let isBoot = await this.isBoot()
        if (!isBoot) {
            return {isBooted: isBoot, isLocked: true}
        }
        return {isBooted: isBoot, isLocked: await this.isLocked()}
    }

    async isBoot() {
        return await Storage.getData<KeyRingState>('keyringState') !== null;
    };

    async boot(password: string) {
        this.locked = false
        this.expire = new Date().getTime() + LockTime.ONE_HOUR
        this.store.updateState({password: password})
    }

    async isLocked(): Promise<boolean> {
        return this.locked || this.expire < new Date().getTime() || this.store.getState().password === "";
    }

    async lock() {
        this.locked = true
        this.expire = 0
    }

    async unlock(password: string) {
        try {
            if (await this.isLocked()) {
                let locktime = await preferenceService.getLockTime()
                if (this.store.getState().password !== "" && this.store.getState().password === password) {
                    this.locked = false
                    this.expire = new Date().getTime() + locktime
                    return
                }

                let encryptedData: KeyRingState | null = await Storage.getData<KeyRingState>('keyringState');
                if (encryptedData === null) {
                    throw Error("account not booted")
                }

                const _passwd = await decrypt(password, encryptedData!.booted);
                if (_passwd !== password) {
                    throw new Error("password invalid")
                }

                let decryptedVault = await decrypt(password, encryptedData.vault);
                if (decryptedVault === null) {
                    throw new Error("password invalid");
                }

                let decryted = decryptedVault as { id: string, account: any }
                const accountMap = new Map<string, Account>(
                    Object.entries(decryted.account as Record<string, Account>)
                );

                this.locked = false
                this.expire = new Date().getTime() + locktime
                this.store.updateState({password: password, account: accountMap, id: decryted.id})
            }
        } catch (error) {
            throw error
        }
    }

    // async getWalletById(password: string, id: string) {
    //     if (this.store.getState().password !== password) {
    //         throw Error("password invalid")
    //     }
    //     return this.store.getState().account.get(id);
    // }

    // getActiveWalletPrivateKey return privateKey
    async getActiveWalletPrivateKey() {
        let account = this.currentAccount()
        if (!account) {
            throw Error("Account not find")
        }
        return {priKey: account.priKey};
    }

    // getActiveWalletPrivateKey return privateKey
    async getActiveWalletPrivateKeyForEvm() {
        let account = this.currentAccount()
        if (!account) {
            throw Error("Account not find")
        }
        if (account.type == AccountType.PrivateKey) {
            return {priKey: account.priKey};
        }
        let wallet = Wallet.fromMnemonic(account.mnemonic, `${ChainPath.KaspaL2Path}${account.path}`, account.passphrase)
        return {priKey: wallet.getPrivateKey()}
    }

    async getActiveAddressForEvm() {
        let account = this.currentAccount()
        if (!account) {
            throw Error("Account not find")
        }
        let address = account.type == AccountType.Mnemonic ?
            Wallet.fromMnemonic(account.mnemonic, `${ChainPath.KaspaL2Path}${account.path}`, account.passphrase).toEthAddress() :
            Wallet.fromPrivateKey(account.priKey).toEthAddress()
        return {address}
    }


    // getActiveWalletPrivateKeyForKaspa return privateKey of kaspa
    async getActiveWalletPrivateKeyForKaspa() {
        let account = this.currentAccount()
        if (!account) {
            throw Error("Account not find")
        }
        return {priKey: account.priKey};
    }

    // getActiveAccountDisplay return baseic account info
    async getActiveAccountDisplay(networkType: NetworkType | undefined = undefined): Promise<AccountDisplay> {
        let account = this.currentAccount()
        let newNetworkType = networkType || await preferenceService.getNetworkType()
        let wallet = Wallet.fromPrivateKey(account.priKey)
        let ethAddress = account.type == AccountType.Mnemonic ?
            Wallet.fromMnemonic(account.mnemonic, `${ChainPath.KaspaL2Path}${account.path}`, account.passphrase).toEthAddress() :
            wallet.toEthAddress()
        return {
            id: account.id,
            name: account.name,
            type: account.type,
            active: true,
            subName: account.subName,
            address: wallet.toKaspaAddress(newNetworkType).toString(),
            ethAddress: ethAddress,
            balance: "0",
        }
    }

    // getActiveAccountAndSyncPreference return baseic account info
    async getActiveAccountAndSyncPreference() {
        let accountDisplay = await this.getActiveAccountDisplay()
        preferenceService.setCurrentAccount(accountDisplay)
        return accountDisplay
    }

    async getAccountList(): Promise<AccountDisplay[]> {
        var resp = []
        let networkType = await preferenceService.getNetworkType()
        for (const [id, account] of this.store.getState().account) {
            let wallet = Wallet.fromPrivateKey(account.priKey)
            let ethAddress = account.type == AccountType.Mnemonic ?
                Wallet.fromMnemonic(account.mnemonic, `${ChainPath.KaspaL2Path}${account.path}`, account.passphrase).toEthAddress() :
                wallet.toEthAddress()
            resp.push({
                id: account.id,
                name: account.name,
                subName: account.subName,
                active: account.id === this.store.getState().id,
                type: account.type,
                address: wallet.toKaspaAddress(networkType).toString(),
                ethAddress: ethAddress,
                balance: ""
            })
        }
        return resp
    }

    // addAccountFromMnemonic add a new account by mnemonic
    async addAccountFromMnemonic(mnemonic: string, passphrase: string) {
        let id = await hashString(mnemonic + passphrase + "2ee3957e6f11e9acc86e83")
        let index = this.checkAccountAndGetLastIndex(id)
        let path = 0
        let wallet = Wallet.fromMnemonic(mnemonic, ChainPath.KaspaPath + path, passphrase)
        let priKey = wallet.getPrivateKey()
        let account = {
            id: id,
            name: 'HD Wallet #' + index,
            subName: "Account 1",
            path: path,
            index: index,
            priKey: priKey,
            mnemonic: mnemonic,
            passphrase: passphrase,
            type: AccountType.Mnemonic,
            drive: [{
                name: "Account 1",
                path: path,
                priKey: priKey
            }]
        }
        this.store.getState().account.set(id, account)
        this.store.getState().id = id
        this.persistToStorage()
        let resp = await this.getActiveAccountDisplay()
        sessionService.broadcastEvent('accountsChanged', [resp.ethAddress])
        return resp
    }

    // add a new account by private key
    async addAccountFromPrivateKey(privateKey: string) {
        if (privateKey.startsWith("0x")) {
            privateKey = privateKey.slice(2)
        }
        let id = await hashString(privateKey + "2ee3957e6f11e9acc86e83")
        let index = this.checkAccountAndGetLastIndex(id)
        let account = {
            id: id,
            name: 'Single Wallet #' + index,
            subName: "Account 1",
            path: 0,
            index: index,
            priKey: privateKey,
            mnemonic: "",
            passphrase: "",
            type: AccountType.PrivateKey,
            drive: [{
                name: "Account 1",
                path: 0,
                priKey: privateKey
            }]
        }
        this.store.getState().account.set(id, account)
        this.store.getState().id = id
        this.persistToStorage()
        let resp = await this.getActiveAccountDisplay()
        sessionService.broadcastEvent('accountsChanged', [resp.ethAddress])
        return resp
    }

    async removeAccount(id: string) {
        let accounts = this.store.getState().account
        if (accounts.size <= 1) {
            throw Error("account can't be deleted")
        }
        accounts.delete(id)
        let isSelf = id === this.store.getState().id
        if (isSelf) {
            const keys = Array.from(accounts.keys());
            this.store.getState().id = accounts.get(keys[0])!.id
        } else {
            this.store.getState().id = id
        }
        this.persistToStorage()
        let resp = await this.getActiveAccountDisplay()
        if (isSelf) {
            sessionService.broadcastEvent('accountsChanged', [resp.ethAddress])
        }
        return resp
    }

    async setActiveWallet(id: string) {
        if (this.store.getState().id == id) return
        this.store.getState().id = id
        let account = this.store.getState().account.get(id)
        if (account) {
            let ethAddress = account.type == AccountType.Mnemonic ?
                Wallet.fromMnemonic(account.mnemonic, `${ChainPath.KaspaL2Path}${account.path}`, account.passphrase).toEthAddress() :
                Wallet.fromPrivateKey(account.priKey).toEthAddress()
            sessionService.broadcastEvent('accountsChanged', [ethAddress])
        }
        return this.persistToStorage()
    }

    async setAccountName(id: string, name: string) {
        let account = this.store.getState().account.get(id)
        if (account) {
            account.name = name
        }
        return this.persistToStorage()
    }

    async checkPassword(password: string) {
        if (this.store.getState().password !== password) {
            throw Error("password invalid")
        }
    }

    async persistToStorage(): Promise<void> {
        let password = this.store.getState().password
        if (!password) {
            throw Error("account locked")
        }
        const passwordEncrypt = await encrypt(password!, password!);
        const accountObj = Object.fromEntries(this.store.getState().account);
        const accountEncrypt = await encrypt(password, {
            id: this.store.getState().id,
            account: accountObj,
        });

        await Storage.setData('keyringState', {
            booted: passwordEncrypt,
            vault: accountEncrypt,
        });
    }

    async setNewPassword(password: string): Promise<void> {
        this.store.updateState({password: password})
        await this.persistToStorage()
    }

    async clear(): Promise<void> {
        this.store.updateState({password: "", account: new Map()})
        preferenceService.store = undefined
        await Storage.clearData();
    }

    async addSubAccount(id: string, name: string) {
        let account = this.store.getState().account.get(id)
        if (!account) {
            throw Error("Wallet not find")
        }
        if (account.type != AccountType.Mnemonic) {
            throw Error("Wallet type invalid")
        }
        let last = account.drive[account.drive.length - 1]
        let path = last.path + 1
        let prikey = Wallet.fromMnemonic(account.mnemonic, ChainPath.KaspaPath + path, account.passphrase).getPrivateKey()
        account.drive.push({
            name: name,
            priKey: prikey,
            path: path,
        })
        account.path = path
        account.priKey = prikey
        account.subName = name
        this.persistToStorage()
        let resp = await this.getActiveAccountDisplay()
        sessionService.broadcastEvent('accountsChanged', [resp.ethAddress])
        return resp
    }

    // switch account with drive index
    async switchSubAccount(id: string, path: number) {
        let account = this.store.getState().account.get(id)
        if (!account) {
            throw Error("Wallet not find")
        }
        let subAccount = account.drive.find(r => {
            return r.path == path
        })
        if (!subAccount) {
            throw Error("Account path not find")
        }
        account.path = subAccount.path
        account.priKey = subAccount.priKey
        account.subName = subAccount.name
        preferenceService.resetCurrentAccount()

        await this.persistToStorage()
        let resp = await this.getActiveAccountDisplay()
        sessionService.broadcastEvent('accountsChanged', [resp.ethAddress]);
        return resp
    }

    async setSubAccountName(id: string, path: number, name: string) {
        let account = this.store.getState().account.get(id)
        if (!account) {
            throw Error("Wallet not find")
        }
        if (account.type == AccountType.PrivateKey) {
            account.subName = name
            account.drive[0].name = name
            return
        }
        account.drive.map(r => {
            if (r.path == path) {
                r.name = name
            }
        })
        if (account.path == path) {
            account.subName = name
        }
        await this.persistToStorage()
    }

    async getPrivateKey(password: string, id: string, path: number) {
        if (this.store.getState().password !== password) {
            throw Error("password invalid")
        }
        let account = this.store.getState().account.get(id)
        if (!account) {
            throw Error("account not find")
        }
        if (account.type == AccountType.Mnemonic) {
            let subAccount = account.drive.find(r => {
                return r.path == path
            })
            if (!subAccount) {
                throw Error("sub account not find")
            }
            let evmKey = Wallet.fromMnemonic(account.mnemonic, `${ChainPath.KaspaL2Path}${subAccount.path}`, account.passphrase)
            return [subAccount.priKey, evmKey.getPrivateKey()]
        } else {
            return [account.priKey, account.priKey]
        }
    }

    async getMnemonic(password: string, id: string) {
        if (this.store.getState().password !== password) {
            throw Error("password invalid")
        }
        let account = this.store.getState().account.get(id)
        if (!account) {
            throw Error("account not find")
        }
        if (account.type != AccountType.Mnemonic) {
            throw Error("account not invalid")
        }
        return {
            mnemonic: account.mnemonic,
            path: account.path,
            passphrase: account.passphrase,
        }
    }

    async removeSubAccount(id: string, path: number) {
        let account = this.store.getState().account.get(id)
        if (!account) {
            throw Error("account not find")
        }
        if (account.drive.length == 1) {
            throw Error("account can not delete")
        }
        const _index = account.drive.findIndex(r => {
            return r.path === path
        });
        if (_index === -1) return
        account.drive.splice(_index, 1)
        if (account.path == path) {
            let subAccount = account.drive[0]
            account.path = subAccount.path
            account.priKey = subAccount.priKey
            account.subName = subAccount.name

            let ethAddress = account.type == AccountType.Mnemonic ?
                Wallet.fromMnemonic(account.mnemonic, `${ChainPath.KaspaL2Path}${account.path}`, account.passphrase).toEthAddress() :
                Wallet.fromPrivateKey(account.priKey).toEthAddress()
            sessionService.broadcastEvent('accountsChanged', [ethAddress])
        }
        await this.persistToStorage()
        return this.getAccountSubAccountsDisplay()
    }

    async getAccountSubAccountsDisplay(): Promise<AccountSubListDisplay> {
        let wallet = this.currentAccount()
        if (!wallet) {
            throw Error("Account not find")
        }
        let networkType = await preferenceService.getNetworkType()
        return {
            id: wallet.id,
            path: wallet.path,
            type: wallet.type,
            drive: wallet.drive?.map((item) => ({
                name: item.name,
                path: item.path,
                address: Wallet.fromPrivateKey(item.priKey).toKaspaAddress(networkType).toString(),
                active: wallet.path == item.path
            }))
        }
    }

    async getAccountsSubListDisplay(type: AddressType | undefined = undefined): Promise<AccountsSubListDisplay[]> {
        let networkType = await preferenceService.getNetworkType()
        let selected = this.currentAccount()
        var resp = []
        for (const [id, account] of this.store.getState().account) {
            resp.push({
                id: account.id,
                name: account.name,
                drive: account.drive.map((item) => ({
                    path: item.path,
                    name: item.name,
                    active: account.id == selected.id && account.path == selected.path,
                    address: type == AddressType.EvmAddress ? (
                        account.type == AccountType.Mnemonic ?
                            Wallet.fromMnemonic(account.mnemonic, `${ChainPath.KaspaL2Path}${item.path}`, account.passphrase).toEthAddress() :
                            Wallet.fromPrivateKey(account.priKey).toEthAddress()
                    ) : Keypair.fromPrivateKeyHex(item.priKey).toAddress(networkType).toString(),
                })),
            })
        }
        return resp
    }

    async resetExpire(ttl: number) {
        this.expire = new Date().getTime() + ttl
    }

    // _getActiveAddress returns selected account's address
    async _getActiveAddress() {
        let account = this.currentAccount()
        let networkId = await preferenceService.getNetworkId()
        return Wallet.fromPrivateKey(account.priKey).toKaspaAddress(networkId.networkType).toString()
    }

    async _getActiveEvmAddress() {
        let account = this.currentAccount()
        return account.type == AccountType.Mnemonic ?
            Wallet.fromMnemonic(account.mnemonic, `${ChainPath.KaspaL2Path}${account.path}`, account.passphrase).toEthAddress() :
            Wallet.fromPrivateKey(account.priKey).toEthAddress()
    }

    // getActivePublicKey returns selected account's address
    async getActivePublicKey() {
        let account = this.currentAccount()
        return Wallet.fromPrivateKey(account.priKey).getKaspaPublicKey()
    }

    currentAccount() {
        return this.store.getState().account.get(this.store.getState().id)!
    }

    checkAccountAndGetLastIndex(id: string) {
        let accounts = this.store.getState().account
        let exist = accounts.get(id)
        if (exist) {
            throw Error("wallet exist.")
        }
        if (this.store.getState().account.size > 1000) {
            throw Error("Create wallet limited")
        }
        const keys = Array.from(accounts.keys());
        var index = 1
        if (keys.length > 0) {
            index = accounts.get(keys[keys.length - 1])!.index + 1
        }
        return index
    }
}

export default new KeyRing();


