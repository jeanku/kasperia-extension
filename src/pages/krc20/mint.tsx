import {useCallback, useEffect, useState} from "react"
import {Button, Checkbox, Slider, Space} from 'antd-mobile'
import {useLocation, useNavigate} from "react-router-dom";

import HeadNav from '@/components/HeadNav'
import {useNotice} from '@/components/NoticeBar/NoticeBar'
import NumberInput from '@/components/NumberInput';
import {useSelector} from "react-redux";
import {RootState} from '@/store';
import {formatAddress, formatBalance} from '@/utils/util';
import {Address} from '@/utils/wallet/address';
import {SvgIcon} from '@/components/Icon'
import {Account} from '@/chrome/account'
import {Krc20Client, Krc20MintScript} from "@/utils/wallet/krc20";
import {NetworkId} from "@/utils/wallet/consensus";

const Mint = () => {
    const navigate = useNavigate();

    const { state } = useLocation()
    const { noticeError } = useNotice()
    const { preference } = useSelector((state: RootState) => state.preference);

    const [tick, setTick] = useState<string>(state?.tick || '')
    const [amount, setAmount] = useState<string>('1')
    const [p2shAddress, setP2shAddress] = useState<string>('')
    const [p2shAmount, setP2shAmount] = useState<bigint>(0n)
    const [utxoCheck, setUtxoCheck] = useState(false)

    const submitDisabled = useCallback(() => {
        return !tick || isNaN(Number(amount)) || Number(amount) <= 0 || Number(amount) > 1000
    }, [tick, amount]);

    const checkTick = () => {
        const tickLen = tick.trim().length;
        if (tickLen < 4 || tickLen > 6) {
            throw Error("Ticker should be 4 to 6 letters.")
        }
    }

    const submit = async () => {
        try {
            checkTick()
            await queryToken()
        } catch (error) {
            return noticeError(error)
        }
        navigate('/krc20/mintConfirm', {state : { tick: tick.trim(), times: Number(amount.trim()), useUtxo: utxoCheck }})
    }

    const toastValue = (value: number | [number, number]) => {
        setAmount(value.toString())
    }

    const queryP2shBalance = async (address: string) => {
        let balance = await Account.getBalance(address)
        if (balance.balance) {
            setP2shAmount(BigInt(balance.balance))
        }
    }

    const queryToken = async () => {
        if (tick) {
            let client = new Krc20Client(preference.network.networkType)
            let resp = await client.getKrc20TokenInfo(tick)
            if (resp.result && resp.result[0]) {
                if (resp.result[0].state == "finished") {
                    throw Error("tick finished")
                }
                if (resp.result[0].state == "unused") {
                    throw Error("tick not find")
                }
            } else {
                throw Error("tick not find")
            }
        }
    }

    useEffect(() => {
        try {
            queryToken()
        } catch (error) {
            noticeError(error)
        }
    }, []);

    useEffect(() => {
        let length = tick.trim().length
        if ((length < 4 || length > 6)) {
            if (utxoCheck) {
                setP2shAddress("")
            }
            return
        }
        try {
            let senderAddress = Address.fromString(preference.currentAccount?.address!)
            let networkId = NetworkId.from(preference.network.networkType)
            const script = new Krc20MintScript(senderAddress, networkId, {tick});
            let p2shAddress = script.p2shAddress.toString()
            setP2shAddress(p2shAddress)
            queryP2shBalance(p2shAddress)
        } catch (error) {
            noticeError(error)
        }
    }, [tick])

    const formatFee = () : string => {
        if (utxoCheck) {
            let s=  Math.floor((Number(amount) + 0.3) * 100000000)
            let fee = BigInt(s) - (p2shAmount || 0n)
            if (fee < 0n) return "0"
            return formatBalance(fee.toString(), 8)
        } else {
            return (Number(amount) + 0.3).toString()
        }
    }

    return (
        <article className="page-box">
            <HeadNav title='KRC20 Mint'></HeadNav>
            <div className="content-main mint-box pb96">
                <div className="input-box-fix mb30">
                    <h6 className="sub-tit">Ticker</h6>
                    <div className="input-box">
                        <input type="text" placeholder="input your tick" value={tick} maxLength={10} onChange={(e) => setTick(e.target.value)} />
                    </div>
                </div>
                <div className="input-box-fix">
                    <h6 className="sub-tit">Amount:</h6>
                    <div className="input-box mb12">
                        <NumberInput
                            value={Number(amount)}
                            onChange={(e) => setAmount(e ? e.toString() : '')}
                            decimalPlaces={0}
                            max={1000}
                            allowNegative={false}
                            placeholder="amount"
                        />
                    </div>
                    <Slider
                        defaultValue={1}
                        popover={true}
                        min={1}
                        value={Number(amount)}
                        max={1000}
                        className="slider-round m15"
                        onChange={toastValue}
                        icon={<span className="slider-round-span"></span>}
                        style={{ '--fill-color': '#53CF39' }}
                    />

                </div>
                <div className="page-check mb15">
                    <Space direction='vertical' block>
                        <Checkbox className="check-span-pl0" block onChange={(val: boolean) => setUtxoCheck(val) }
                            icon={(utxoCheck) => (utxoCheck ? <SvgIcon iconName="IconCheckSelect" color="#74E6D8" /> :<SvgIcon iconName="IconCheck" />)}
                        >Retrieve Incomplete KRC20 UTXOs</Checkbox>
                    </Space>
                </div>
                {
                    utxoCheck ? <div className="content-text no-border mt15 mb20">
                        <p>{formatAddress(p2shAddress)}</p>
                        <p>{formatBalance(p2shAmount.toString(), 8)} Kas</p>
                    </div> : null
                }
                <div className="update-box">
                    <div className="mint-tip">
                        <p>Upper limit transaction fee: { formatFee() } KAS</p>
                        <p>Each mint will pay 1 KAS as required by the protocol and 0.3 KAS as a transaction fee. Any unused fee will be refunded to your account.</p>
                    </div>
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" color="primary" disabled={submitDisabled()} onClick={() => submit()}>
                        Next
                    </Button>
                </div>
            </div>
        </article>
    )
}

export { Mint }