import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { dispatchRefreshNetwork } from '@/dispatch/preference'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
// import { dispatchRpcConnect } from '@/dispatch/rpcclient'
import LoadingMask from '@/components/LoadingMask'
import { useSelector } from "react-redux";
import { RootState } from '@/store';
import { setNetworkConfig as setNetworkConfigSlice } from "@/store/preferenceSlice";
import { useNavigate } from "react-router-dom";
import { Network } from "@/model/account"
import { Preference } from '@/chrome/preference'
import { Button, Input } from "antd-mobile";
import { useLocation } from 'react-router-dom'
// import { setRpcClient } from "@/store/rpcSlice";
import store from '@/store';
import { Dispatch } from 'redux';

const NetworkUpdate = () => {
    const { state } = useLocation()
    const dispatch: Dispatch = store.dispatch;
    const navigate = useNavigate();
    const { noticeError } = useNotice();
    const [network, setNetworkConfig] = useState<Network>(state?.network || {})
    const [networkUrl, setNetworkUrl] = useState(network?.url || '')

    const [maskVisible, setMaskVisible] = useState<boolean>(false)
    const { preference} = useSelector((state: RootState) => state.preference);

    const isValidUrl = (url: string): boolean => {
        const urlPattern = /^(https?|wss?):\/\/(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[::1\])(:\d+)?(\/.*)?$/i;
        return urlPattern.test(url);
    };    
    const changeNetworkUrl = async (url: string) => {
        try {
            if (network.url === url) return
            if(!isValidUrl(url)) return noticeError(`Please enter a valid URL`)
            network.url = url
            let networkConfig = await Preference.setNetworkConfig(network);
            if (state.isChecked) {
                const dispatch: Dispatch = store.dispatch;
                // dispatch(setRpcClient(null));

                setMaskVisible(true)
                dispatch(setNetworkConfigSlice(networkConfig))
                // dispatchRefreshNetwork(network, preference?.currentAccount!);
                // await dispatchRpcConnect(network)
            } else {
                dispatch(setNetworkConfigSlice(networkConfig))
            }
            navigate(-1)
        } catch (error) {
            noticeError(`Opration failed`)
        } finally{
            setMaskVisible(false)
        }
    }
    return (
        <article className="page-box">
            <HeadNav title={network.networkType}></HeadNav>
            <div className="content-main list-box">
                <div className="password">
                    <Input
                        className="input"
                        placeholder={network?.url || 'Automatic'}
                        value={networkUrl}
                        type='text'
                        onChange={val => setNetworkUrl(val)}
                    />
                </div>
                <div className="btn-pos-two">
                    <Button block size="large" color="primary" onClick={() => changeNetworkUrl(networkUrl)}>
                        Change
                    </Button>
                    <Button block size="large" onClick={() => changeNetworkUrl("")}>
                        Reset
                    </Button>
                </div>
            </div>
            <LoadingMask 
                visible={maskVisible} 
                message="Network switching in progress" 
            />
        </article>
    )
}
export default NetworkUpdate