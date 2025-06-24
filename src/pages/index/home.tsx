import React, { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { SearchBar, DotLoading, List, Image } from 'antd-mobile'
import { UserOutline } from 'antd-mobile-icons'
import { Oplist, TokenList } from '@/model/krc20';
import { Transaction } from '@/model/kaspa';
import CountUp from 'react-countup';
import { SvgIcon } from '@/components/Icon/index'
import { formatAddress, formatBalance, getDecimals, formatDate, formatHash } from "@/utils/util"
import { Preference } from "@/chrome/preference"
import { RootState } from '@/store';
import { KasplexApi, KaspaApi, Kiwi, Modules } from '@kasplex/kiwi-web'
import { isEqual } from 'lodash';
import Footer from '@/components/Footer'
import {
    setKrc20TokenList as setKrc20TokenListSlice, setKrc20OpList as setKrc20OpListSlice,
    setKaspaTxList as setKaspaTxListSlice, setKasPrice as setKasPriceSlice, setContractAddress as setContractAddressSlice
} from "@/store/preferenceSlice";
import store from '@/store';
import { useClipboard } from '@/components/useClipboard';
import { Dispatch } from 'redux';

import IconArrorRight from '@/assets/images/home-arrow-right.png'

type LoadingType = 0 | 1 | 2
const Home = () => {

    const { handleCopy } = useClipboard();
    const navigate = useNavigate();

    const [address, setAddress] = useState<string>("");
    const [balance, setBalance] = useState("0");
    const [listLoadingType, setListLoadingType] = useState<LoadingType>(1);

    const [filteredValue, setfilteredValue] = useState('');

    const [krc20TokenList, setKrc20TokenList] = useState<{
        time: number,
        list: Array<TokenList>
    }>({ time: 0, list: [] });

    const [krc20OpList, setKrc20OpList] = useState<{
        time: number,
        list: Array<Oplist>
    }>({ time: 0, list: [] });

    const [kaspaActList, setKaspaActList] = useState<{
        time: number,
        list: Array<Transaction>
    }>({ time: 0, list: [] });

    const [kaspaPrice, setKaspaPrice] = useState<{
        time: number,
        price: number
    }>({ time: 0, price: 0 });

    const underlineRef = useRef(null);

    const homeTabs = ['Tokens', 'Activity']
    const activityTabs = ['KAS', 'KRC20']
    const [homeTabValue, setHomeTabValue] = useState(homeTabs[0]);
    const [activityTabValue, setActivityTabValue] = useState(activityTabs[0]);

    const currentAccount = useSelector((state: RootState) => state.preference.preference?.currentAccount);
    const contractAddressMap = useSelector((state: RootState) => state.preference.preference?.contractAddress || {});
    const { preference } = useSelector((state: RootState) => state.preference);
    const rpcClient = useSelector((state: RootState) => state.rpc.client);

    const fetchKrc20TokenList = async () => {
        let curTime = new Date().getTime() / 1000
        setListLoadingType(1)
        KasplexApi.getAddressTokenList(preference!.currentAccount!.address).then((r: Modules.AddressTokenListResponse) => {
            let fetchSc : string[] = []
            if (r.result && r.result.length > 0) {
                let tokens = r.result.map((r: Modules.AddressTokenList) => {
                    if (r.ca && !contractAddressMap[r.ca]) {
                        fetchSc.push(r.ca)
                    }
                    return {
                        tick: r.tick, ca: r.ca, balance: r.balance, locked: r.locked, dec: r.dec,
                        name: r.ca ? (contractAddressMap[r.ca] || "") : (r.tick || "")
                    }
                })
                setKrc20TokenList({ time: curTime, list: tokens })
                if (fetchSc.length > 0) {
                    getScToken(fetchSc, tokens)
                } else {
                    if (!isEqual(tokens, preference!.krc20TokenList)) {
                        Preference.setKrc20TokenList(tokens)
                        const dispatch: Dispatch = store.dispatch;
                        dispatch(setKrc20TokenListSlice(tokens))
                    }
                }
            }
        }).finally(() => {
            setListLoadingType(0)
        })
    };

    const getScToken = async (sc: string[], tokens: TokenList[]) => {
        await Promise.all(sc.map(async (key) => {
            const r = await KasplexApi.getToken(key);
            if (r.result && r.result.length > 0) {
                let cur = r.result[0];
                contractAddressMap[cur.ca!] = cur.name!;
            }
        }));
        let curTime = new Date().getTime() / 1000
        let mapedToken = tokens.map(r => {
            return {
                balance: r.balance,
                ca: r.ca,
                tick: r.tick,
                locked: r.locked,
                name: r.ca ? contractAddressMap[r.ca] : r.tick || "",
                dec: r.dec,
            }
        })
        setKrc20TokenList({ time: curTime, list: mapedToken })
        Preference.setContractAddress(contractAddressMap)
        const dispatch: Dispatch = store.dispatch;
        dispatch(setContractAddressSlice(contractAddressMap))
    }

    const getKrc20list = async () => {
        let curTime = new Date().getTime() / 1000
        if (curTime - krc20OpList.time <= 5) return
        setListLoadingType(1)
        KasplexApi.getOpList({ address: preference?.currentAccount?.address! }).then((r: any) => {
            if (krc20OpList.time == 0 || !isEqual(krc20OpList.list, r.result)) {
                setKrc20OpList({ time: curTime, list: r.result as Oplist[] })
                Preference.setKrc20OpList(r.result)
                const dispatch: Dispatch = store.dispatch;
                dispatch(setKrc20OpListSlice(r.result))
            }
        }).finally(() => {
            setListLoadingType(0)
        })
    }

    const getKaspaActlist = async () => {
        let curTime = new Date().getTime() / 1000
        if (curTime - kaspaActList.time <= 5) return
        setListLoadingType(1)
        KaspaApi.getFullTransactions(address, { limit: "10", resolve_previous_outpoints: "light" }).then((r: any) => {
            let txs = r as Transaction[]
            const data = txs.map(item => {
                let amount = 0
                let totalInput = item.inputs.reduce((sum, input) => {
                    if (input.previous_outpoint_address == address) {
                        amount -= input.previous_outpoint_amount
                    }
                    return sum + input.previous_outpoint_amount;
                }, 0);
                let totalOutput = item.outputs.reduce((sum, output) => {
                    if (output.script_public_key_address == address) {
                        amount += output.amount
                    }
                    return sum + output.amount;
                }, 0);
                item.fee = totalInput - totalOutput
                item.amount = amount < 0 ? amount + item.fee : amount
                if (item.amount == 0 && item.outputs.length > 0) {
                    if (item.outputs[0].script_public_key_address == address) {
                        item.amount = item.outputs[0].amount
                    } else {
                        item.amount = -(item.outputs[0].amount)
                    }
                }
                item.inputs = []
                item.outputs = []
                return item
            })
            if (kaspaActList.time == 0 || !isEqual(data, kaspaActList.list)) {
                setKaspaActList({ time: curTime, list: data })
                Preference.setKaspaTxList(data)

                const dispatch: Dispatch = store.dispatch;
                dispatch(setKaspaTxListSlice(data))
            }
        }).finally(() => {
            setListLoadingType(0)
        })
    }

    const fetchBalance = async () => {
        try {
            const res = await rpcClient?.getBalanceByAddress({ address: preference!.currentAccount!.address });
            let _balance = res?.balance.toString()
            if (_balance && _balance !== preference?.currentAccount!.balance) {
                setBalance(_balance);
                Preference.updateAccountsBalance(preference!.currentAccount!.address, _balance);
            }
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        }
    };

    const getKasPrice = async () => {
        let curTime = new Date().getTime() / 1000
        if (curTime - (preference?.kasPrice?.time || 0) <= 600) return
        try {
            const resp: any = await KaspaApi.getInfoPrice();
            if ( kaspaPrice.time === 0 || kaspaPrice.price !== resp.price ) {
                let temp = { time: curTime, price: resp.price as number }
                setKaspaPrice(temp);
                Preference.setKasPrice(temp);
                const dispatch: Dispatch = store.dispatch;
                dispatch(setKasPriceSlice(temp));
            }
        } catch (error) {
            console.error("Failed to fetch Kaspa price:", error);
        }
    }

    const handleHomeTab = async (key: string) => {
        if (key === homeTabValue) return
        setHomeTabValue(key)
        let curTime = new Date().getTime() / 1000
        if (key === homeTabs[0]) {
            if (curTime - krc20TokenList.time <= 20) {
                return
            }
            fetchKrc20TokenList()
        } else if (key === homeTabs[1]) {
            if (activityTabValue === activityTabs[0]) {
                getKaspaActlist()
            } else {
                getKrc20list()
            }
        }
    }

    const handleActivityTab = async (key: string) => {
        setActivityTabValue(key)
        if (key === activityTabs[0]) {
            getKaspaActlist()
        } else {
            getKrc20list()
        }
    }

    useEffect(() => {
        console.log("preference", preference)
        if (!preference.currentAccount) return;
        setAddress(preference.currentAccount!.address)
        setBalance(preference.currentAccount!.balance)

        setKrc20TokenList({ time: 0, list: preference!.krc20TokenList || [] })
        setKrc20OpList({ time: 0, list: preference!.krc20OpList || [] })
        setKaspaActList({ time: 0, list: preference!.kaspaTxList || [] })

        fetchKrc20TokenList()
        if (Kiwi.network === 0) {
            if (preference!.kasPrice) {
                setKaspaPrice(preference!.kasPrice)
            }
            getKasPrice()
        }
    }, [currentAccount]);

    useEffect(() => {
        fetchBalance();
    }, [rpcClient]);

    const filteredTokenList = useMemo(() => {
        const keyword = filteredValue.toLowerCase();
        return krc20TokenList.list.filter(token => {
            return token?.name?.toLowerCase().includes(keyword)
        });
    }, [krc20TokenList, filteredValue]);

    const getTickDec = (tick?: string, ca?: string) => {
        let token = krc20TokenList.list.find(r => {
            return r.tick === tick && r.ca == ca
        })
        if (!token) return 8
        return Number(token.dec)
    }

    const toKrc20 = (token: TokenList) => {
        navigate("/krc20", { state: { token, address: address } })
    }

    const toOpinfo = (index: number) => {
        let item = krc20OpList.list[index]
        if (!item) return
        navigate("/krc20/opinfo", { state: { opinfo: item, dec: getTickDec(item.tick, item.ca) } })
    }

    const showKaspaTxinfo = (index: number) => {
        let item = kaspaActList.list[index]
        if (!item) return
        navigate("/tx/info", { state: { tx: item } })
    }

    return (
        <div className="page-box">
            <div className="nav-bar">
                <div className="nav-left no-cursor">
                    {rpcClient && rpcClient?.isConnected ? (<><span>{Kiwi.getNetworkID()}</span></>) :
                        (<><span>Connecting</span><DotLoading color='#74E6D8' /></>)
                    }
                </div>
                <div className="nav-right">
                    <div className="nav-bar-right" onClick={() => navigate('/account')}>
                        <span>{preference?.currentAccount?.name}</span>
                        <img className="arrow-right" src={IconArrorRight} alt="" />
                    </div>
                </div>
            </div>
            <article className="content-main page-home pb50">
                <div className="home-account">
                    <section className="continer-box">
                        <UserOutline fontSize={24} />
                        <div className="account-info">
                            <strong>{preference?.currentAccount?.accountName}</strong>
                            <p className="cursor-pointer" onClick={() => handleCopy(address)} ><em className="one-line">{formatAddress(address, 6)}</em><SvgIcon iconName="IconCopy" color="#7F7F7F" offsetStyle={{ marginLeft: '5px' }} /></p>
                        </div>
                        <SvgIcon className="cursor-pointer" iconName="arrowRight" onClick={() => navigate('/account/switch',
                            { state: { id: preference.currentAccount?.id } })} />
                    </section>
                    <div className="account-balance">
                        <p className="account-text-amount font-Inter-black"><CountUp key={balance} start={0.00} decimal={'.'}
                            decimals={getDecimals(Number(formatBalance(balance, 8)))}
                            end={Number(formatBalance(balance, 8))} duration={0.2} /> KAS</p>
                        <p className="account-text-d"> {kaspaPrice.price == 0 ? "" : "$" + formatBalance((kaspaPrice.price * Number(balance)).toString(), 8)} </p>
                    </div>
                </div>
                <div className="page-btn">
                    <div className="btn-icon" onClick={() => navigate('/account/receive')}>
                        <SvgIcon iconName="IconReceive" offsetStyle={{ marginRight: '6px' }} color="#171717" />
                        Receive
                    </div>
                    <div className="btn-icon" onClick={() => navigate('/tx/send', {
                        state: {token: {tick: "KAS", name: "KAS", balance, dec: 8}}
                    })}>
                        <SvgIcon iconName="IconSend" offsetStyle={{ marginRight: '6px' }} color="#171717" />
                        Send
                    </div>
                </div>
                <ul className="page-tabs">
                    {
                        homeTabs.map((key, index) => {
                            return <li key={index} className={homeTabValue === key ? 'active' : ''}
                                onClick={() => handleHomeTab(key)}>{key}</li>
                        })
                    }
                    <div className="tab-underline" ref={underlineRef} />
                </ul>
                {
                    homeTabValue === 'Tokens' ?
                        <div className="search-box">
                            <SearchBar icon={<SvgIcon iconName="IconSearch" offsetStyle={{ marginRight: '2px' }} />}
                                placeholder='Search tokens...' onChange={setfilteredValue} />
                        </div> : ''
                }
                <div className="page-list">
                    {
                        homeTabValue === 'Tokens' ?
                            <div className="page-list-box">
                                {filteredTokenList.map((token, index) => (
                                    <div className="page-list-item" key={index} onClick={() => toKrc20(token)}>
                                        <Image
                                            src={`https://krc20-assets.kas.fyi/icons/${token.name}.jpg`}
                                            width={44}
                                            height={44}
                                            lazy={true}
                                            placeholder={<SvgIcon iconName="PngCoinDef" size={44} color="" />}
                                            fallback={<SvgIcon iconName="PngCoinDef" size={44} color="" />}
                                            fit='cover'
                                            style={{ borderRadius: '50%', marginRight: '16px' }}
                                        />
                                        <div className="list-item-content">
                                            <strong>{token.name}</strong>
                                            <span> KRC20 </span>
                                        </div>
                                        <div className="list-item-content text-right">
                                            <strong>{formatBalance(token.balance, token.dec)}</strong>
                                            <span>{token.ca ? "CA:" + formatHash(token.ca, 6) : "-"}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            :
                            <div className="page-activity">
                                <div className="activity-tabs">
                                    {
                                        activityTabs.map((key, index) => {
                                            return <span key={index}
                                                className={activityTabValue === key ? 'active' : ''}
                                                onClick={() => handleActivityTab(key)}>{key}</span>
                                        })
                                    }
                                </div>
                                <List>
                                    {activityTabValue === activityTabs[0] ?
                                        kaspaActList.list.map((item, index) =>
                                        (
                                            <div className="history-item" onClick={() => showKaspaTxinfo(index)}
                                                key={index}>
                                                <div className="history-top">
                                                    <span>{formatHash(item.transaction_id)}{item.payload ? "(payload)" : null}</span>
                                                    <strong
                                                        className={item.is_accepted ? 'history-status' : 'history-status failed'}>{item.is_accepted ? "Success" : "Failed"}</strong>
                                                </div>
                                                <div className="history-bottom">
                                                    <div className="history-left">
                                                        <em className={item.amount < 0 ? 'history-icon sub' : 'history-icon'}>{item.amount < 0 ? "-" : "+"}</em>
                                                        <strong
                                                            className="history-amount">{formatBalance(`${Math.abs(item.amount)}`, 8)} Kas</strong>
                                                    </div>
                                                    <span
                                                        className="history-time">{formatDate(item.block_time.toString())}</span>
                                                </div>
                                            </div>
                                        )) :
                                        krc20OpList.list.map((item, index) => (
                                            <div className="history-item" onClick={() => toOpinfo(index)} key={index}>
                                                <div className="history-top">
                                                    <span>{item.op} {item.to ? formatAddress(item.to, 4) : ""}</span>
                                                    <strong
                                                        className={item.opAccept == "1" ? 'history-status' : 'history-status failed'}>{item.opAccept == "1" ? "Success" : "Failed"}</strong>
                                                </div>
                                                <div className="history-bottom">
                                                    {
                                                        item.op.toLowerCase() == "deploy"  ?  (
                                                            <div className="history-left">
                                                                <em className='history-icon'>+</em>
                                                                <strong className="history-amount">{item.opAccept == "1" && item.pre ? formatBalance(item.pre, getTickDec(item.tick, item.ca)) : "0"} {item.name}</strong>
                                                            </div>
                                                        ) : (
                                                            <div className="history-left">
                                                                <em className={item.to !== address ? 'history-icon sub' : 'history-icon'}>{item.to !== address ? "-" : "+"}</em>
                                                                <strong className="history-amount">{formatBalance(item.amt || "0", getTickDec(item.tick, item.ca))} {item.tick || item.name}</strong>
                                                            </div>
                                                        )
                                                    }
                                                    <span className="history-time">{formatDate(item.mtsAdd)}</span>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </List>
                            </div>
                    }
                    {
                        listLoadingType ? (
                            <div className="list-loading">
                            {listLoadingType === 1 ? <>Loading<DotLoading /></> : <p>No more</p>}
                            </div>
                        ) : ''
                    }
                </div>
            </article>
            <Footer></Footer>
        </div>
    )
}

export { Home };