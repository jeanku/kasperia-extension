import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
    accountName: '',
    isLogin: false,

}
const userInfo = createSlice({
    name: 'userInfo',
    initialState,
    reducers: {
        setAccountName(state, action: PayloadAction<string>) {
            state.accountName = action.payload;
        },
        setIsLogin(state, action: PayloadAction<boolean>) {
            state.isLogin = action.payload;
        },
    },
});

export const { setAccountName, setIsLogin } = userInfo.actions;
export default userInfo.reducer;