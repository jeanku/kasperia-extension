import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
    balance: number;
    address: string;
    network: string;
}

const initialState: WalletState = {
    balance: 0,
    address: '',
    network: 'mainnet',
};

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        setBalance(state, action: PayloadAction<number>) {
            state.balance = action.payload;
        },
        setAddress(state, action: PayloadAction<string>) {
            state.address = action.payload;
        },
        setNetwork(state, action: PayloadAction<string>) {
            state.network = action.payload;
        },
    },
});

export const { setBalance, setAddress, setNetwork } = walletSlice.actions;
export default walletSlice.reducer;