import React, { useState } from "react"
import HeadNav from '@/components/HeadNav'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { useNavigate, useLocation } from "react-router-dom";
import { Keyring } from '@/chrome/keyring'
import { Button, Input } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon/index'
import { Mnemonic } from "./mnemonic"
import { PrivateKey } from "./privateKey"

const Index = () => {
    const { state } = useLocation();
    const { noticeError } = useNotice()
    const navigate = useNavigate()

    const [password, setPassword] = React.useState('')
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [id] = useState<string>(state?.id);
    const [index] = useState<number>(state?.index || 0);
    const [type] = useState<string>(state?.type);

    const [title] = useState(type === "mnemonic" ? "Seed Phrase" : "Privaye Key");

    const toResult = async () => {
        try {
            await Keyring.checkPassword(password)
            navigate(`/export/${type}`, {state: {id, password, index}})
        } catch (error) {
            let content = error instanceof Error ? error.message : 'password error.';
            noticeError(content);
        }
    }

    return(
        <article className="page-box">
            <HeadNav title={type === "mnemonic" ? "Seed Phrase" : "Export Privaye Key"}></HeadNav>
            <div className="page-content page-private">
                <p>1. {title} alone gives you full access to your account and funds.</p>
                <p>2. Never share it with anyone. </p>
                <p>3. {title} is only stored in your browser.</p>
                <p>4. Kasperia will never ask for your {title.toLowerCase()}.</p>
                <h6>Please read the tips above carefully</h6>
                <div className="password">
                        <Input
                            className="input"
                            placeholder=""
                            value={password}
                            type={passwordVisible ? 'text' : 'password'}
                            onChange={(e) => setPassword(e)}
                        />
                        <div className="eye" onClick={() => setPasswordVisible(!passwordVisible)}>
                            {passwordVisible ? <SvgIcon iconName="IconEyeOpen" /> : <SvgIcon iconName="IconEyeClose" />}
                        </div>
                </div>
                <Button block  color="primary" size="large" disabled={ password.length === 0} onClick={() => toResult()}>
                Show {title.toLowerCase()}
                </Button>
            </div>

        </article>
    )
}

export { Index, Mnemonic, PrivateKey }