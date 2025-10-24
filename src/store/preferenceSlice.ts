import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PreferenceState } from '@/model/account';
import { Network } from '@/model/account';
import { AccountDisplay } from '@/model/wallet';
import { Oplist, TokenList } from '@/model/krc20';
import { KaspaTransaction } from '@/utils/wallet/kaspa';
import { EvmTokenList } from "@/model/evm";
import { Preference } from "@/chrome/preference";

const preferenceSlice = createSlice({
    name: "preference",
    initialState: {
        preference: {} as PreferenceState
    },
    reducers: {
        setPreference: (state, action: PayloadAction<PreferenceState>) => {
            state.preference = action.payload;
        },

        setCurrentAccount: (state, action: PayloadAction<AccountDisplay>) => {
            if (state.preference) {
                state.preference.krc20TokenList = undefined
                state.preference.krc20OpList = undefined
                state.preference.kaspaTxList = undefined
                state.preference.currentAccount = action.payload;
                Preference.setCurrentAccount(action.payload)
            }
        },
        setNetwork: (state, action: PayloadAction<{ network: Network; account: AccountDisplay }>) => {
            if (state.preference) {
                state.preference.network = action.payload.network;
                state.preference.currentAccount = action.payload.account;
                state.preference.currentAccount = action.payload.account;
                state.preference.krc20TokenList = undefined
                state.preference.krc20OpList = undefined
                state.preference.kaspaTxList = undefined
            }
        },

        setKrc20TokenList: (state, action: PayloadAction<TokenList[]>) => {
            if (state.preference) {
                state.preference.krc20TokenList = action.payload;
                Preference.setKrc20TokenList(action.payload)
            }
        },
        setKrc20OpList: (state, action: PayloadAction<Oplist[]>) => {
            if (state.preference) {
                state.preference.krc20OpList = action.payload;
                Preference.setKrc20OpList(action.payload)
            }
        },

        setKaspaTxList: (state, action: PayloadAction<KaspaTransaction[]>) => {
            if (state.preference) {
                state.preference.kaspaTxList = action.payload;
                Preference.setKaspaTxList(action.payload)
            }
        },

        setEvm20TokenList: (state, action: PayloadAction<{ chainId: string; listData: EvmTokenList[] }>) => {
            if (state.preference) {
                state.preference.evmTokenList[action.payload.chainId] = action.payload.listData;
                Preference.setEvm20TokenList(action.payload.chainId, action.payload.listData)
            }
        },

        setNetworkConfig: (state, action: PayloadAction<Record<number, Network>>) => {
            if (state.preference) {
                state.preference.networkConfig = action.payload;
            }
        },

        setAccountsBalance: (state, action: PayloadAction<Record<string, string>>) => {
            if (state.preference) {
                state.preference.accountsBalance = action.payload;
                Preference.setAccountsBalance(action.payload)
            }
        },

        setAccountBalance: (state, action: PayloadAction<string>) => {
            if (state.preference) {
                let address = state.preference!.currentAccount!.address
                if (!state.preference.accountsBalance) {
                    state.preference.accountsBalance = {}
                }
                state.preference.currentAccount!.balance = action.payload;
                state.preference.accountsBalance[address] = action.payload;
                Preference.updateAccountsBalance(address, action.payload);
            }
        },

        setContractAddress: (state, action: PayloadAction<Record<string, string>>) => {
            if (state.preference) {
                state.preference.contractAddress = action.payload;
                Preference.setContractAddress(action.payload)
            }
        },
    },
});

export const {
    setPreference,
    setCurrentAccount,
    setNetwork,
    setKrc20TokenList,
    setKrc20OpList,
    setKaspaTxList,
    setNetworkConfig,
    setEvm20TokenList,
    setAccountsBalance,
    setAccountBalance,
    setContractAddress
} = preferenceSlice.actions;

export default preferenceSlice.reducer;
