import { useEffect, useState, useMemo } from "react"
import { Button, DotLoading } from "antd-mobile";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Evm } from '@/chrome/evm'
import { EvmNetwork, EvmTokenList } from '@/model/evm'
import { RootState } from '@/store';
import { ethers } from 'ethers';

import HeadNav from '@/components/HeadNav'
import TokenImg from "@/components/TokenImg";
import NoDataDom from '@/components/NoDataDom'
import { SvgIcon } from '@/components/Icon/index'
import { useNotice } from '@/components/NoticeBar/NoticeBar'

import { getTokenBalanceByAddress } from '@/api/index'
import { ApiChainId } from '@/types/constant'
import { formatBalanceFixed, formatAddress } from "@/utils/util"


const ApiTokenList: React.FC = () => {
    const { noticeSuccess } = useNotice();
    const navigate = useNavigate();

    const { preference } = useSelector((state: RootState) => state.preference);
    const [evmNetwork, setEvmNetwork] = useState<EvmNetwork | undefined>(undefined);
    const [tokenList, setTokenList] = useState<EvmTokenList[]>([])
    const [oldTokenList, setOldTokenList] = useState<EvmTokenList[]>([])

    const [chainId, setChainId] = useState<string>("")

    const [btnLoading, setBtnLoading] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)


    const btnDisabled = useMemo(() => {
        if (!tokenList?.length) return false
    }, [tokenList])

    const normalizeLocalTokens = (list: EvmTokenList[] = []) => {
        return list.filter(token => token.address).map(token => ({
            ...token,
            isSelected: true
        }))
    }

    const normalizeApiTokens = (list: any[]): EvmTokenList[] => {
        const filterList = list.filter(item =>
            item?.token?.symbol &&
            item.token.symbol !== 'null' &&
            item?.token?.decimals &&
            item.token.decimals !== 'null'
        )
        return filterList.map(item => {
            const { address, decimals, name, symbol } = item.token
            return {
                address,
                decimals: Number(decimals),
                name,
                symbol,
                balance: formatBalanceFixed(ethers.formatUnits(item.value, Number(decimals))),
                native: false,
                isSelected: false
            }
        })
    }

    const mergeTokens = (local: EvmTokenList[], api: EvmTokenList[]) => {
        const map = new Map<string, EvmTokenList>()
        for (const token of [...local, ...api]) {
            const key = token.address.toLowerCase()
            if (!map.has(key)) {
                map.set(key, token)
            }
        }
        return Array.from(map.values())
    }

    const getTokenListByApi = async (chainId: string) => {
        const address = preference.currentAccount?.ethAddress
        if (!address) return []

        const localTokens = normalizeLocalTokens(
            preference?.evmTokenList?.[chainId] || []
        )
        const apiResult = await getTokenBalanceByAddress(chainId, { address })
        const apiTokens = apiResult?.length ? normalizeApiTokens(apiResult) : []
        setOldTokenList(localTokens)
        return mergeTokens(localTokens, apiTokens)
    }

    const getFromChain = async () => {
        setLoading(true)
        try {
            let network = evmNetwork || await Evm.getSelectedNetwork()
            if (!network) return
            if (!evmNetwork) {
                setEvmNetwork(network)
            }
            const { chainId } = network
            if (!ApiChainId.includes(Number(chainId))) return
            setChainId(chainId)
            const tokens = await getTokenListByApi(chainId)
            setTokenList(tokens)
        } finally {
            setLoading(false)
        }
    }

    const setSelectTokenList = (address: string) => {
        setTokenList(list => list.map(token => token.address === address ? { ...token, isSelected: !token.isSelected } : token))
    }

    const submit = async () => {
        if (btnLoading) return
        setBtnLoading(true)
        try {
            const oldSet = new Set(oldTokenList.map(item => item.address.toLowerCase()))
            const newSelected = tokenList.filter(item => item.isSelected).map(item => item.address.toLowerCase())
            const newSet = new Set(newSelected)

            const addList = tokenList.filter(item => item.isSelected && !oldSet.has(item.address.toLowerCase()))
            const removeList = oldTokenList.filter(item => !newSet.has(item.address.toLowerCase()))
            for (const item of addList) {
                await Evm.addContract(chainId, item)
            }
            for (const item of removeList) {
                await Evm.removeContract(chainId, item.address)
            }
            if (addList.length || removeList.length) {
                noticeSuccess('Token updated successfully')
                setTimeout(() => {
                    navigate('/home')
                }, 720);
            }
        } finally {
            setBtnLoading(false)
        }
    }

    useEffect(() => {
        getFromChain()
    }, [])

    return (
        <>
            <div className="page-box">
                <HeadNav title="Token List"></HeadNav>
                <div className="content-main pb60">
                    {
                        loading ? <div className="page-list"> <div className="list-loading">
                            Loading<DotLoading />
                        </div></div> :
                            tokenList && tokenList.length ? tokenList.map(item => {
                                return (
                                    <div className="coin-item" onClick={() => setSelectTokenList(item.address)}>
                                        <TokenImg url={item.symbol} name={item.symbol} marginRight="8" />
                                        <div className="coin-item-info">
                                            <div className="coin-item-name">
                                                <span>{item.symbol}</span>
                                                <em className="coin-item-balance">{ item.balance }</em>
                                            </div>
                                            <div className="coin-item-address">
                                                <em>{formatAddress(item.address)}</em>
                                            </div>
                                        </div>
                                        <div className="coin-item-right">
                                            <SvgIcon size={24} iconName={item.isSelected ? 'IconCheckSelect' : 'IconCheck'} color="#74E6D8" />
                                        </div>
                                    </div>
                                )
                            }) : <NoDataDom imgStyle={{ width: ' 100px', marginLeft: '20px' }} />
                    }
                    <div className="btn-pos-two flexd-row post-bottom">
                        <Button block size="large" color="primary" disabled={btnDisabled} loading={btnLoading} onClick={() => submit()}>
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ApiTokenList;