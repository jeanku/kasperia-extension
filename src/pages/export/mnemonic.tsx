import { Input } from 'antd-mobile'
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react"
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import { useClipboard } from '@/components/useClipboard'
import { Wallet } from '@/model/wallet'
import { Keyring } from "@/chrome/keyring";

const Mnemonic = () => {
    const { state } = useLocation();
    const { handleCopy } = useClipboard();
    const { noticeError } = useNotice()

    const [id] = useState<string>(state?.id);
    const [password] = useState<string>(state?.password);

    const [accountValue, setAccountValue] = React.useState<Wallet>();

    useEffect(() => {
        try {
            if (!id) return
            Keyring.getWalletById(password, id).then((resp: Wallet) => {
                setAccountValue(resp)
            })
        } catch (error) {
            let content = error instanceof Error ? error.message : 'system error.';
            noticeError(content);
        }
    }, []);

    return (
        <div className="page-box">
            <HeadNav title="Seed Phrase"></HeadNav>
            <article className="page-mnemonic page-from-seed">
                <div>
                    <p className="page-sub-txt">This phrase is the ONLY way to recover your wallet.</p>
                    <p className="page-sub-txt">Do not share it with anyone!</p>
                    <div className="page-btn page-btn-grey">
                        <div className="btn-icon" onClick={() => handleCopy(accountValue?.mnemonic || "")}>
                            Copy <SvgIcon iconName="IconCopy" offsetStyle={{marginLeft: '5px', position: 'relative', top: '2px'}}/>
                        </div>
                    </div>
                    <div className="page-grid mb20">
                        {accountValue && accountValue.mnemonic.split(" ").map((item, index) => (
                            <div className="grid-item" key={index}>
                                <div className="grid-item-div">
                                    <em>{index + 1}.</em>
                                    <Input value={item}/>
                                    {/* <span></span> */}
                                </div>
                            </div>
                        ))}
                    </div>
                    {
                        accountValue && accountValue.passphrase ?
                            <div className="content-text no-border mb12" onClick={() => handleCopy(accountValue.passphrase || "")}>
                                <span>Passphrase: </span>
                                <div style={{ flex: 2 }}>
                                    <em className="cursor-pointer one-line text-right max120">{accountValue.passphrase}</em>
                                    <SvgIcon iconName="IconCopy" offsetStyle={{marginLeft: '5px'}}/>
                                </div>
                            </div> : null
                    }
                    <div className="content-text no-border mb12">
                        <span>Derivation Path: </span>
                        <em className="cursor-pointer">m/44'/111111'/0'/0</em>
                    </div>
                </div>
            </article>
        </div>
    )
}

export {Mnemonic}