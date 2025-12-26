import React, {useEffect, useState} from "react"
import HeadNav from '@/components/HeadNav'
import { AddressType } from '@/types/enum'
import { Evm } from '@/chrome/evm'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { InfiniteScroll, List, Image, Modal } from 'antd-mobile'
import { useClipboard } from '@/components/useClipboard'
import {
    formatAddress,
    formatUTCToLocal,
    formatHash,
    formatBalance,
    formatBalanceFixed
} from '@/utils/util'
import { SvgIcon } from '@/components/Icon/index'
import { useLocation, useNavigate } from 'react-router-dom'
import '@/styles/account.scss'
import {
    EvmTokenList,
    EvmNetwork,
    TransactionResponse,
    TransactionItem,
    TransactionTokenResponse, TransactionTokenItem
} from "@/model/evm";

import {ethers} from "ethers";
import {Provider} from "@/utils/wallet/provider";
import { HttpClient } from "@/utils/http";
import { KasplexL2MainnetChainId } from "@/types/constant";
import {useSelector} from "react-redux";
import {RootState} from "@/store";


const TokenInfo = () => {
    const { state } = useLocation()
    const navigate = useNavigate();
    const { noticeSuccess, noticeError } = useNotice();
    
    const { handleCopy } = useClipboard()
    const currentAccount = useSelector((state: RootState) => state.preference.preference?.currentAccount);

    const [token, setToken] = useState<EvmTokenList>(state?.token)
    const [network] = useState<EvmNetwork>(state?.network)

    const [currentTab, setCurrentTab] = useState(-1)
    const [datalist, setDatalist] = useState<Array<TransactionItem>>([])
    const [dataTokenList, setDataTokenList] = useState<Array<TransactionTokenItem>>([])
    const [isToken, setIsToken] = useState<boolean>(false)

    const [nextPageParams, setNextPageParams] = useState<Record<string, any>>({})
    const [hasMore, setHasMore] = useState(true)
    let isFetching = false

    const handleTab = (val: number) => {
        if (val == currentTab) return
        if (val == 1) {
            if (ethers.isAddress(token.address)) {
                setIsToken(true)
                fetchTokenTxLists()
            } else {
                fetchTxLists()
            }
        }
        setCurrentTab(val)
    }

    const fetchTxLists = async () => {
        if (!network.explorer || isFetching) return
        isFetching = true
        let domain = network.explorer
        if (network.chainId == KasplexL2MainnetChainId.toString()) {
            domain = "https://api-explorer.kasplex.org"
        }
        let url = `${domain}/api/v2/addresses/${currentAccount?.ethAddress!}/transactions`
        let resp = await new HttpClient().get<TransactionResponse>(url, nextPageParams)
        setHasMore(!!resp.next_page_params)
        if (resp.items.length > 0) {
            let temp = resp.items
            if (nextPageParams.size > 0) {
                setDatalist([...datalist, ...temp])
            } else {
                setDatalist(temp)
            }
        }
        isFetching = false
    }

    const fetchTokenTxLists = async () => {
        if (!network.explorer || isFetching) return
        isFetching = true
        let domain = network.explorer
        if (network.chainId == KasplexL2MainnetChainId.toString()) {
            domain = "https://api-explorer.kasplex.org"
        }
        let url = `${domain}/api/v2/addresses/${currentAccount?.ethAddress!}/token-transfers`
        let resp = await new HttpClient().get<TransactionTokenResponse>(url, {...nextPageParams, token: token.address})
        setHasMore(!!resp.next_page_params)
        if (resp.items.length > 0) {
            if (nextPageParams.size > 0) {
                setDataTokenList([...dataTokenList, ...resp.items])
            } else {
                setDataTokenList(resp.items)
            }
        }
        isFetching = false
    }

    const setTokenInfo = <K extends keyof EvmTokenList>(key: K, value: EvmTokenList[K]) => {
        setToken((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchBalance = async () => {
        let provider = new Provider(network.rpcUrl[0], Number(network.chainId))
        let balance = ""
        if (ethers.isAddress(token.address)) {
            balance = await provider.getTokenBalance(currentAccount?.ethAddress!, token.address)
        } else {
            balance = await provider.getBalance(currentAccount?.ethAddress!)
        }
        if (balance != token.balance) {
            setTokenInfo("balance", ethers.formatUnits(balance, network.decimals))
        }
    }

    const openTxExplorer = (hash: string) => {
        if(!hash || !network.explorer) return
        window.open(`${network.explorer}/tx/${hash}`);
    }

    const delToken = async () => {
        try {
            console.log("token.address", token.address)
            await Evm.removeContract(network.chainId, token.address)
            noticeSuccess(`Delete ${token.name} successfully`)
            navigate("/home")
        } catch (error) {
            noticeError(error)
        }
    }

    useEffect(() => {
        handleTab(0)
        fetchBalance()
    }, [currentAccount])

    return (
        <article className="page-box">
            <HeadNav title={token.name}></HeadNav>
            <div className="page-content assets-details">
                <Image
                    src={`https://krc20-assets.kas.fyi/icons/${token.symbol}.jpg`}
                    width={54}
                    height={54}
                    lazy={true}
                    placeholder={<SvgIcon iconName="PngCoinDef" size={54} />}
                    fallback={<SvgIcon iconName="PngCoinDef" size={54} />}
                    className="assets-logo"
                    fit='cover'
                    alt={token.symbol}
                    style={{ borderRadius: '50%' }}
                />

                <div className="assets-amount">{formatBalanceFixed(token.balance || "0")} {token.symbol}</div>

                <div className='page-btn page-two-btn'>
                    <div className="btn-def-icon" onClick={() => navigate('/account/receive', { state: { type: AddressType.EvmAddress } })}>
                        <SvgIcon key="Receive-fff" size={22} iconName="IconReceive" color="#FFFFFF" offsetStyle={{marginRight: '5px'}} />
                        Receive
                    </div>
                    <div className="btn-def-icon" onClick={() => navigate("/evm/sendkas", { state: { token: token, network: network }} )} >
                        <SvgIcon key="Send-fff" size={22} iconName="IconSend" color="#FFFFFF" offsetStyle={{marginRight: '5px'}} />
                        Send
                    </div>
                </div>

                <div className="assets-info">
                    <ul className="page-tabs mb20">
                        <li className={currentTab === 0 ? "active" : ""} onClick={() => handleTab(0)}>Token info</li>
                        <li className={currentTab === 1 ? "active" : ""} onClick={() => handleTab(1)}>History</li>
                        <SvgIcon className="remove-icon-right cursor-pointer" size={22} iconName="IconDel" onClick={() =>
                            Modal.alert({
                                title: 'Message',
                                bodyClassName: 'modal-alert-body',
                                content: 'If you delete this token, you need to add it again to view your assets in it',
                                showCloseButton: true,
                                confirmText: "Delete",
                                onConfirm: async () => {
                                    delToken()
                                },
                            })
                        }  />
                    </ul>
                    <div className="history-box">
                        {currentTab === 1 ? (
                            <>
                                <List>
                                    {!isToken && datalist.map((item) =>
                                        (
                                            <div className="history-item" onClick={() => {}}>
                                                <div className="history-top">
                                                    <span className="history-href">
                                                        <em onClick={() => openTxExplorer(item.hash)}
                                                            className="history-href">{formatHash(item.hash)}
                                                            <SvgIcon color="#74E6D8" offsetStyle={{marginRight: '6px'}} iconName="IconShare" /></em>
                                                        </span>
                                                    <strong className='history-status'>{item.transaction_types[0] || ""}</strong>
                                                </div>
                                                <div className="history-bottom">
                                                    <div className="history-left">
                                                        <em className={item.from.hash === currentAccount?.ethAddress! ? 'history-icon sub' : 'history-icon'}>{item.from.hash === currentAccount?.ethAddress! ? "-" : "+"}</em>
                                                        <strong
                                                            className="history-amount">{ ethers.formatEther(item.value) } { token.symbol }</strong>
                                                    </div>
                                                    <span className="history-time">{ formatUTCToLocal(item.timestamp) }</span>
                                                </div>
                                            </div>
                                        ))}
                                    {isToken && dataTokenList.map((item) =>
                                        (
                                            <div className="history-item" onClick={() => {}}>
                                                <div className="history-top">
                                                    <span className="history-href" >
                                                        <em onClick={() => openTxExplorer(item.transaction_hash)}
                                                            className="history-href">{formatHash(item.transaction_hash)}
                                                            <SvgIcon color="#74E6D8" offsetStyle={{marginRight: '6px'}} iconName="IconShare" /></em>
                                                        </span>
                                                    <strong className='history-status'></strong>
                                                </div>
                                                <div className="history-bottom">
                                                <div className="history-left">
                                                    <em className={item.from.hash === currentAccount?.ethAddress! ? 'history-icon sub' : 'history-icon'}>{item.from.hash === currentAccount?.ethAddress! ? "-" : "+"}</em>
                                                        <strong
                                                            className="history-amount">{ formatBalance(item.total?.value!, item.total?.decimals ? Number(item.total?.decimals) : 18) } { item.token?.symbol }</strong>
                                                    </div>
                                                    <span className="history-time">{ formatUTCToLocal(item.timestamp) }</span>
                                                </div>
                                            </div>
                                        ))}
                                </List>
                                <InfiniteScroll loadMore={ isToken ? fetchTokenTxLists : fetchTxLists } hasMore={hasMore} />
                            </>
                        ) : (
                            <>
                                <div className="history-token-item">
                                    <span>Chain</span>
                                    <em>{network.name}</em>
                                </div>
                                {
                                    ethers.isAddress(token.address) && (
                                        <>
                                            <div className="history-token-item">
                                                <span>Token Name</span>
                                                <em>{token.name}</em>
                                            </div>
                                            <div className="history-token-item">
                                                <span>Contract Address</span>
                                                <em onClick={() => handleCopy(token.address)}>{formatAddress(token.address)}
                                                    <SvgIcon iconName="IconCopy" offsetStyle={{marginLeft: '5px', marginRight: '-12px'}}/></em>
                                            </div>
                                        </>
                                    )
                                }
                                <div className="history-token-item">
                                    <span>Token</span>
                                    <em>{token.symbol}</em>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </article>
    )
}

export default TokenInfo