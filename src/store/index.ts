import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
// import rpcReducer from "./rpcSlice";
import preferenceReducer from "./preferenceSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        // rpc: rpcReducer,
        preference: preferenceReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;