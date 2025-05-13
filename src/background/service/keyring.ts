import { decrypt, encrypt } from '@metamask/browser-passworder';
import { KeyRingAccess, KeyRingAccount, KeyRingState} from '@/model/account';
import { Wallet, Account } from '@/model/wallet';
import { Storage } from '@/utils/storage';
import { LockTime, AccountType } from '@/types/enum';
import { hashString } from '@/utils/util';
import { Preference } from '@/background/service/preference';
import { ObservableStore } from '@metamask/obs-store';

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

    async getActiveWalletWithAccounts() {
        let wallet = this.store.getState().account.find(account => account.active == true);
        if (!wallet) {
            throw Error("Account not find")
        }
        if (wallet.type == AccountType.PrivateKey) {
            return {
                id: wallet.id,
                type: wallet.type,
                path: 0,
                drive: [{
                    name: wallet.accountName,
                    index: 0,
                    pubKey: wallet.pubKey
                }]
            }
        } else {
            return {
                id: wallet.id,
                type: wallet.type,
                path: wallet.path!,
                mnemonic: wallet.mnemonic,
                passphrase: wallet.passphrase,
                drive: wallet.drive?.map((item) => ({
                    name: item.name,
                    index: item.index,
                    pubKey: item.pubKey
                }))
            }
        }
    }

    async getActiveAccount() {
        let account = this.store.getState().account.find(account => account.active == true)!
        return {
            id: account.id,
            name: account.name,
            pubKey: account.pubKey,
            active: account.active,
            type: account.type,
            accountName: account.accountName,
            address: "",
            balance: "0",
        }
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

    async addWallet(wallet: Wallet) {
        wallet.id = await hashString((wallet.mnemonic ? wallet.mnemonic : wallet.priKey) + "2ee3957e6f11e9acc86e83")
        let accounts = this.store.getState().account
        let exist = accounts.find(r => {
            return r.id === wallet.id
        })
        if (exist) {
            throw Error("wallet exist.")
        }
        if (accounts.length > 100) {
            throw Error("Create wallet limited")
        }

        this.store.getState().account.map(r => r.active = false)

        let index = (accounts.length > 0 ? accounts[accounts.length - 1].index : 0) + 1
        wallet.index = index
        wallet.name = (wallet.mnemonic ? "HD" : "Single") + ' Wallet #' + index
        wallet.accountName = "Account 1"
        wallet.active = true
        if (wallet.mnemonic != "") {
            wallet.path = 0
            wallet.drive = [{
                name: "Account 1",
                index: 0,
                pubKey: wallet.pubKey,
                priKey: wallet.priKey
            }]
        }
        this.store.getState().account.push(wallet)
        return this.persistToStorage()
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

    async addDriveAccount(id: string, account: Account) {
        let accounts = this.store.getState().account
        let _account = accounts.find(r => {
            return r.id === id
        })
        if (!_account) {
            throw Error("Wallet not find")
        }
        if (!_account.drive || _account.drive.length == 0) {
            _account.drive = []
        }

        _account.drive.push(account)
        _account.path = account.index
        _account.pubKey = account.pubKey
        _account.priKey = account.priKey
        _account.accountName = account.name
        await this.persistToStorage()
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
        console.log("wallet", wallet)
        await this.persistToStorage()
    }

    async setAccountName(id: string, index: number, name: string) {
        let accounts = this.store.getState().account
        let account = accounts.find(r => {
            return r.id === id
        })
        if (!account) return
        if (account.type == AccountType.PrivateKey) {
            account.accountName = name
            return
        }
        account.drive?.map(r => {
            if (r.index == index) {
                r.name = name
            }
        })
        if (account.path && account.path == index) {
            account.accountName = name
        }
        await this.persistToStorage()
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
}

export default new KeyRing();


