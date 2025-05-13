import { createSlice } from "@reduxjs/toolkit";
import { Wasm } from '@kasplex/kiwi-web'

const rpcSlice = createSlice({
    name: "rpc",
    initialState: {
        client: null as Wasm.RpcClient | null,
    },
    reducers: {
        setRpcClient: (state, action) => {
            state.client = action.payload;
        },
    },
});

export const { setRpcClient } = rpcSlice.actions;
export default rpcSlice.reducer;
