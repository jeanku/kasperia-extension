import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

import { Button, Popup, Tabs, Mask, SpinLoading } from 'antd-mobile'
import { AddressType } from '@/types/enum'
import { useNotice } from '@/components/NoticeBar/NoticeBar'

import { useSelector } from "react-redux";
import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import NoDataDom from "@/components/NoDataDom";
import NumberInput from '@/components/NumberInput';
import TokenImg from "@/components/TokenImg";
import { RootState } from '@/store';
import { NetworkType } from "@/utils/wallet/consensus";
import { formatAddress, formatBalanceFixed } from '@/utils/util'
import {
    KasplexL2TestnetChainId,
    IGRAL2TestnetChainId,
    KasplexL2MainnetChainId,
    KasplexL1ToL2BridgeAddressForMainnet,
    KasplexL2ToL1BridgeAddressForMainnet,
    KasplexL2ToL1BridgeAddressForTestnet,
    KasplexL1ToL2BridgeAddressForTestnet,
    IGRAL1ToL2BridgeAddressForTestnet,
} from '@/types/constant'

import { AccountsSubListDisplay } from '@/model/account'
import { Address } from '@/model/contact'
import { Keyring } from '@/chrome/keyring'
import { Contact } from '@/chrome/contact'
import { Account } from '@/chrome/account'
import { Evm } from '@/chrome/evm'
import { EvmNetwork } from "@/model/evm";
import { ethers } from "ethers";

interface SwitchItem {
    address: string,
    changeAddress?: string,
    token: string,
    balance: string,
    desc: number,
    isKaspa: boolean,
    network: string,
}

type BridgeConfig = {
    [key: string]: any
}

