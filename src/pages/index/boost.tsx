import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { Outlet, useLocation } from "react-router-dom";
import MessageProvider from '@/components/NoticeBar/NoticeBar'
import {Keyring} from "@/chrome/keyring"
import { dispatchPreference } from '@/dispatch/preference'
import { KeyRingAccess } from '@/model/account'

const Boost = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation()


    useEffect(() => {
        const init = async () => {
            let state: KeyRingAccess = await Keyring.state()
            console.log("KeyRingAccess:", state)
            if (!state.isBooted) {
                navigate("/index", { replace: true})
                return
            }
            if (state.isLocked) {
                navigate("/unlock", { replace: true})
                return
            }
            let path = pathname.length <= 1 ? '/home' : pathname
            dispatchPreference().then(r => {
                navigate(path, { replace: true})
            })
        };
        init();
    }, []);

    return (
        <MessageProvider><Outlet /></MessageProvider>
    )
}
export { Boost }