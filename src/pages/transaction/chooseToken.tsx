import React, { useState, useMemo, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { SearchBar, Image } from 'antd-mobile'
import { useNavigate } from "react-router-dom";
import { RootState } from '@/store';
import { useSelector } from "react-redux";
import { KasplexApi } from '@kasplex/kiwi-web'
import { formatBalance, formatHash } from '@/utils/util';
import { TokenList } from '@/model/krc20';
import { SvgIcon } from '@/components/Icon/index'

const ChooseToken = () => {

    const navigate = useNavigate();

    const preference = useSelector((state: RootState) => state.preference.preference);

    const rpcClient = useSelector((state: RootState) => state.rpc.client);
    const [kasdata, setKasdata] = useState<Array<TokenList>>([{
        ca: '',
        locked: '',
        tick: 'KAS',
        name: 'KAS',
        balance: preference?.currentAccount?.balance || "0",
        dec: '8'
    }]);

    const [tokenList, setTokenList] = useState<Array<TokenList>>(preference?.krc20TokenList || []);

    const fetchTokenList = async () => {
        KasplexApi.getAddressTokenList(preference?.currentAccount?.address || "").then((r: any) => {
            let token = r.result.map((r: TokenList) => {
                return {
                    balance: r.balance,
                    tick: r.tick,
                    dec: r.dec
                }
            })
            setTokenList(token)
        });
    };

    useEffect(() => {
        // if (!preference) return;
        // const fetchBalance = async () => {
        //     if (!rpcClient) return;
        //     try {
        //         const res = await rpcClient.getBalanceByAddress({ address: preference.currentAccount!.address });
        //         if (kasdata[0].balance != res.balance.toString()) {
        //             kasdata[0].balance = res.balance.toString()
        //             setKasdata(kasdata)
        //         }
        //     } catch (err) {
        //         console.error("Failed to fetch balance:", err);
        //     }
        // };
        // fetchBalance();
        // fetchTokenList();
        console.log("preference?.krc20TokenList", preference?.krc20TokenList)
    }, [preference]);

    const [filteredValue, setfilteredValue] = useState('');

    const filteredTokenList = useMemo(() => {
        const keyword = filteredValue.toLowerCase();
        return tokenList.filter(token => token.name.toLowerCase().includes(keyword));
    }, [tokenList, filteredValue]);

    const filteredKasList = useMemo(() => {
        const keyword = filteredValue.toLowerCase();
        return kasdata.filter(token => token.name.toLowerCase().includes(keyword));
    }, [kasdata, filteredValue]);

    const selectToken = (token: TokenList) => {
        navigate('/tx/send', { replace: true, state: { token }});
    };
    
    return (
        <article className="page-box">
            <HeadNav title='Choose Asset' ></HeadNav>
            <div className="content-main choose-token">
                <div className="search-box mb20">
                    <SearchBar placeholder='Search...' onChange={setfilteredValue} icon={<SvgIcon iconName="IconSearch" offsetStyle={{marginRight: '2px'}}/>} />
                </div>
                {
                    filteredKasList.map(item => {
                        return (
                            <div className="coin-item mb12" key={item.tick}>
                                <Image src={`https://krc20-assets.kas.fyi/icons/${item.tick}.jpg`} 
                                    width={44} height={44} 
                                    placeholder={<SvgIcon iconName="PngCoinDef" size={44} />}
                                    fallback={<SvgIcon iconName="PngCoinDef" size={44} />}
                                    style={{ borderRadius: '50%', marginRight: '12px' }} lazy fit='cover' />
                                <div className="coin-item-info" onClick={() => selectToken(item)}>
                                    <div className="coin-item-name">
                                        <span>{item.tick}</span>
                                        <span>{formatBalance(item.balance, item.dec)}</span>
                                    </div>
                                    <div className="coin-item-price">
                                        <em>kaspa</em>
                                        <em>-</em>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
                {
                    filteredTokenList.map(item => {
                        return (
                            <div className="coin-item mb12" key={item.tick}>
                                <Image src={`https://krc20-assets.kas.fyi/icons/${item.tick}.jpg`} 
                                    width={44} height={44} 
                                    placeholder={<SvgIcon iconName="PngCoinDef" size={44} />}
                                    fallback={<SvgIcon iconName="PngCoinDef" size={44} />}
                                    style={{ borderRadius: '50%', marginRight: '12px' }} fit='cover' />
                                <div className="coin-item-info" onClick={() => selectToken(item)}>
                                    <div className="coin-item-name">
                                        <span>{item.name}</span>
                                        <span>{formatBalance(item.balance, item.dec)}</span>
                                    </div>
                                    <div className="coin-item-price">
                                        <em>krc20</em>
                                        <em>{item.ca ? "SC:" + formatHash(item.ca, 8) : "-"}</em>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </article>
    )
}

export { ChooseToken }