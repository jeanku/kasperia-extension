import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { ProgressBar, Button, Popup } from 'antd-mobile'
import { CheckCircleOutline } from 'antd-mobile-icons'
import { useNavigate, useLocation } from "react-router-dom";
import { SvgIcon } from '@/components/Icon'
import { formatAddress, formatHash } from '@/utils/util'
import { useSelector } from "react-redux";
import { RootState } from '@/store';
import { Account } from '@/chrome/account';
import { SendOutline } from 'antd-mobile-icons'
import { useNotice } from '@/components/NoticeBar/NoticeBar'

import "@/styles/mint.scss"
import {NetworkType} from "@/utils/wallet/consensus";
import {KaspaExplorerUrl} from "@/types/enum";

const MintResult = () => {
    const navigate = useNavigate();
    const { noticeError } = useNotice()
    const { state } = useLocation()

    const [tick] = useState<string>(state?.tick)
    const [times] = useState<Number>(state?.times)
    const [useUtxo] = useState<boolean>(state?.useUtxo)

    const { preference} = useSelector((state: RootState) => state.preference);
    const [address, setAddress] = useState<string>(preference!.currentAccount!.address || "")
    const [popupVisible, setPopupVisible] = useState(false)
    const [ submitTx, setSubmitTx ] = useState<string[]>([]);
    const [tipMsg, setTipMsg] = useState<string>('')

    const openKasplexTx = (txid: string) => {
        if(!txid) return
        const networkName = preference.network.networkType === NetworkType.Mainnet ? 'Mainnet' : 'Testnet';
        window.open(`${KaspaExplorerUrl[networkName]}${txid}`);
    }

    useEffect(() => {
        const submit = async () => {
            try {
                let txid = ""
                let balance = ""
                for (let i = 0; i < times; i++) {
                    let resp = await Account.mintKrc20(txid, balance, tick, Number(times), useUtxo)
                    txid = resp.txid
                    balance = resp.balance
                    submitTx.push(txid)
                    setSubmitTx([...submitTx])
                }
            } catch (error) {
                noticeError(error as Error | string);
            }
        }
        submit()
    }, [preference])

    return (
        <article className="page-box">
            <HeadNav title="Mint ware" ></HeadNav>
            <article className="padding-tip" onClick={() => setPopupVisible(true)}>
                <span>Pending transaction</span>
                <SvgIcon color="#74E6D8" iconName="IconArrowRightTheme" />
            </article>
            <div className="content-main mint-result">
                <p className="tit-p">*Do not switch network or close the window. Or minting will be stopped.</p>
                <div className="input-text-show mb12">
                    <span>Tick</span>
                    <em>{tick}</em>
                </div>
                <div className="mb12">
                    <ProgressBar
                        percent={Math.floor((submitTx.length / Number(times)) * 100)}
                        text
                        style={{ '--fill-color': '#53CF39' }}
                    />
                </div>
                <h6 className="sub-tit">Reveal tx: submitting...</h6>
                <div className="input-text-show mb12">
                    <span>Finished/target</span>
                    <em><strong>{submitTx.length}</strong>/{times.toString()}</em>
                </div>

                <div className="input-text-show mb12">
                    <span>Address</span>
                    <em>{formatAddress(address)}</em>
                </div>
                {
                    tipMsg ?
                        <div className="tip-error">
                            <p>{tipMsg}</p>
                        </div>
                        : null
                }
                <div className="btn-pos-two flexd-row">
                    <Button block size="large" color="primary" onClick={() => navigate(-2)}>
                        Mint Again
                    </Button>
                    <Button block size="large" onClick={() => navigate('/home')}>
                        Done
                    </Button>
                </div>
            </div>
            <Popup
                visible={popupVisible}
                bodyClassName="wallet-popup-body"
                showCloseButton
                onMaskClick={() => {
                    setPopupVisible(false)
                }}
                onClose={() => {
                    setPopupVisible(false)
                }}
                bodyStyle={{ height: '40vh', borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px', overflowY: 'scroll' }}
            >
                <div className="contact-list">
                    <p className="contact-list-tit">pending transactions</p>
                    {
                        submitTx.map(txid => (
                            <div className="contact-list-item success">
                                <div className="contact-item-top">
                                    <strong>Mint</strong>
                                    <span><CheckCircleOutline color="#53CF39" className="mr5"/>reveal submit</span>
                                </div>
                                <div className="contact-item-bottom">
                                    <span>Txid: {formatHash(txid)}
                                        <em onClick={() => openKasplexTx(txid)} className="history-href"><SendOutline/></em>
                                    </span>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </Popup>
        </article>
    )
}

export { MintResult }