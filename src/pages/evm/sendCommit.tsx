import {useEffect, useState} from "react"
import HeadNav from '@/components/HeadNav'
import { SvgIcon } from '@/components/Icon/index'
import NumberInput from '@/components/NumberInput';
import {Button, Mask, Popover, SpinLoading} from 'antd-mobile'
import { useNavigate, useLocation } from "react-router-dom";
import {formatAddress, formatBalanceFixed} from '@/utils/util'

import { RootState } from '@/store';
import { useSelector } from "react-redux";

import '@/styles/transaction.scss'
import { EvmTokenList, EvmNetwork } from "@/model/evm";
import {Evm} from "@/chrome/evm";
import {AccountEvm} from "@/chrome/accountEvm";
import {TransactionRequest} from "ethers/src.ts/providers/provider";
import {ethers} from "ethers";
import {useClipboard} from "@/components/useClipboard";

const SendCommit = () => {
    const { handleCopy } = useClipboard();
    const navigate = useNavigate();
    const { state } = useLocation()
    const [nonce, setNonce] = useState<number | undefined>(undefined)
    const [visibleMask, setVisibleMask] = useState<boolean>(false)
    const [token] = useState<EvmTokenList>(state?.token)
    const [network] = useState<EvmNetwork>(state?.network)
    const [tx, setTx] = useState<TransactionRequest | undefined>(undefined)
    const [fee, setFee] = useState<string>("")
    const [isERC20, setIsErc20] = useState<boolean>(false)
    const [sendTo] = useState<{
        address: string,
        amount: string,
    }>(state?.sendTo)
    const [loading, setLoading] = useState(true)

    const [sendData, setSendData] = useState<{
        address: string,
        amount: string,
    } | undefined>(undefined)

    const currentAccount = useSelector((state: RootState) => state.preference.preference?.currentAccount);

    const submitTransaction = async () => {
        navigate("/evm/sendResult", { state: { sendTo, token, network, tx } })
    }

    const saveNonce = async (nonce?: number) => {
        setVisibleMask(false)
        if (!nonce) {
            return
        }
        setNonce(nonce)
    }
    
    const resetNonce = async () => {
        setNonce(undefined)
    }
    
    const createTransaction = async () => {
        let unsignedTx = undefined
        if (!ethers.isAddress(token.address)) {
            let network = await Evm.getSelectedNetwork()
            if (!network) {
                throw new Error("network not find")
            }
            const amount = ethers.parseUnits(sendTo.amount, network.decimals || 18)
            unsignedTx = await AccountEvm.createTransaction(currentAccount?.ethAddress!, sendTo.address, amount.toString())
        } else {
            setIsErc20(true)
            const amount = ethers.parseUnits(sendTo.amount, token.decimals)
            unsignedTx = await AccountEvm.createErc20Transaction(currentAccount?.ethAddress!, token.address, sendTo.address, amount.toString())
        }
        setTx(unsignedTx)
        let gasPrice = BigInt(unsignedTx?.gasPrice || "0")
        let feeStr = ethers.formatEther(gasPrice * BigInt(unsignedTx?.gasLimit || "0"))
        setFee(formatBalanceFixed(feeStr, 6))
        const abi = ["function transfer(address to, uint256 amount)"];
        const iface = new ethers.Interface(abi);
        if (unsignedTx.data) {
            const decoded = iface.decodeFunctionData("transfer", unsignedTx.data);
            const amount = ethers.formatUnits(decoded.amount.toString(), token.decimals)
            setSendData({
                address: decoded.to,
                amount: amount,
            })
        }
        setLoading(false)
    }

    useEffect(() => {
        createTransaction()
    }, [])

    return (
        <article className="page-box">
            <Mask visible={loading}>
                <SpinLoading className='loading-fixed' style={{ '--size': '32px' }} color='primary'  />
            </Mask>

            <HeadNav title='Sign Transaction'></HeadNav>
            <div className="content-main sign-transactuon assets-details pb96">
                <div className="text-align mt15">
                    <h6 className="assets-amount mb0-pro">{sendTo.amount} {token.symbol}</h6>
                </div>
                <div className="sn">
                    <div className="sn-panel" role="group" aria-label="Switch network">
                        <div className="sn-card sn-from">
                            <span className="sn-badge">From</span>
                            <div className="sn-name">{formatAddress(currentAccount?.ethAddress || "")}</div>
                        </div>
                        <div className="sn-arrow" aria-hidden="true">
                            <SvgIcon iconName="IconArrowRightTheme" />
                        </div>
                        <div className="sn-card sn-to">
                            <span className="sn-badge sn-badge--accent">To</span>
                            <div className="sn-name">{formatAddress(sendTo.address)}</div>
                        </div>
                    </div>
                </div>
                <div className="history-box mt15">
                    <div className="history-token-item">
                        <span>NetWork</span>
                        <em>{network.name}</em>
                    </div>
                    {
                        !isERC20 ? "" : (
                            <div className="history-token-item">
                                <span>Contract Address</span>
                                <em>{formatAddress(token.address)}<SvgIcon className="cursor-pointer ml5" offsetStyle={{marginRight: '-10px'}} iconName="IconCopy" size={24}
                                                                            onClick={() => handleCopy(token.address)}/></em>
                            </div>
                        )
                    }
                    <div className="cart-box">
                        <div className="flex-row cb ac mb12">
                            <Popover
                                content='Gas Fee tip Message'
                                placement='top-start'
                                mode='dark'
                                trigger='click'
                            >
                                <span>Gas</span>
                            </Popover>
                            <em>{fee} {network.symbol}</em>
                        </div>
                    </div>
                    <div className="history-token-item">
                        <span>Nonce</span>
                        <em><SvgIcon iconName="IconEdit" className="cursor-pointer" onClick={() => setVisibleMask(true)}
                                     size={20}/> {nonce == undefined ? tx?.nonce : nonce}</em>
                    </div>
                    {
                        !isERC20 ? "" : (
                            <div className="list-loading">
                                <div className="cart-box">
                                    <div className="flex-row cb ac mb12">
                                        <span>Data</span>
                                        <SvgIcon className="cursor-pointer" offsetStyle={{marginRight: '-10px'}} iconName="IconCopy" size={24}
                                                 onClick={() => handleCopy(tx?.data || "")}/>
                                    </div>
                                    <div className="flex-row cb ac mb12">
                                        <span>Function</span>
                                        <em> transfer </em>
                                    </div>
                                    <div className="flex-row cb ac mb12">
                                        <Popover
                                            content='Gas Fee tip Message'
                                            placement='top-start'
                                            mode='dark'
                                            trigger='click'
                                        >
                                            <span>Param #1</span>
                                        </Popover>
                                        <div>
                                            <em>{formatAddress(sendData?.address, 6)}</em>
                                        </div>
                                    </div>
                                    <div className="flex-row cb ac">
                                        <Popover
                                            content='Gas Fee tip Message'
                                            placement='top-start'
                                            mode='dark'
                                            trigger='click'
                                        >
                                            <span>Param #2</span>
                                        </Popover>
                                        <div>
                                            <em>{sendData?.amount}</em>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" onClick={() => navigate(-1)}>
                    Reject
                    </Button>
                    <Button block size="large" color="primary"
                            loadingText={'Submitting'}
                            disabled={tx == undefined}
                                onClick={() => submitTransaction()}>
                        Sign & Pay
                    </Button>
                </div>
            </div>

            <Mask visible={visibleMask} onMaskClick={() => setVisibleMask(false)}>
                <article className="remove-box">
                    <div className="remove-bg">
                        <SvgIcon className="remove-close" onClick={() => setVisibleMask(false)} iconName="IconClose"
                                 color="#7F7F7F"/>
                        <div className="remove-nox-content">
                            <section className="dialog-content">
                                <p className="remove-tip-strong">This is an advanced function. Please use it
                                    carefully</p>
                                <div className="amount-box mt15 mb12">
                                    <h6 className="sub-tit">
                                        <span>Edit nonce</span>
                                        <strong onClick={() => resetNonce()}>Reset</strong>
                                    </h6>
                                    <div className="input-box mask-input-box">
                                        <NumberInput
                                            value={Number(nonce == undefined ? tx?.nonce : nonce)}
                                            onChange={(e) => setNonce(Number(e))}
                                            decimalPlaces={0}
                                            placeholder="amount"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="remove-btns">
                            <Button size="middle" onClick={() => setVisibleMask(false)}>Cancel</Button>
                            <Button color='primary' size="middle" onClick={() => saveNonce(nonce)}>Save</Button>
                        </div>
                    </div>
                </article>
            </Mask>
        </article>
    )
}

export default SendCommit