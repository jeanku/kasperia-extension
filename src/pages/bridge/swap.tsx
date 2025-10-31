import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Slider, Button, Image, Popup, SearchBar, Divider } from 'antd-mobile'
import { DownOutline } from 'antd-mobile-icons'

import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import NumberInput from '@/components/NumberInput';
import TokenImg from "@/components/TokenImg";
import { useClipboard } from '@/components/useClipboard';

import { formatAddress, calcAmount } from '@/utils/util'
import { set } from 'lodash';


interface TokenList {
    name: string;
    ico?: string;
    address: string
    balance: string;
    chainId?: string;
    usdt?: string
}

const Swap = () => {
    const navigate = useNavigate();
    const { handleCopy } = useClipboard();
    const [swapLoading, setSwapLoading] = useState(false)
    const [tokenVisible, setTokenVisible] = useState(false)
    const [ratio, setRatio] = useState('0')
    const [amount, setAmount] = useState<number | string>('')
    const [toAmount, setToAmount] = useState<number | string>('')
    const [searchValue, setSearchValue] = useState('');
    const [tokenList, setTokenList] = useState<TokenList[]>([])
    const [swapData, setSwapFrom] = useState({
        selectInfo: {
            name: 'KAS',
            tick: 'KAS',
            dec: '8'
        },
        from: {
            address: '0x779Fa38D50db477CDF79C3AF52EDEf8612c3f48a',
            token: 'KAS',
            tokenName: 'Kaspa',
            balance: 2223,
            amount: 30,
            desc: 4,
        },
        to: {
            address: '0x779Fa38D50db477CDF79C3AF52EDEf8612c3f48a',
            token: 'KIN',
            tokenName: 'KIN',
            balance: 100,
            amount: 10,
            desc: 4,
        },
    })

    useEffect(() => {
        getTokenList()
    }, [])

    const submitDisabled = useMemo(() => {
        return !swapData.from.amount || !swapData.to.address
    }, [swapData])

    const showList = useMemo(() => {
        if (searchValue) {
            const searchTxt = searchValue.toLocaleLowerCase()
            const newList = tokenList.filter(item => item.name.toLocaleLowerCase().includes(searchTxt) || item.address.toLocaleLowerCase().includes(searchTxt))
            return newList
        } else {
            return tokenList
        }
    }, [tokenList, searchValue]);
    const getTokenList = async () => {
        const list = [
            {
                name: 'KAS',
                address: "0x779Fa38D50db477CDF79C3AF52EDEf8612c3f48a",
                balance: '2223',
                icon: '',
                chainId: '33453',
                usdt: '5'
            },
            {
                name: 'USDT',
                address: "0x779Fa38D50db477CDF79C3AF52EDEf8612c3f484",
                balance: '300',
                icon: '',
                chainId: '33453',
                usdt: '100'
            },
            {
                name: 'IGRA',
                address: "0x779Fa38D50db477CDF79C3AF52EDEf8612c3f483",
                balance: '666',
                icon: '',
                chainId: '33453',
                usdt: '335'
            },
            {
                name: 'TKCOM',
                address: "0x0b1793776e43d71cc892e58849a0d2465ff36f10",
                balance: '100',
                icon: '',
                chainId: '33453',
                usdt: ''
            },
        ]
        setTokenList(list)
    }

    const toastValue = (value: number | [number, number]) => {
        setRatio(value.toString())
        const calc = (Number(swapData.from.balance) * Number(value)) / 100;
        setAmount(calc);
    }

    const switchInfo = () => {
        const toInfo = swapData.to
        swapData.to = swapData.from
        swapData.from = toInfo
        console.log('swapData', swapData)
        setSwapFrom({ ...swapData})
    }

    const swapSubmit = () => {
        if (swapLoading) return
        setSwapLoading(true)
        console.log('swap submit')
    }
    return (
        <div className="page-box">
            <HeadNav title='Swap' rightType="history" onBack={() => navigate('/home')}></HeadNav>
            <div className="content-main page-swap">
                <div className="coin-item">
                    <Image src={`https://krc20-assets.kas.fyi/icons/${swapData.selectInfo.name}.jpg`}
                        placeholder={<SvgIcon iconName="PngCoinDef" size={44} />}
                        width={44} height={44}
                        fallback={<SvgIcon iconName="PngCoinDef" size={44} />}
                        style={{ borderRadius: '50%', marginRight: '12px' }} lazy fit='cover' />
                    <div className="coin-item-info" onClick={() => setTokenVisible(true)}>
                        <div className="coin-item-name">
                            <span>{swapData.selectInfo.name}</span>
                            <DownOutline />
                        </div>
                    </div>
                </div>
                <div className='card-box mt30'>
                    <div className='card-title flex-row cb as'>
                        <span>From</span>
                        <div className='input-box-fix flex-row cb as'>
                            <Slider
                                defaultValue={0}
                                min={0}
                                value={Number(ratio)}
                                max={100}
                                className="slider-round m15"
                                onChange={toastValue}
                                icon={<span className="slider-round-span"></span>}
                                style={{ '--fill-color': '#53CF39' }}
                            />
                            <span className='wd36'>{ratio}%</span>
                        </div>
                    </div>
                    <div className='flex-row cb ac mb12'>
                        <div className="input-select" onClick={() => setTokenVisible(true)} >
                            <span>{swapData.from.token || 'Select Token'}</span>
                            <DownOutline fontSize={14} />
                        </div>
                        <NumberInput
                            value={Number(amount)}
                            onChange={(e) => setAmount(e.toString())}
                            decimalPlaces={Number(swapData.from.desc)}
                            max={Number(swapData.from.balance)}
                            allowNegative={true}
                            placeholder="0"
                            style={{ textAlign: 'right', color: 'white', flex: 2 }}
                        />
                    </div>
                    <div className='flex-row ac'>
                        <SvgIcon iconName="footerWallet" size={20} color="#D8D8D8" />
                        <span className='ml5'>{swapData.from.amount}</span>
                    </div>
                </div>
                <div className='swap-divider flex-row cc ac'>
                    <div className='swap-icon' onClick={() => switchInfo()}>
                        <SvgIcon iconName="IconConvert" size={22} color="#D8D8D8" />
                    </div>
                </div>
                <div className='card-box'>
                    <div className='card-title flex-row cb as mb12'>
                        <span>To</span>
                    </div>
                    <div className='flex-row cb ac mb12'>
                        <div className="input-select" onClick={() => setTokenVisible(true)} >
                            <span>{swapData.to.token}</span>
                            <DownOutline fontSize={14} />
                        </div>
                        <NumberInput
                            value={Number(toAmount)}
                            onChange={(e) => setToAmount(e.toString())}
                            decimalPlaces={Number(swapData.to.desc)}
                            max={Number(swapData.to.balance)}
                            allowNegative={true}
                            placeholder="0"
                            style={{ textAlign: 'right', color: 'white', flex: 2 }}
                        />
                    </div>
                    <div className='flex-row ac'>
                        <SvgIcon iconName="footerWallet" size={20} color="#D8D8D8" />
                        <span className='ml5'>{swapData.to.amount}</span>
                    </div>
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" color="primary" loading={swapLoading} disabled={submitDisabled} onClick={() => swapSubmit()}>
                        Swap
                    </Button>
                </div>
            </div>
            <Popup
                visible={tokenVisible}
                className="token-popup"
                bodyClassName="token-popup-body"
                showCloseButton
                onMaskClick={() => {
                    setTokenVisible(false)
                }}
                onClose={() => {
                    setTokenVisible(false)
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
                                    <TokenImg url={item.name!} name={item.name} />
                                    <div className="coin-item-info">
                                        <div className="coin-item-name">
                                            <span>{item.name}</span>
                                            {0}
                                        </div>
                                        <div className="coin-item-network">
                                            {item.usdt ? <em>$ {item.usdt}</em> : <em></em>}
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

export default Swap;