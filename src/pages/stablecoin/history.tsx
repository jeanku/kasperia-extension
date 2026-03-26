import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { List, InfiniteScroll, DotLoading, Tag } from 'antd-mobile'
import { SendOutline } from 'antd-mobile-icons'

import HeadNav from '@/components/HeadNav'
import NoDataDom from "@/components/NoDataDom";

import { RootState } from '@/store';
import { NetworkType } from "@/utils/wallet/consensus";
import { useSelector } from "react-redux";
import { formatAddress, convertUTCToLocalTime, formatBalance, formatBigInt, truncateDecimal, getStatus } from '@/utils/util'
import { ChainListMainnet, ChainListTestnet, StableCoinTestnetTokenList } from '@/types/constant'
import { getDepositList, getWithdrawList, type StablecoinItem } from '@/api/index'

const History = () => {
    const navigate = useNavigate();
    const { state } = useLocation()
    const { preference } = useSelector((state: RootState) => state.preference);
    const { chainId = '' } = state
    const [selectTab, setSelectTab] = useState('')
    const [nextPage, setNextPage] = useState<number>(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(false);
    const [listData, setListData] = useState<StablecoinItem[]>([]);
    const pageSize = 10
    const TokenList = StableCoinTestnetTokenList
    const ChainList = ChainListTestnet

    const lastRequestTimeRef = useRef<number>(0)
    const currentAddress = preference.currentAccount?.ethAddress!;
    const isMainnet = preference.network.networkType === NetworkType.Mainnet;
    const networkName = isMainnet ? 'Mainnet' : 'Testnet';

    const TabsList = useMemo(() => ChainList.map(item => ({
            title: item.name,
            key: item.chainId.toString()
    })), [ChainList]);


    const openExplorer = (hash: string) => {
        if (!hash) return
        const chain = ChainList.find(item => item.chainId === Number(selectTab));
        if (!chain?.blockExplorerUrl) return;
        window.open(`${chain.blockExplorerUrl}/tx/${hash}`);
    }

    const transformRecord = useCallback((item: StablecoinItem, isWithdraw: boolean) => {
        const decimal = 4;
        const tokenData = TokenList.find((t) => t.token.toLowerCase() === item.tokenAddress.toLowerCase() );
        const dec = tokenData?.decimals || item.decimal;
        const statusNum = Number(item.status);
        const explorerUrl = ChainList.find((c) => c.chainId === item.fromNetwork)?.blockExplorerUrl || "";
        const format = (val: bigint | string | number, d: number) => truncateDecimal(Number(formatBigInt(BigInt(val), d)), decimal);
        return {
            ...item,
            explorerUrl,
            amount: `${format(item.amount, item.decimal || dec)} ${item.token}`,
            bridgeAmount: `${format(item.bridgeAmount, item.to_decimal)} ${item.token}`,
            showFee: item.fee ? format(item.fee, dec).toString() : "-",
            fee: formatBalance(item.fee, dec).toString(),
            showTime: convertUTCToLocalTime(item.createTime),
            statusStr: getStatus(statusNum, item.claimHash),
        } as StablecoinItem;
    }, [TokenList, ChainList]);

    const fetchList = useCallback(async (page: number, key: string) => {
        const now = Date.now()
        if (now - lastRequestTimeRef.current < 1000) return
        lastRequestTimeRef.current = now
        if (!currentAddress) return
        setIsLoading(true);
        try {
            const chain = ChainList.find(item => item.chainId === Number(key));
            if (!chain) return;

            const isWithdraw = chain.name.toLowerCase().includes('kasplex');
            const apiFunc = isWithdraw ? getWithdrawList : getDepositList;
            const list = await apiFunc(networkName, {
                page,
                address: currentAddress.toLowerCase(),
                network: chainId
            });
            if (!list || list.length === 0) {
                setHasMore(false);
                if (page === 1) setListData([]);
                return;
            }
            const formatted = list.map(item => transformRecord(item, isWithdraw));
            setListData(prev => page === 1 ? formatted : [...prev, ...formatted]);
            const more = formatted.length >= pageSize;
            setHasMore(more);
            if (more) setNextPage(page + 1);
        } finally {
            setIsLoading(false);
        }
    }, [currentAddress, networkName, chainId, ChainList, transformRecord])

    const handleTabs = (key: string) => {
        if (selectTab === key) return
        setSelectTab(key)
        setNextPage(1)
        setListData([])
        fetchList(1, key)
    }
    const loadMore = async () => {
        if (!hasMore || isLoading || !selectTab) return;
        await fetchList(nextPage, selectTab);
    };

    useEffect(() => {
        if (!TabsList.length) return;
        const key = TabsList[0].key;
        setSelectTab(key);
        fetchList(1, key);
    }, [TabsList, fetchList]);

    return (
        <div className="page-box">
            <HeadNav title='Bridge History' onBack={() => navigate('/stableCoin/stableCoin')} ></HeadNav>
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
                                        <span className='share' onClick={() => openExplorer(item.hash)}>Hash: {formatAddress(item.hash, 6)} <SendOutline /></span>
                                    }
                                    <Tag color={item.statusStr === 'Successful' ? 'success' : 'warning'}>{item.statusStr}</Tag>
                                </div>
                                <div className="history-top mt8">
                                    <em>From: </em>
                                    <span>{formatAddress(item.fromAddress, 6)}</span>
                                </div>
                                {
                                    <div className="history-top mt8">
                                        <em>To: </em>
                                        <span>{formatAddress(item.toAddress, 6)}</span>
                                    </div>
                                }
                                <div className="history-top mt8">
                                    <em>Amount: </em>
                                    <span>{item.amount}</span>
                                </div>
                                <div className="history-top mt8">
                                    <em>Net Received: </em>
                                    <span>{item.bridgeAmount}</span>
                                </div>
                                <div className="history-top mt8">
                                    <em>Time:</em>
                                    <span>{item.showTime}</span>
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
                ) : listData.length > 0 && (<span>- No More -</span>)
                }
            </InfiniteScroll>
        </div>
    )
}

export default History;