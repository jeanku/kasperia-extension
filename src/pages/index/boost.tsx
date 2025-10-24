import React, { useEffect, useState } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Keyring } from "@/chrome/keyring"
import { dispatchPreference } from '@/dispatch/preference'
import { KeyRingAccess } from '@/model/account'
import logo from "@/assets/images/logo512.png"

const Boost = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [initDone, setInitDone] = useState(false);

    useEffect(() => {
        const init = async () => {
            let state: KeyRingAccess = await Keyring.state();

            if (!state.isBooted) {
                return navigate("/index", { replace: true });
            }
            if (state.isLocked) {
                return navigate("/unlock", { replace: true });
            }
            let path = pathname.length <= 1 ? '/home' : pathname;
            dispatchPreference();
            navigate(path, { replace: true });
        };

        init().finally(() => setInitDone(true));
    }, []);

    if (!initDone) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#171717",
            }}>
                <img src={logo} alt="Logo" style={{ width: 80, height: 80, marginBottom: 20 }} />
                <div className="spinner"></div>
                <p style={{ marginTop: 10, fontSize: 14, color: "#666" }}>Loading...</p>

                <style>
                    {`
                        .spinner {
                            border: 4px solid #f3f3f3;
                            border-top: 4px solid #3498db;
                            border-radius: 50%;
                            width: 32px;
                            height: 32px;
                            animation: spin 1s linear infinite;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        );
    }

    return (
        <Outlet />
    );
}

export { Boost }
