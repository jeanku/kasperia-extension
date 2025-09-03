import React, { useState, useCallback, useEffect, useMemo } from "react"
import HeadNav from '@/components/HeadNav'
import { useNavigate, useLocation } from "react-router-dom";
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import NumberInput from '@/components/NumberInput';
import { useSelector } from "react-redux";
import { RootState } from '@/store';
import { formatAddress, formatBalance, debounce } from '@/utils/util';
import { TickState } from '@/types/enum';
import { KasplexApi, Utils, Enum, Wasm, Kiwi, Script, Rpc } from '@kasplex/kiwi-web'
import { Slider, Space, Checkbox, Button } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon'
const Mint = () => {
    const navigate = useNavigate();

    const { state } = useLocation()
    const { noticeError } = useNotice()
    const currentAccount = useSelector((state: RootState) => state.preference.preference.currentAccount);
    const rpcClient = useSelector((state: RootState) => state.rpc.client);

    const [tick, setTick] = useState<string>(state?.tick || '')
    const [amount, setAmount] = useState<string>('1')
    const [p2shAddress, setP2shAddress] = useState<string>('')
    const [p2shAmount, setP2shAmount] = useState<bigint>(0n)

    const [tickAccess, setTickAccess] = useState<Promise<TickState> | null>(null)

    const [utxoCheck, setUtxoCheck] = useState(false)

    const submitDisabled = useCallback(() => {
        return !tick || isNaN(Number(amount)) || Number(amount) <= 0 || Number(amount) > 1000
    }, [tick, amount]);

    const getTickError = useCallback(() => {
        const tickLen = tick.trim().length;
        return (tickLen < 4 || tickLen > 6)  ? 'Ticker should be 4 to 6 letters.'  : '';
    }, [tick]);
    const submit = async () => {
        if (tickAccess == null || tick != state?.tick) {
            try {
                const tickError = getTickError()
                if(tickError) {
                    noticeError(tickError)
                    return
                }
                let resp: any = await KasplexApi.getToken(tick)
                if (resp.result && resp.result[0]) {
                    if (resp.result[0].state == "finished") {
                        noticeError("tick finished")
                        return
                    }
                    if (resp.result[0].state == "unused") {
                        noticeError("tick not find")
                        return
                    }
                }
            } catch (error) {
                noticeError(error)
                return
            }
        } else {
            if (await tickAccess == TickState.NotFind) {
                noticeError("tick not find")
                return
            }
        }
        navigate('/krc20/mintConfirm', {state : { tick: tick.trim(), times: amount.trim(), useUtxo: utxoCheck && (p2shAmount == null || p2shAmount > 0n) }})
    }

    const toastValue = (value: number | [number, number]) => {
        setAmount(value.toString())
    }

    const queryP2shBalance = async () => {
        const krc20data = Utils.createKrc20Data({
            p: "krc-20",
            op: Enum.OP.Mint,
            tick: tick
        })
        let publicKey = new Wasm.PublicKey(currentAccount!.pubKey).toXOnlyPublicKey().toString()
        let script = Script.krc20Script(publicKey, krc20data)
        let p2shAddress = Wasm.addressFromScriptPublicKey(script.createPayToScriptHashScript(), Kiwi.network)
        setP2shAddress(p2shAddress!.toString())
        Rpc.getInstance().client.getBalanceByAddress({
            address: p2shAddress!.toString()
        }).then((r: { balance: bigint }) => {
            setP2shAmount(r.balance)
        })
    }

    const queryToken = async () => {
        if (tick) {
            let token = KasplexApi.getToken(tick).then((resp: any) => {
                if (resp.result && resp.result[0]) {
                    if (resp.result[0].state == "finished") {
                        return TickState.Finished
                    }
                    if (resp.result[0].state == "unused") {
                        return TickState.NotFind
                    }
                    return TickState.Deployed
                } else {
                    return TickState.NotFind
                }
            })
            setTickAccess(token)
        }
    }

    useEffect(() => {
        queryToken()
    }, [])

    useEffect(() => {
        if (rpcClient && currentAccount) {
            if (tick) {
                const timer = debounce(() => {
                    queryP2shBalance()
                }, 300)
                timer()
            }
        }
    }, [rpcClient, currentAccount, tick])

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
            <div className="content-main mint-box">
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
                    utxoCheck && p2shAddress ? <div className="content-text no-border mt15 mb20">
                        <p>{formatAddress(p2shAddress)}</p>
                        <p>{formatBalance(p2shAmount.toString(), 8)} Kas</p>
                    </div> : null
                }
                <div className="update-box">
                    <div className="mint-tip">
                        <p>Upper limit transaction fee: { formatFee() } KAS</p>
                        <p>Each mint will pay 1 KAS as required by the protocol and 0.3 KAS as a transaction fee. Any unused fee will be refunded to your account.</p>
                    </div>
                    <div className="btn-pos-two">
                        <Button block size="large" color="primary" disabled={submitDisabled()} onClick={() => submit()}>
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    )
}

export { Mint }