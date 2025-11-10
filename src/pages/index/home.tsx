import { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CountUp from 'react-countup';

import { SearchBar, DotLoading, List, Image, Popover } from 'antd-mobile'
import { UserOutline, DownOutline, AddOutline, UndoOutline } from 'antd-mobile-icons'
import { Action } from 'antd-mobile/es/components/popover'
import Footer from '@/components/Footer'
import { SvgIcon } from '@/components/Icon/index'
import { useClipboard } from '@/components/useClipboard';
import TokenImg from "@/components/TokenImg";

import { Oplist, TokenList } from '@/model/krc20';
import { EvmTokenList, EvmNetwork } from '@/model/evm';
import { formatAddress, formatBalance, formatDate, formatHash, formatDecimal, formatBalanceFixed } from "@/utils/util"
import { Evm } from "@/chrome/evm"
import { Account } from "@/chrome/account"
import store, { RootState } from '@/store';
import {
    setKrc20TokenList as setKrc20TokenListSlice,
    setKrc20OpList as setKrc20OpListSlice,
    setKaspaTxList as setKaspaTxListSlice,
    setContractAddress as setContractAddressSlice,
    setEvm20TokenList as setPreferenceEvmTokenList,
    setAccountBalance as setAccountBalanceSlice
} from "@/store/preferenceSlice";
import { setHomeSelectTabValue } from "@/store/userSlice";
import { GetKrc20OperationListResponse, Krc20Client, Krc20TokenBalanceInfo } from "@/utils/wallet/krc20";
import { KaspaClient, KaspaTransaction } from "@/utils/wallet/kaspa";
import { Dispatch } from 'redux';
import IconArrorRight from '@/assets/images/home-arrow-right.png'
import { GetKrc20AddressTokenListResponse, Krc20Response } from "@/utils/wallet/krc20/types";


export type TimedList<T> = {
    time: number;
    list: T[];
};

type LoadingType = 0 | 1 | 2

const Home = () => {
    const { handleCopy } = useClipboard();
    const navigate = useNavigate();

    const { preference } = useSelector((state: RootState) => state.preference);
    const { homeSelectTab } = useSelector((state: RootState) => state.user);

    const currentAccount = useSelector((state: RootState) => state.preference.preference?.currentAccount);

    const [isConnect, setIsConnect] = useState<boolean>(false);
    const [balance, setBalance] = useState<string>(preference.currentAccount?.balance || "0");
    const [evmNetwork, setEvmNetwork] = useState<EvmNetwork | undefined>(undefined);
    const [contractAddressMap] = useState<Record<string, string>>(preference?.contractAddress || {});
    const [listLoadingType, setListLoadingType] = useState<LoadingType>(1);
    const [filteredValue, setfilteredValue] = useState('');

    const [krc20TokenList, setKrc20TokenList] = useState<TimedList<TokenList>>({
        time: 0, list: preference!.krc20TokenList || [],
    });

    const [krc20OpList, setKrc20OpList] = useState<TimedList<Oplist>>({
        time: 0, list: preference!.krc20OpList || [],
    });

    const [kaspaActList, setKaspaActList] = useState<TimedList<KaspaTransaction>>({
        time: 0, list: preference!.kaspaTxList || [],
    });

    const [evmTokenList, setEvmTokenList] = useState<TimedList<EvmTokenList>>({
        time: 0, list: [],
    });

    const homeTabs = ['Tokens', "EVM", 'Activity']
    const activityTabs = ['KAS', 'KRC20']

    const underlineRef = useRef(null);
    const [homeTabValue, setHomeTabValue] = useState("");
    const [activityTabValue, setActivityTabValue] = useState(activityTabs[0]);

    const dispatch: Dispatch = store.dispatch;

    useEffect(() => {
        if (currentAccount) {
            fetchBalance()
            let key = homeSelectTab || preference.index || homeTabs[0]
            handleHomeTab(key)
        }
    }, [currentAccount]);

    const actions: Action[] = [
        { key: 'add', icon: <AddOutline fontSize={16} color="#FFFFFF" />, text: 'Add Token' },
        { key: 'refresh', icon: <UndoOutline fontSize={16} color="#FFFFFF" />, text: 'Refresh' },
    ];

    const popoverAction = async (key: string) => {
        switch (key) {
            case 'add':
                navigate('/evm/addToken')
                break;
            case 'refresh':
                await fetchEvmTokenlist()
                break;
            default:
                break;
        }
    }

    const fetchKrc20TokenList = async () => {
        let curTime = new Date().getTime() / 1000
        if (curTime - krc20TokenList.time <= 5) return
        setListLoadingType(1)
        let client = new Krc20Client(preference.network.networkType)
        if (!preference?.currentAccount?.address) return
        client.getKrc20AddressTokenList(preference!.currentAccount!.address).then((r: Krc20Response<GetKrc20AddressTokenListResponse>) => {
            let fetchSc: string[] = []
            if (r.result && r.result.length > 0) {
                let tokens = r.result.map((r: Krc20TokenBalanceInfo) => {
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
                    getScToken(client, fetchSc, tokens)
                } else {
                    if (!isEqualByNameAndBalance(tokens, preference!.krc20TokenList || [])) {
                        dispatch(setKrc20TokenListSlice(tokens))
                    }
                }
            }
        }).finally(() => {
            setListLoadingType(0)
        })
    };

    const getScToken = async (client: Krc20Client, sc: string[], tokens: TokenList[]) => {
        await Promise.all(sc.map(async (key) => {
            const r = await client.getKrc20TokenInfo(key);
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
        dispatch(setContractAddressSlice(contractAddressMap))
    }

    const getKrc20list = async () => {
        let curTime = new Date().getTime() / 1000
        if (curTime - krc20OpList.time <= 5) return
        setListLoadingType(1)
        let client = new Krc20Client(preference.network.networkType)
        if (!preference?.currentAccount?.address) return
        client.getKrc20OperationList({ address: preference?.currentAccount?.address! }).then((r: Krc20Response<GetKrc20OperationListResponse>) => {
            if (r.result && r.result.length != krc20OpList.list.length ||
                r.result && r.result.length > 0 && krc20OpList.list.length > 0 && r.result[0].hashRev != krc20OpList.list[0].hashRev) {
                setKrc20OpList({ time: curTime, list: r.result as Oplist[] })
                dispatch(setKrc20OpListSlice(r.result as Oplist[]))
            }
        }).finally(() => {
            setListLoadingType(0)
        })
    }

    const fetchEvmTokenlist = async () => {
        setListLoadingType(1)
        let network = evmNetwork
        if (!network) {
            network = await Evm.getSelectedNetwork()
            if (!network) return
            setEvmNetwork(network)
        }
        try {
            let chainId = network.chainId
            let curTime = new Date().getTime() / 1000
            const oldList = preference?.evmTokenList?.[chainId] || [];
            if (evmTokenList.time === 0) {
                setEvmTokenList({ time: curTime, list: oldList })
            }
            if (curTime - evmTokenList.time <= 1) return
            let data = await Account.getERC20Tokens(preference.currentAccount!.ethAddress)
            console.log("fetchEvmTokenlist", data)
            if (!shallowCompareTokens(data, oldList)) {
                setEvmTokenList({ time: curTime, list: data });
                dispatch(setPreferenceEvmTokenList({ chainId, listData: data }));
            }
        } catch (error) {
            console.log('error-fetchEvmTokenlist', error)
        }
        setListLoadingType(0)
    }

    const fetchKaspaTxlist = async () => {
        let curTime = new Date().getTime() / 1000
        if (curTime - kaspaActList.time <= 5) return
        setListLoadingType(1)
        let client = new KaspaClient(preference.network.networkType)
        if (!preference?.currentAccount?.address) return
        client.getFullTransactions(currentAccount!.address, { limit: "50", resolve_previous_outpoints: "light" }).then((txs: KaspaTransaction[]) => {
            const data = txs.map(item => {
                let isFromOtherAddress = true
                let totalInput = item.inputs.reduce((sum, input) => {
                    if (input.previous_outpoint_address == currentAccount!.address) {
                        isFromOtherAddress = false
                    }
                    return sum + input.previous_outpoint_amount;
                }, 0);
                let myOutAmount = 0
                let totalOutput = item.outputs.reduce((sum, output) => {
                    if (output.script_public_key_address == currentAccount!.address) {
                        myOutAmount += output.amount
                    }
                    return sum + output.amount;
                }, 0);
                item.fee = totalInput - totalOutput
                if (isFromOtherAddress) {
                    item.amount = myOutAmount
                } else {
                    item.amount = -(totalInput - myOutAmount)
                }
                item.inputs = []
                item.outputs = []
                return item
            })
            if (data.length != kaspaActList.list.length ||
                data.length > 0 && kaspaActList.list.length > 0 && data[0].hash != kaspaActList.list[0].hash
            ) {
                setKaspaActList({ time: curTime, list: data })
                dispatch(setKaspaTxListSlice(data))
            }
        }).finally(() => {
            setListLoadingType(0)
        })
    }

    const fetchBalance = async () => {
        let _balance = await Account.getBalance()
        setIsConnect(true)
        if (_balance.balance !== balance) {
            setBalance(_balance.balance.toString())
            dispatch(setAccountBalanceSlice(_balance.balance.toString()));
        }
    };

    const handleHomeTab = async (key: string) => {
        if (key === homeTabValue) return
        setHomeTabValue(key)
        dispatch(setHomeSelectTabValue(key))
        if (key === homeTabs[0]) {
            fetchKrc20TokenList()
        } else if (key === homeTabs[1]) {
            fetchEvmTokenlist()
        } else if (key === homeTabs[2]) {
            if (activityTabValue === activityTabs[0]) {
                fetchKaspaTxlist()
            } else {
                getKrc20list()
            }
        }
    }

    const handleActivityTab = async (key: string) => {
        setActivityTabValue(key)
        if (key === activityTabs[0]) {
            fetchKaspaTxlist()
        } else {
            getKrc20list()
        }
    }

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
        navigate("/krc20", { state: { token, address: currentAccount!.address } })
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

    const toTokenInfo = (index: number) => {
        let item = evmTokenList.list[index]
        if (!item) return
        navigate("/evm/tokenInfo", { state: { token: item, network: evmNetwork } })
    }

    function isEqualByNameAndBalance(a: any[], b: any[]): boolean {
        if (a.length !== b.length) return false;
        return a.every((item, index) =>
            item.name === b[index].name && item.balance === b[index].balance
        );
    }

    const shallowCompareTokens = (a: EvmTokenList[], b: EvmTokenList[]) => {
        if (a.length !== b.length) return false;
        return a.every((item, i) => (
            item.balance === b[i].balance && item.name === b[i].name && item.symbol === b[i].symbol
        ));
    };

    return (
        <div className="page-box">
            <div className="nav-bar">
                <div className="nav-left no-cursor">
                    {isConnect ? (<><span>{preference.network.networkType}</span></>) :
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
                            <strong>{preference?.currentAccount?.subName}</strong>
                            <p className="cursor-pointer" onClick={() => handleCopy(currentAccount?.address || "")} ><em className="one-line">{formatAddress(currentAccount?.address, 6)}</em><SvgIcon iconName="IconCopy" color="#7F7F7F" offsetStyle={{ marginLeft: '5px' }} /></p>
                            <p className="cursor-pointer" onClick={() => handleCopy(currentAccount?.ethAddress || "")} ><em className="one-line">{formatAddress(currentAccount?.ethAddress, 6)}</em><SvgIcon iconName="IconCopy" color="#7F7F7F" offsetStyle={{ marginLeft: '5px' }} /></p>
                        </div>
                        <SvgIcon className="cursor-pointer" iconName="arrowRight" onClick={() => navigate('/account/switch',
                            { state: { id: preference.currentAccount?.id } })} />
                    </section>
                    <div className="account-balance">
                        <p className="account-text-amount font-Inter-black"><CountUp key={balance} start={0.00} decimal={'.'}
                            decimals={formatDecimal(balance, 8)}
                            end={Number(formatBalance(balance, 8))} duration={0.2} /> KAS</p>
                    </div>
                </div>
                <div className="page-btn">
                    <div className="btn-icon" onClick={() => navigate('/account/receive')}>
                        <SvgIcon iconName="IconReceive" offsetStyle={{ marginRight: '3px' }} color="#171717" />
                        Receive
                    </div>
                    <div className="btn-icon" onClick={() => navigate('/bridge/bridgeIndex', {
                        state: { from: { tick: "KAS", balance, dec: 8 }, evmNetwork }
                    })}>
                        <SvgIcon iconName="IconBridge" offsetStyle={{ marginRight: '3px', width: '26px', height: '26px' }} color="#171717" />
                        Bridge
                    </div>
                    <div className="btn-icon" onClick={() => navigate('/tx/send', {
                        state: { token: { tick: "KAS", balance, dec: 8 } }
                    })}>
                        <SvgIcon iconName="IconSend" offsetStyle={{ marginRight: '3px' }} color="#171717" />
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
                        </div> : ""
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
                            </div> :
                            homeTabValue === 'Activity' ?
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
                                                <div className="history-item" onClick={() => toOpinfo(index)}
                                                    key={index}>
                                                    <div className="history-top">
                                                        <span>{item.op} {item.to ? formatAddress(item.to, 4) : ""}</span>
                                                        <strong
                                                            className={item.opAccept == "1" ? 'history-status' : 'history-status failed'}>{item.opAccept == "1" ? "Success" : "Failed"}</strong>
                                                    </div>
                                                    <div className="history-bottom">
                                                        {
                                                            item.op.toLowerCase() == "deploy" ? (
                                                                <div className="history-left">
                                                                    <em className='history-icon'>+</em>
                                                                    <strong
                                                                        className="history-amount">{item.opAccept == "1" && item.pre ? formatBalance(item.pre, getTickDec(item.tick, item.ca)) : "0"} {item.name}</strong>
                                                                </div>
                                                            ) : (
                                                                <div className="history-left">
                                                                    <em className={item.to !== currentAccount!.address ? 'history-icon sub' : 'history-icon'}>{item.to !== currentAccount!.address ? "-" : "+"}</em>
                                                                    <strong
                                                                        className="history-amount">{formatBalance(item.amt || "0", getTickDec(item.tick, item.ca))} {item.tick || item.name}</strong>
                                                                </div>
                                                            )
                                                        }
                                                        <span className="history-time">{formatDate(item.mtsAdd)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </List>
                                </div> :
                                homeTabValue === 'EVM' ?
                                    evmNetwork && (
                                        <div className="page-list-box">
                                            <div className="flex-row cb ac">
                                                <div className="input-select" onClick={() => navigate('/evm/select')} >
                                                    <span>{evmNetwork.name}</span>
                                                    <DownOutline fontSize={14} />
                                                </div>
                                                <Popover.Menu
                                                    className="account-popover"
                                                    actions={actions}
                                                    mode='dark'
                                                    trigger='click'
                                                    placement='bottom'
                                                    onAction={node => popoverAction(node.key as string)}
                                                >
                                                    <SvgIcon className="cursor-pointer" size={22} iconName="IconMoreVertical" />
                                                </Popover.Menu>
                                            </div>
                                            {evmTokenList.list.map((token, index) => (
                                                <div className="page-list-item" key={index} onClick={() => toTokenInfo(index)}>
                                                    <TokenImg url={token.symbol} name={token.symbol} />
                                                    <div className="list-item-content">
                                                        <strong>{token.symbol}</strong>
                                                        <span className="one-line"> {formatAddress(token.address || token.name)} </span>
                                                    </div>
                                                    <div className="list-item-content text-right">
                                                        <strong>{formatBalanceFixed(token.balance, 4)}</strong>
                                                        <span></span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : ""
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