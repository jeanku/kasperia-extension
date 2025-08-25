import { decrypt, encrypt } from '@metamask/browser-passworder';
import { KeyRingAccess, KeyRingAccount, KeyRingState} from '@/model/account';
import { SubAccountAdd, AccountDisplay } from '@/model/wallet';
import { Storage } from '@/utils/storage';
import { LockTime, AccountType } from '@/types/enum';
import { hashString } from '@/utils/util';
import { Preference } from '@/background/service/preference';
import { ObservableStore } from '@metamask/obs-store';
import { Wasm, Kiwi, Wallet as KiwiWallet } from '@kasplex/kiwi-web'

export class KeyRing {

    private locked: boolean = true;
    private expire: number = 0;

    private store: ObservableStore<KeyRingAccount> = new ObservableStore({
        password: "",
        account: [],
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
                let locktime = await Preference.getLockTime()
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

                let account = await decrypt(password, encryptedData!.vault);
                if (account === null) {
                    throw new Error("password invalid")
                }
                this.locked = false
                this.expire = new Date().getTime() + locktime
                this.store.updateState({password: password, account: account as []})
            }
        } catch (error) {
            throw error
        }
    }

    async getWalletById(password: string, id: string) {
        if (this.store.getState().password !== password) {
            throw Error("password invalid")
        }
        return this.store.getState().account.find(account => account.id === id);
    }

    async getActiveWalletKeys() {
        let account = this.store.getState().account.find(account => account.active == true)!
        if (!account) {
            throw Error("Account not find")
        }
        return { priKey: account.priKey, pubKey: account.pubKey };
    }

    async getActiveAccountWithSubAccounts() {
        let wallet = this.store.getState().account.find(account => account.active == true);
        if (!wallet) {
            throw Error("Account not find")
        }
        if (wallet.type == AccountType.PrivateKey) {
            return {
                id: wallet.id,
                type: wallet.type,
                name: wallet.name,
                path: 0,
                drive: [{
                    name: wallet.accountName,
                    index: 0,
                    address: new Wasm.PublicKey(wallet.pubKey).toAddress(Kiwi.network).toString()
                }]
            }
        } else {
            return {
                id: wallet.id,
                type: wallet.type,
                path: wallet.path!,
                name: wallet.name,
                drive: wallet.drive?.map((item) => ({
                    name: item.name,
                    index: item.index,
                    address: new Wasm.PublicKey(item.pubKey).toAddress(Kiwi.network).toString()
                }))
            }
        }
    }

    async getActiveAccount(): Promise<AccountDisplay> {
        let account = this.store.getState().account.find(account => account.active == true)!
        return {
            id: account.id,
            name: account.name,
            pubKey: account.pubKey,
            active: account.active,
            type: account.type,
            accountName: account.accountName,
            address: new Wasm.PublicKey(account.pubKey).toAddress(Kiwi.network).toString(),
            balance: "0",
        }
    }

    async getActiveAccountAddressAndNetwork() {
        let account = this.store.getState().account.find(account => account.active == true)!
        let network = await Preference.getNetwork()
        let address = new Wasm.PublicKey(account.pubKey).toAddress(Kiwi.network).toString()
        return { network, address }
    }

    async getWalletList() {
        return this.store.getState().account.map(({id, name, pubKey, active, mnemonic, type, accountName}) => ({
            id,
            name,
            pubKey,
            active,
            type,
            address: "",
            balance: "0",
            accountName
        }));
    }

    // add a new account by mnemonic
    async addAccountFromMnemonic(mnemonic: string, passphrase: string) {
        let id = await hashString(mnemonic + passphrase + "2ee3957e6f11e9acc86e83")
        let accounts = this.store.getState().account
        let exist = accounts.find(r => {
            return r.id === id
        })
        if (exist) {
            throw Error("wallet exist")
        }
        if (accounts.length > 100) {
            throw Error("Create wallet limited")
        }
        this.store.getState().account.map(r => r.active = false)
        let index = (accounts.length > 0 ? accounts[accounts.length - 1].index : 0) + 1
        let wallet = KiwiWallet.fromMnemonic(mnemonic, passphrase)
        let pubKey = wallet.toPublicKey().toString()
        let priKey = wallet.toPrivateKey().toString()
        this.store.getState().account.push({
            id: id,
            name: "HD" + ' Wallet #' + index,
            index: index,
            active: true,
            pubKey: pubKey,
            priKey: priKey,
            mnemonic: mnemonic,
            passphrase: passphrase,
            type: AccountType.PrivateKey,
            accountName: "Account 1",
            path: 0,
            drive: [{
                name: "Account 1",
                index: 0,
                pubKey: pubKey,
                priKey: priKey
            }]
        })
        this.persistToStorage()
        return this.getActiveAccount()
    }

    // add a new account by private key
    async addAccountFromPrivateKey(privateKey: string) {
        let id = await hashString(privateKey + "2ee3957e6f11e9acc86e83")
        let accounts = this.store.getState().account
        let exist = accounts.find(r => {
            return r.id === id
        })
        if (exist) {
            throw Error("wallet exist")
        }
        if (accounts.length > 100) {
            throw Error("Create wallet limited")
        }
        this.store.getState().account.map(r => r.active = false)
        let index = (accounts.length > 0 ? accounts[accounts.length - 1].index : 0) + 1
        let pk = new Wasm.PrivateKey(privateKey)
        this.store.getState().account.push({
            id: id,
            name: "Single" + ' Wallet #' + index,
            index: index,
            active: true,
            pubKey: pk.toPublicKey().toString(),
            priKey: privateKey,
            mnemonic: "",
            type: AccountType.PrivateKey,
            accountName: "Account 1",
        })
        this.persistToStorage()
        return this.getActiveAccount()
    }

    async removeWallet(id: string) {
        let accounts = this.store.getState().account
        if (accounts.length <= 1) {
            throw Error("account can't be deleted")
        }
        const index = this.store.getState().account.findIndex(r => {
            return r.id === id
        });

        if (index === -1) return
        let _accounts = this.store.getState().account.splice(index, 1)

        if (_accounts[0].active) {
            this.store.getState().account[0].active = true
        }
        return this.persistToStorage()
    }

    async setActiveWallet(id: string) {
        this.store.getState().account.map(account => {
            account.active = account.id === id;
            return account
        });
        return this.persistToStorage()
    }

    async setWalletName(id: string, name: string) {
        this.store.getState().account.map(account => {
            if (account.id === id) {
                account.name = name
            }
            return account
        });
        return this.persistToStorage()
    }

    async checkPassword(password: string) {
        if (this.store.getState().password !== password) {
            throw Error("password invalid")
        }
    }

    async persistToStorage(): Promise<void> {
        let password = this.store.getState().password
        if(!password) {
            throw Error("account locked")
        }
        const passwordEncrypt = await encrypt(password!, password!);
        const accountEncrypt = await encrypt(password!, this.store.getState().account);
        await Storage.setData('keyringState', {
            booted: passwordEncrypt,
            vault: accountEncrypt,
        });
    }

    async setNewPassword(password: string): Promise<void> {
        this.store.updateState({ password: password })
        await this.persistToStorage()
    }

    async clear(): Promise<void> {
        this.store.updateState({password: "", account: []})
        Preference.store = undefined
        await Storage.clearData();
    }

    async addDriveAccount(id: string, account: SubAccountAdd) {
        let accounts = this.store.getState().account
        let _account = accounts.find(r => {
            return r.id === id
        })
        if (!_account) {
            throw Error("Wallet not find")
        }
        if (_account.type == AccountType.PrivateKey) {
            throw Error("Account type invalid")
        }

        if (!_account.drive || _account.drive.length == 0) {
            _account.drive = []
        }
        let index = _account.drive![_account.drive!.length - 1].index + 1
        let wallet = KiwiWallet.fromMnemonic(_account.mnemonic, _account.passphrase).newWallet(index)
        const item = {
            name: account.name,
            index: index,
            pubKey: wallet.toPublicKey().toString(),
            priKey: wallet.toPrivateKey().toString(),
        }
        _account.drive.push(item)
        _account.path = item.index
        _account.pubKey = item.pubKey
        _account.priKey = item.priKey
        _account.accountName = account.name
        this.persistToStorage()
        return this.getActiveAccount()
    }

    async switchDriveAccount(id: string, index: number) {
        let accounts = this.store.getState().account
        let wallet = accounts.find(r => {
            return r.id === id
        })
        if (!wallet) {
            throw Error("Wallet not find")
        }
        let account = wallet.drive!.find(r => {
            return r.index == index
        })
        if (!account) {
            throw Error("Account index not find")
        }
        wallet.path = index
        wallet.pubKey = account.pubKey
        wallet.priKey = account.priKey
        wallet.accountName = account.name
        await this.persistToStorage()
    }

    async setAccountName(id: string, index: number, name: string) {
        let accounts = this.store.getState().account
        let account = accounts.find(r => {
            return r.id === id
        })
        if (!account) {
            throw Error("Account not find")
        }
        account.accountName = name
        if (account.type == AccountType.Mnemonic) {
            account.drive?.map(r => {
                if (r.index == index) {
                    r.name = name
                }
            })
        }
        this.persistToStorage()
        return this.getActiveAccount()
    }

    async getPrivateKey(password: string, id: string, index: number) {
        if (this.store.getState().password !== password) {
            throw Error("password invalid")
        }
        let account = this.store.getState().account.find(account => account.id === id)
        if (!account) {
            throw Error("account not find")
        }
        if (account.type == AccountType.Mnemonic) {
            let acc= account.drive?.find(r => {
                return r.index == index
            })
            return acc?.priKey
        } else {
            return account.priKey
        }
    }

    async removeAccount(id: string, index: number) {
        let wallet = this.store.getState().account.find(account => account.id === id)
        if (!wallet) {
            throw Error("account not find")
        }
        if (wallet.type == AccountType.Mnemonic) {
            const _index = wallet.drive?.findIndex(r => {
                return r.index === index
            });
            if (_index === -1 || wallet.drive?.length == 1) return
            wallet.drive?.splice(_index!, 1)
            if (wallet.path == index) {
                let account = wallet.drive![0]
                wallet.path = account.index
                wallet.pubKey = account.pubKey
                wallet.priKey = account.priKey
                wallet.accountName = account.name
            }
        }
        await this.persistToStorage()
    }

    async getAccountBook() {
        return this.store.getState().account.map(({ id, name, pubKey, active, mnemonic, type, accountName, drive }) => ({
            name,
            drive: type == AccountType.Mnemonic ? drive?.map((item) => ({
                name: item.name,
                pubKey: item.pubKey
            })) : [
                {
                    name: accountName,
                    pubKey
                }
            ]
        }));
    }

    async resetExpire(ttl: number) {
        this.expire = new Date().getTime() + ttl
    }
    
    async getActiveAccountPublicKey() {
        return this.store.getState().account.find(account => account.active == true)!
    }
}

export default new KeyRing();


