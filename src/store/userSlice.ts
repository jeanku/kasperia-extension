import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { Preference } from "@/chrome/preference";

const userSlice = createSlice({
    name: "user",
    initialState: {
        homeSelectTab: "",
    },
    reducers: {
        setHomeSelectTabValue: (state, action: PayloadAction<string>) => {
            if (state.homeSelectTab != action.payload) {
                Preference.setIndex(action.payload)
            }
            state.homeSelectTab = action.payload;
        },
    },
});

export const {
    setHomeSelectTabValue,
} = userSlice.actions;

export default userSlice.reducer;
