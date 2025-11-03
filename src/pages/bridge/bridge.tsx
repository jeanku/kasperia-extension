import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Popup, SearchBar, Tabs } from 'antd-mobile'
import { DownOutline } from 'antd-mobile-icons'

import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import NoDataDom from "@/components/NoDataDom";
import NumberInput from '@/components/NumberInput';
import TokenImg from "@/components/TokenImg";
import { useClipboard } from '@/components/useClipboard';

import { formatAddress } from '@/utils/util'

import { AccountsSubListDisplay } from '@/model/account'
import { Address } from '@/model/contact'
import { Keyring } from '@/chrome/keyring'
import { Contact } from '@/chrome/contact'

interface TokenItem {
    name?: string;
    address: string
    token?: string;
    balance: number;
    chainId?: string;
    amount?: number;
    desc?: number;
}

type PopupType = "FORM"  | "TO" | ""

const Bridge = () => {
    const navigate = useNavigate();
    const { handleCopy } = useClipboard();
    const [swapLoading, setSwapLoading] = useState(false)
    const [tokenVisible, setTokenVisible] = useState(false)
    const [popupVisible, setPopupVisible] = useState(false)
    const [amount, setAmount] = useState<number | string>('')
    const [toAmount, setToAmount] = useState<number | string>('')
    const [searchValue, setSearchValue] = useState('');
    const [contactTabValue, setContactTabValue] = useState<string>("")

    const [tokenList, setTokenList] = useState<TokenItem[]>([])
    const [accountsValue, setAccountsValue] = useState<AccountsSubListDisplay[] | null>(null)
    const [contactValue, setContactValue] = useState<Address[] | null>(null)
    const [address, setAddress] = useState("")
    
    const [selectType, setSelectType] = useState<PopupType>('FORM')
    
    const [bridgeData, setBridgeData] = useState({
        from: {
            address: 'kaspatest:qp48ut63r78w5umx6tpk4vu6s4ftv79x2uf56arar3acqs368mxd65sfdeqjl',
            token: 'KAS',
            balance: 100000,
            amount: 100000,
            desc: 4,
        },
        to: {
            address: '0x779Fa38D50db477CDF79C3AF52EDEf8612c3f48a',
            token: 'IGRA',
            balance: 3333,
            amount: 3333,
            desc: 4,
        },
    })

    useEffect(() => {
        getTokenList()
    }, [])

    const submitDisabled = useMemo(() => {
        return !bridgeData.from.amount || !bridgeData.to.address || !amount || !toAmount
    }, [bridgeData, amount, toAmount])

    const showList = useMemo(() => {
        if (searchValue) {
            const searchTxt = searchValue.toLocaleLowerCase()
            const newList = tokenList.filter(item => item.token!.toLocaleLowerCase().includes(searchTxt) || item.address.toLocaleLowerCase().includes(searchTxt))
            return newList
        } else {
            return tokenList
        }
    }, [tokenList, searchValue]);
    const getTokenList = async () => {
        const list = [
            {
                name: 'KAS',
                token: 'KAS',
                address: "0x779Fa38D50db477CDF79C3AF52EDEf8612c3f48a",
                balance: 2223,
                chainId: '33453',
                amount: 5
            },
            {
                name: 'USDT',
                token: 'USDT',
                address: "0x779Fa38D50db477CDF79C3AF52EDEf8612c3f484",
                balance: 300,
                chainId: '33453',
                amount: 100
            },
            {
                name: 'IGRA',
                token: 'IGRA',
                address: "0x779Fa38D50db477CDF79C3AF52EDEf8612c3f483",
                balance: 666,
                chainId: '33453',
                amount: 333
            },
            {
                name: 'TKCOM',
                token: 'TKCOM',
                address: "0x0b1793776e43d71cc892e58849a0d2465ff36f10",
                balance: 199,
                chainId: '33453',
                amount: 0,
                desc: 4,
            },
        ]
        setTokenList(list)
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
                        let contacts: Address[] = await Contact.get()
                        setContactValue(contacts)
                    }
                    break
                case "Accounts":
                    if (!accountsValue) {
                        let accounts = await Keyring.getAccountsSubListDisplay()
                        setAccountsValue(accounts);
                    }
                    break;
                default:
                    break;
            }
        }

    const setMax = () => {
        setAmount(bridgeData.from.amount)
    }

    const showPopup = (type:PopupType, item: TokenItem) => {
        if(item.token === "KAS") return
        setSelectType(type)
        setTokenVisible(true)
    }
    const hidePopup = () => {
        setSelectType("")
        setTokenVisible(false)
    }

    const switchInfo = () => {
        const toInfo = bridgeData.to
        bridgeData.to = bridgeData.from
        bridgeData.from = toInfo
        setBridgeData({ ...bridgeData})
    }

    const swapSubmit = () => {
        if (swapLoading) return
        setSwapLoading(true)
    }
    return (
        <div className="page-box">
            <HeadNav title='Bridge' rightType="history" url="/bridge/bridgeHistory" onBack={() => navigate('/home')}></HeadNav>
            <div className="content-main page-bridge">
                <div className='card-box'>
                    <div className='card-title flex-row cb as'>
                        <span>From</span>
                        <p className="cursor-pointer" onClick={() => setPopupVisible(true)}>
                            <em className="one-line">{formatAddress(bridgeData.from?.address, 6)}</em>
                            <SvgIcon iconName="IconParase" color="#7F7F7F" size={18} offsetStyle={{ marginLeft: '5px' }} />
                        </p>
                    </div>
                    <div className='flex-row cb ac mb12 mt20'>
                        <NumberInput
                            value={Number(amount)}
                            onChange={(e) => setAmount(e.toString())}
                            decimalPlaces={Number(bridgeData.from.desc)}
                            max={Number(bridgeData.from.balance)}
                            allowNegative={true}
                            placeholder="0"
                            style={{ fontSize: '14px', color: 'white', flex: 2 }}
                        />
                        <div className='flex-row cb ac'>
                            <div className='sub-tit mr10 mb0import'>
                                <strong className='strong' onClick={ () => setMax() }>MAX</strong>
                            </div>
                            <div className="input-select flex-row cb ac" onClick={ () => showPopup('FORM', bridgeData.from) }>
                                <TokenImg url={bridgeData.from.token!} className={ 'visable-top-img'} name={bridgeData.from.token} width={20} height={20} marginRight={3} />
                                <span>{bridgeData.from.token || 'Select Token'}</span>
                                { bridgeData.from.token !== 'KAS' ? <DownOutline fontSize={14} /> : null }
                            </div>
                        </div>
                    </div>
                    <h6 className="sub-tit mb0import mt15">
                        <span>{bridgeData.from.amount}</span>
                        <span>Kasplex-Text</span>
                    </h6>
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
                            <em className="one-line">{formatAddress(bridgeData.to?.address, 6)}</em>
                            <SvgIcon iconName="IconParase" color="#7F7F7F" size={18} offsetStyle={{ marginLeft: '5px' }} />
                        </p>
                    </div>
                    <div className='flex-row cb ac mb12 mt20'>
                        <NumberInput
                            value={Number(toAmount)}
                            onChange={(e) => setToAmount(e.toString())}
                            decimalPlaces={Number(bridgeData.to.desc)}
                            allowNegative={true}
                            placeholder="0"
                            style={{ fontSize: '14px', color: 'white', flex: 2 }}
                        />
                        <div className="input-select flex-row cb ac" onClick={() => showPopup('TO', bridgeData.to)} >
                            <TokenImg url={bridgeData.to.token!} className={ 'visable-top-img'} name={bridgeData.to.token} width={20} height={20} marginRight={3} />
                            <span>{bridgeData.to.token}</span>
                            { bridgeData.to.token !== 'KAS' ? <DownOutline fontSize={14} /> : null }
                        </div>
                    </div>
                    <h6 className="sub-tit mb0import mt15">
                        <span>{bridgeData.to.amount}</span>
                        <span><span>Kasplex-Text</span></span>
                    </h6>
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" color="primary" loading={swapLoading} disabled={submitDisabled} onClick={() => swapSubmit()}>
                        Bridge
                    </Button>
                </div>
            </div>
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
                bodyStyle={{ height: '46vh', borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px', overflowY: 'scroll' }}
            >
                <Tabs activeKey={contactTabValue} onChange={key => {
                    switchContactTab(key)
                }}>
                    <Tabs.Tab title="Contacts" key="Contacts" />
                    <Tabs.Tab title="My Account" key="Accounts" />
                </Tabs>

                <div className="contact-list">
                    {
                        contactTabValue == "Contacts" ? (
                            contactValue && contactValue.length > 0 ? (
                                contactValue.map((item: Address, index) => (
                                    <div className="contact-list-box" key={index}>
                                        <div className="contact-list-item" key={address} onClick={() => {
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
                        contactTabValue == "Accounts" ? (
                            accountsValue && accountsValue.length > 0 ? (
                                accountsValue.map((item, index) => (
                                    <div className="contact-list-box mb20" key={index}>
                                        <strong>{item.name}</strong>
                                        {
                                            item.drive!.map((dr, index) => (
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
                            ) :  <NoDataDom />
                        ) : null
                    }
                </div>
            </Popup>
            <Popup
                visible={tokenVisible}
                className="token-popup"
                bodyClassName="token-popup-body"
                showCloseButton
                onMaskClick={() => {
                    hidePopup()
                }}
                onClose={() => {
                    hidePopup()
                }}
                bodyStyle={{ height: '55vh', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', }}
            >
                <div className='poup-title'>Select Token</div>
                <div className='content-main pt0 mt15'>
                    <div className="search-box mb20">
                        <SearchBar
                            value={searchValue}
                            onChange={(val) => setSearchValue(val)}
                            icon={<SvgIcon iconName="IconSearch" offsetStyle={{ marginRight: '2px' }} />}
                            placeholder="Search tokens"
                        />
                    </div>
                    <div className='y-auto'>
                    {
                        showList.length ?
                            showList.map((item) => (
                                <div className="coin-item" key={item.name}>
                                    <TokenImg url={item.name!} name={item.name!} />
                                    <div className="coin-item-info">
                                        <div className="coin-item-name">
                                            <span>{item.name}</span>
                                            {0}
                                        </div>
                                        <div className="coin-item-network">
                                            {item.amount ? <em>${item.amount}</em> : <em></em>}
                                            <em >{formatAddress(item?.address, 6)} <SvgIcon onClick={() => handleCopy(item.address || "") } iconName="IconCopy" color="#7F7F7F" offsetStyle={{ marginLeft: '5px',  marginRight: '-8px' }} /> </em>
                                        </div>
                                    </div>
                                </div>
                            )) : null
                    }
                    </div>
                </div>
            </Popup>
        </div>
    )
}

export default Bridge;