import React, { useEffect, useState } from "react"
import HeadNav from '@/components/HeadNav'
import { Keyring } from '@/chrome/keyring'
import { useLocation } from "react-router-dom";
import { SvgIcon } from '@/components/Icon/index'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { useClipboard } from '@/components/useClipboard'
import { useNavigate } from "react-router-dom";

const PrivateKey = () => {
    const { state } = useLocation();
    const { handleCopy } = useClipboard();
    const navigate = useNavigate();
    const [id] = useState<string>(state?.id);
    const [index] = useState<number>(state?.index);
    const [password] = useState<string>(state?.password);

    const { noticeError } = useNotice();

    const [privateKey, setPrivateKey] = React.useState('')

    useEffect(() => {
        try {
            if (!id) return
            Keyring.getPrivateKey(password, id, index || 0).then((resp: string) => {
                setPrivateKey(resp)
            })
        } catch (error) {
            let content = error instanceof Error ? error.message : 'system error.';
            noticeError(content);
        }
    }, []);

    return(
        <article className="page-box">
            <HeadNav title="Export Privaye Key" onBack={() => navigate(-2)}></HeadNav>
            <div className="page-content page-private">
                <p>If you ever change browsers or move computers, you will need this private key to access this account. Save it somewhere safe and secret</p>
                <h6>HEX Private key:</h6>
                <div className="address-box" onClick={() => handleCopy(privateKey)}>
                    <span>{privateKey}</span>
                    <SvgIcon iconName="IconCopy" size={28} offsetStyle={{marginLeft: '5px'}} />
                </div>
            </div>

        </article>
    )
}

export { PrivateKey }