const Bridge = () => {
    const { state } = useLocation()
    const { noticeError } = useNotice();
    const navigate = useNavigate();

    const { preference } = useSelector((state: RootState) => state.preference);

    const [evmNetwork, setEvmNetwork] = useState<EvmNetwork>(state?.evmNetwork)
    const [calcLoading, setCalcLoading] = useState(false)

    const [bridgeLoading, setBridgeLoading] = useState(false)
    const [popupVisible, setPopupVisible] = useState(false)
    const [amount, setAmount] = useState<number | string>('')
    const [toAmount, setToAmount] = useState<number | string>('')
    const [contactTabValue, setContactTabValue] = useState<string>("")
    const [accountsValue, setAccountsValue] = useState<AccountsSubListDisplay[] | null>(null)
    const [contactValue, setContactValue] = useState<Address[] | null>(null)

    const isKasplex = useMemo(() => {
        if (!evmNetwork || !evmNetwork.chainId) return false
        const chainId = Number(evmNetwork.chainId)
        return chainId === KasplexL2TestnetChainId || chainId === KasplexL2MainnetChainId
    }, [evmNetwork]);

    const [fromData, setFromData] = useState<SwitchItem>({
        address: preference.currentAccount?.address!,
        token: "KAS",
        balance: ethers.formatUnits(preference.currentAccount?.balance || "0", 8),
        desc: 8,
        isKaspa: true,
        network: `Kaspa ${preference.network.networkType}`,
    })

    const [toData, setToData] = useState<SwitchItem>({
        address: preference.currentAccount?.ethAddress!,
        token: 'KAS',
        balance: "0",
        desc: 18,
        isKaspa: false,
        network: evmNetwork?.name || "",
    })

    const bridgeConfig: BridgeConfig = {
        mainnet: {
            [KasplexL2MainnetChainId]: true
        },
        testnet: {
            [KasplexL2TestnetChainId]: true,
            [IGRAL2TestnetChainId]: true
        },
    }

    const syncBalance = async () => {
        Account.getBalance(fromData.address).then(r => {
            let bal = ethers.formatUnits(r.balance, 8)
            if (fromData.balance != bal) {
                fromData.balance = bal
                setFromData(fromData)
            }
        })
        Account.getEvmBalanceFormatEther(toData.address).then(r => {
            toData.balance = formatBalanceFixed(r, 8)
            setToData(toData)
        })
    }

    const setMax = () => {
        setAmount(fromData.balance)
    }

    const setAddress = (address: string) => {
        toData.changeAddress = address
        setToData(toData)
    }

    useEffect(() => {
        try {
            if (!evmNetwork) {
                Evm.getSelectedNetwork().then(network => {
                    if (!network) return
                    setEvmNetwork(network)
                    toData.network = network.name
                    setToData(toData)
                    checkChainValid()
                })
            } else {
                checkChainValid()
            }
            syncBalance()
        } catch (err) {
            noticeError(err)
        }
    }, [])

    const submitDisabled = () => {
        return !amount || !toAmount
    }

    useEffect(() => {
        switchContactTab("Contacts")
    }, [])

    const switchContactTab = async (key: string) => {
        if (key === contactTabValue) return
        setContactTabValue(key)
        switch (key) {
            case "Contacts":
                if (!contactValue) {
                    let addrType = toData.isKaspa ? AddressType.KaspaAddress : AddressType.EvmAddress
                    let contacts: Address[] = await Contact.get(addrType)
                    setContactValue(contacts)
                }
                break
            case "Accounts":
                if (!accountsValue) {
                    let addrType = toData.isKaspa ? AddressType.KaspaAddress : AddressType.EvmAddress
                    let accounts = await Keyring.getAccountsSubListDisplay(addrType)
                    setAccountsValue(accounts);
                }
                break;
            default:
                break;
        }
    }

    const switchInfo = async () => {
        if (Number(evmNetwork.chainId) == IGRAL2TestnetChainId) {
            return noticeError("not support for igra")
        }
        let temp = fromData
        if (!toData.isKaspa && Number(toData.balance) == 0) {
            let balance = await Account.getEvmBalanceFormatEther(toData.address)
            toData.balance = formatBalanceFixed(balance, 8)
            setFromData(toData)
        } else {
            setFromData(toData)
        }
        setToData(temp)
        setAmount("")
        setToAmount("")
    }

    const checkChainValid = () => {
        let network = preference.network.networkType.toString()
        let config = bridgeConfig[network]
        if (!config) {
            throw new Error("target network invalid!")
        }
        let targetChinnId = Number(evmNetwork.chainId)
        if (!config[targetChinnId]) {
            throw new Error("target network not support!")
        }
    }

    const bridgeSubmit = async () => {
        try {
            if (bridgeLoading) return
            setCalcLoading(true)
            checkChainValid()
            let isKaspaMain = preference.network.networkType == NetworkType.Mainnet
            if (isKasplex) {
                if (fromData.isKaspa) {
                    await bridgeL1ToKasplexL2(isKaspaMain)
                } else {
                    await bridgeL2ToKasplexL1(isKaspaMain)
                }
            }
            if (Number(evmNetwork.chainId) == IGRAL2TestnetChainId) {
                if (fromData.isKaspa) {
                    await bridgeL1ToIgraL2(isKaspaMain)
                } else {
                    //
                }
            }
        } catch (error) {
            noticeError(error)
        } finally {
            setBridgeLoading(false)
            setCalcLoading(false)
        }
    }

    const bridgeL1ToIgraL2 = async (isKaspaMainnet: boolean) => {
        if (isKaspaMainnet) {
            return noticeError("mainnet not support")
        }
        let hash = await Account.bridgeForIgra(IGRAL1ToL2BridgeAddressForTestnet, toData.changeAddress || toData.address, amount.toString())
        navigate('/bridge/sendResult', {
            state: {
                hash,
                evmNetwork,
                sendTo: {
                    address: IGRAL1ToL2BridgeAddressForTestnet,
                    amount: amount,
                },
            }
        })
    }

    const bridgeL1ToKasplexL2 = async (isKaspaMainnet: boolean) => {
        let bridgeAddr = isKaspaMainnet ? KasplexL1ToL2BridgeAddressForMainnet : KasplexL1ToL2BridgeAddressForTestnet
        let payload = toData.changeAddress || toData.address
        navigate('/tx/sign', {
            state: {
                submitTx: {
                    address: bridgeAddr,
                    amount: ethers.parseUnits(amount.toString(), 8),
                    payload: payload,
                }
            }
        })
    }


    const bridgeL2ToKasplexL1 = async (isKaspaMainnet: boolean) => {
        let bridgeAddr = isKaspaMainnet ? KasplexL2ToL1BridgeAddressForMainnet : KasplexL2ToL1BridgeAddressForTestnet
        const iface = new ethers.Interface(["function lockForBridge(bytes calldata payload)"]);
        const hexString = ethers.hexlify(ethers.toUtf8Bytes(toData.changeAddress || toData.address));
        const data = iface.encodeFunctionData("lockForBridge", [hexString]);
        let unSignedTx = await Account.createContractTx({
            from: preference.currentAccount?.ethAddress!,
            to: bridgeAddr,
            data,
            value: ethers.parseUnits(amount.toString(), evmNetwork.decimals).toString()
        })
        navigate('/bridge/sendTx', { state: { unSignedTx: unSignedTx, evmNetwork, toAddress: toData.changeAddress || toData.address, amount: amount.toString() } })
    }

    const caluL1ToL2ReceiveAmount = () => {
        const amountBN = ethers.parseUnits(amount.toString(), 8);
        const feeBN = ethers.parseUnits("0.5", 8);
        return formatBalanceFixed(ethers.formatUnits(amountBN - feeBN, 8).toString(), 8)
    }

    const caluL2ToL1ReceiveAmout = () => {
        const amountBN = ethers.parseUnits(amount.toString(), 8);
        const feeBN = ethers.parseUnits("0.995", 8);
        return formatBalanceFixed(ethers.formatUnits(amountBN * feeBN, 16).toString(), 8)
    }

    useMemo(() => {
        if (!amount || Number(amount) < 1) {
            setToAmount("")
            return
        }
        if (fromData.isKaspa) {
            switch (Number(evmNetwork.chainId)) {
                case KasplexL2TestnetChainId:
                case KasplexL2MainnetChainId:
                    setToAmount(caluL1ToL2ReceiveAmount())
                    break
                case IGRAL2TestnetChainId:
                    setToAmount(amount)
                    break
                default:
            }
        } else {
            switch (Number(evmNetwork.chainId)) {
                case KasplexL2TestnetChainId:
                case KasplexL2MainnetChainId:
                    setToAmount(caluL2ToL1ReceiveAmout())
                    break
                default:
            }
        }
    }, [amount]);

    return (
        <div className="page-box">
            <HeadNav title='Bridge' rightType={isKasplex ? "history" : ""} url={isKasplex ? "/bridge/bridgeHistory" : ""} onBack={() => navigate('/home')}></HeadNav>
            <div className="content-main page-bridge">
                <div className='card-box'>
                    <div className='card-title flex-row cb as'>
                        <span>From</span>
                        <p className="cursor-pointer">
                            <em className="one-line">{formatAddress(fromData.address, 6)}</em>
                        </p>
                    </div>
                    <div className='flex-row cb ac mb12 mt20'>
                        <NumberInput
                            value={amount && Number(amount)}
                            onChange={(e) => setAmount(e.toString())}
                            decimalPlaces={Number(fromData.desc)}
                            max={Number(fromData.balance)}
                            allowNegative={true}
                            placeholder="amount"
                            style={{ fontSize: '14px', color: 'white', flex: 2 }}
                        />
                        <div className='flex-row cb ac'>
                            <div className='sub-tit mr10 mb0import'>
                                <strong className='strong' onClick={() => setMax()}>MAX</strong>
                            </div>
                            <div className="input-select flex-row cb ac">
                                <TokenImg url={fromData.token!} className={'visable-top-img'} name={fromData.token} width={20} height={20} marginRight={3} />
                                <span>{fromData.token}</span>
                            </div>
                        </div>
                    </div>
                    <div className='mt15 flex-row cb ac'>
                        <span>{fromData.network}</span>
                        <span>max: {formatBalanceFixed(fromData.balance, 4)}</span>
                    </div>
                </div>
                <div className='bridge-divider flex-row cc ac'>
                    <div className='bridge-icon' onClick={() => switchInfo()}>
                        <SvgIcon iconName="IconConvert" size={22} color="#D8D8D8" />
                    </div>
                </div>
                <div className='card-box'>
                    <div className='card-title flex-row cb as'>
                        <span>To</span>
                        <p className="cursor-pointer" onClick={() => setPopupVisible(true)}>
                            <em className="one-line">{formatAddress(toData.changeAddress ? toData.changeAddress : toData.address, 6)}</em>
                            <SvgIcon iconName="IconUser" size={18} offsetStyle={{ marginLeft: '3px' }} />
                        </p>
                    </div>
                    <div className='flex-row cb ac mb12 mt20'>
                        <NumberInput
                            value={Number(toAmount)}
                            onChange={(e) => { }}
                            decimalPlaces={Number(toData.desc)}
                            allowNegative={true}
                            placeholder=""
                            disabled={true}
                            style={{ fontSize: '14px', color: 'white', flex: 2 }}
                        />
                        <div className="input-select flex-row cb ac" >
                            <TokenImg url={toData.token!} className={'visable-top-img'} name={toData.token} width={20} height={20} marginRight={3} />
                            <span>{toData.token}</span>
                        </div>
                    </div>
                    <div className='mt15 flex-row cb ac'>
                        <span>{toData.network}</span>
                        <span></span>
                    </div>
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" color="primary" loading={bridgeLoading} disabled={submitDisabled()} onClick={() => bridgeSubmit()}>
                        Bridge
                    </Button>
                </div>
            </div>
            <Mask visible={calcLoading} className="global-loading-mask">
                <div className="global-loading-content">
                    <SpinLoading style={{ '--size': '32px' }} />
                    <div className="global-loading-text">
                        Cost calculation in progress, please wait
                    </div>
                </div>
            </Mask>
            <Popup
                visible={popupVisible}
                className="wallet-popup"
                bodyClassName="wallet-popup-body"
                onMaskClick={() => {
                    setPopupVisible(false)
                }}
                onClose={() => {
                    setPopupVisible(false)
                }}
                bodyStyle={{
                    height: '46vh', borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px', overflowY: 'scroll'
                }}
            >
                <Tabs activeKey={contactTabValue} onChange={key => {
                    switchContactTab(key)
                }}>
                    <Tabs.Tab title="Contacts" key="Contacts" />
                    <Tabs.Tab title="My Account" key="Accounts" />
                </Tabs>

                <div className="contact-list">
                    {
                        contactTabValue === "Contacts" ? (
                            contactValue && contactValue.length > 0 ? (
                                contactValue.map((item: Address, index) => (
                                    <div className="contact-list-box" key={index}>
                                        <div className="contact-list-item" onClick={() => {
                                            setAddress(item.address)
                                            setPopupVisible(false)
                                        }}>
                                            <span>{item.name}</span>
                                            <em>{formatAddress(item.address, 8)}</em>
                                        </div>
                                    </div>
                                ))
                            ) : <NoDataDom />
                        ) : null
                    }
                    {
                        contactTabValue === "Accounts" ? (
                            accountsValue && accountsValue.length > 0 ? (
                                accountsValue.map((item, index) => (
                                    <div className="contact-list-box mb20" key={index}>
                                        <strong>{item.name}</strong>
                                        {
                                            item.drive!.map((dr) => (
                                                <div className="contact-list-item" key={dr.address} onClick={() => {
                                                    setAddress(dr.address)
                                                    setPopupVisible(false)
                                                }}>
                                                    <span>{dr.name}</span>
                                                    <em>{formatAddress(dr.address, 8)}</em>
                                                </div>
                                            ))
                                        }
                                    </div>
                                ))
                            ) : <NoDataDom />
                        ) : null
                    }
                </div>
            </Popup>
        </div>
    )
}

export default Bridge;