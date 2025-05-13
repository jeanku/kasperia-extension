import { createSlice } from "@reduxjs/toolkit";
import { AccountDisplay } from '@/model/wallet';

const userSlice = createSlice({
    name: "user",
    initialState: {
        account: null as AccountDisplay | null,
        accountList: [] as AccountDisplay[],
    },
    reducers: {
        setAccount: (state, action) => {
            state.account = action.payload;
        },
        // setAccountList: (state, action) => {
        //     state.accountList = action.payload;
        // },
    },
});

export const { setAccount } = userSlice.actions;
export default userSlice.reducer;
