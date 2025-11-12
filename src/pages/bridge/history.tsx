import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { List, InfiniteScroll, DotLoading, Tag } from 'antd-mobile'
import { SendOutline } from 'antd-mobile-icons'

import HeadNav from '@/components/HeadNav'
import NoDataDom from "@/components/NoDataDom";

import { RootState } from '@/store';
import {NetworkType} from "@/utils/wallet/consensus";
import { useSelector } from "react-redux";
import { formatAddress, convertUTCToLocalTime, formatBalance } from '@/utils/util'
import { KaspaExplorerUrl, EvmExplorerUrl } from '@/types/enum'
import { getKaspaList, getKlayerList, type OrderListItem } from '@/api/index'

const History = () => {
    const navigate = useNavigate();
    const { preference } = useSelector((state: RootState) => state.preference);

    const [selectTab, setSelectTab] = useState('L1')
    const [nextPage, setNextPage] = useState<number>(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(false);
    const [listData, setListData] = useState<OrderListItem[]>([]);
    const pageSize = 10
    const lastRequestTimeRef = useRef<number>(0)
    const l1Address = preference.currentAccount?.address;
    const l2Address = preference.currentAccount?.ethAddress;
    const networkName = preference.network.networkType === NetworkType.Mainnet ? 'Mainnet' : 'Testnet';

    const TabsList = [
        { title: 'L1→L2 History', key: 'L1' },
        { title: 'L2→L1 History', key: 'L2' },
    ]

    useEffect(() => {
        fetchList(1, selectTab)
    }, [])

    const openExplorer = (type: 'kaspa' | 'evm', id: string) => {
        if (!id) return
        const url = type === 'kaspa'
            ? `${KaspaExplorerUrl[networkName]}${id}`
            : `${EvmExplorerUrl[networkName]}${id}`
        window.open(url)
    }

    const fetchList = async (page: number, tab: string) => {
        const now = Date.now()
        if (now - lastRequestTimeRef.current < 1200) {
            return
        }
        lastRequestTimeRef.current = now

        const isL1 = tab === 'L1'
        const address = isL1 ? l1Address : l2Address
        if (!address) return
        setIsLoading(true);
        try {
            const apiFunc = isL1 ? getKaspaList : getKlayerList
            const list = await apiFunc(networkName, { page, address: address.toLowerCase() })
            if(list && list.length > 0) {
                const formList = list.map(item => transformRecord(item, isL1))
                setListData(page === 1 ? formList : prev => [...prev, ...formList])
                setHasMore(formList.length >= pageSize)
                if (formList.length >= pageSize) setNextPage(page + 1)
            } else {
                setNextPage(1)
                setHasMore(false)
            }
        } catch (err) {
            console.error('fetchList error:', err)
        } finally {
            setIsLoading(false); 
        }
    }

    const transformRecord = (item: OrderListItem, isL1: boolean) => {
        const i: OrderListItem = { ...item };
        if (isL1) {
            i.amountSent = formatBalance(i.amount, 8).toString();
            i.bridgeAmount = isNaN(Number(i.bridge_amount))  || !i.bridge_amount ? "-" : formatBalance(i.bridge_amount, 18).toString();
            i.state = i.hash ? 'Successful' : 'Pending'
        } else {
            i.amountSent = formatBalance(i.amount, 18).toString();
            i.bridgeAmount = isNaN(Number(i.bridge_amount)) || !i.bridge_amount ? "-" : formatBalance(i.bridge_amount, 8).toString();
            i.from_address = i.from ?? i.from_address;
            i.state = i.txid ? 'Successful' : 'Pending'
        }
        return i as OrderListItem;
    }

    const handleTabs = (key: string) => {
        if (selectTab === key) return
        setSelectTab(key)
        setNextPage(1)
        setListData([])
        setHasMore(true)
        fetchList(1, key)
    }
    const loadMore = async () => {
        if (hasMore && !isLoading) fetchList(nextPage, selectTab)
    }

    return (
        <div className="page-box">
            <HeadNav title='Bridge-History' onBack={() => navigate('/bridge/bridgeIndex')} ></HeadNav>
            <div className="content-main history-box">
                <ul className="page-tabs tabs-fixed">
                    {
                        TabsList.map(item => (
                            <li key={item.key} className={selectTab === item.key ? 'active' : ''}
                                onClick={() => handleTabs(item.key)}>{item.title}</li>
                        ))
                    }
                </ul>
                <List className='mt35'>
                    {
                        listData.length ? listData.map(item => (
                            <div className="history-item k-card" key={item.id}>
                                <div className="history-top hash-line">
                                    {
                                        selectTab === 'L1' ? <span className='share' onClick={() => openExplorer('kaspa',item.txid)}>Txid: {formatAddress(item.txid, 6)} <SendOutline /></span> 
                                        : <span className='share' onClick={() => openExplorer('evm',item.hash)}>Hash: {formatAddress(item.hash, 6)} <SendOutline /></span>
                                    }
                                    <Tag color={item.state === 'Successful' ? 'success' : 'warning' } className={item.state === 'Successful' ? 'success' : 'pending' }>{ item.state }</Tag> 
                                </div>
                                <div className="history-top mt8">
                                    <em>From: </em>
                                    <span>{formatAddress(item.from_address, 6)}</span>
                                </div>
                                {
                                    selectTab === 'L1' ? <div className="history-top mt8">
                                        <em>To: </em>
                                        <span>{formatAddress(item.to_eth_address, 6)}</span>
                                    </div> : <div className="history-top mt8">
                                        <em>To: </em>
                                        <span>{formatAddress(item.to_kaspa_address, 6)}</span>
                                    </div>
                                }
                                <div className="history-top mt8">
                                    <em>Amount: </em>
                                    <span>{item.amountSent}</span>
                                </div>
                                <div className="history-top mt8">
                                    <em>Received: </em>
                                    <span>{item.bridgeAmount}</span>
                                </div>
                                <div className="history-top mt8">
                                    <em>Time:</em>
                                    <span>{ convertUTCToLocalTime(item.create_time) }</span>
                                </div>
                            </div>
                        )) : ((
                        !hasMore && <div className="contact-list mt60">
                            <NoDataDom />
                        </div>
                    ))
                    }
                </List>
            </div>
            <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
                {hasMore ? (
                    <>
                        <span>Loading</span>
                        <DotLoading />
                    </>
                ) :  listData.length > 0 && ( <span>- No More -</span>)
                }
            </InfiniteScroll>
        </div>
    )
}

export default History;