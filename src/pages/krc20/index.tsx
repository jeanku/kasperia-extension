import React, { useState } from "react"

import { InfiniteScroll, List, Image } from 'antd-mobile'
import { SendOutline } from 'antd-mobile-icons'
import { KaspaExplorerUrl } from '@/types/enum'

import { TokenList } from '@/model/krc20';
import { useNavigate, useLocation } from "react-router-dom";
import { Kiwi, KasplexApi, Modules } from '@kasplex/kiwi-web'

import HeadNav from '@/components/HeadNav'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { SvgIcon } from '@/components/Icon/index'

import { formatBalance, formatDate, formatDecBalance, formatHash, formatAddress } from '@/utils/util'
import IconMint from '@/assets/images/icon-mint.png'
import { useClipboard } from '@/components/useClipboard'

import { Deploy } from "./deploy"
import { DeployConfirm } from "./deployConfirm"
import { DeployResult } from "./deployResult"
import { Mint } from "./mint"
import { MintConfirm } from "./mintConfirm"
import { MintResult } from "./mintResult"
import { OpInfo } from "./opInfo"

import '@/styles/account.scss'

const Index = () => {
    const { state } = useLocation()
    const { noticeError } = useNotice()
    const { handleCopy } = useClipboard()
    const navigate = useNavigate();

    const [token] = useState<TokenList>(state?.token)
    const [address] = useState<string>(state?.address)

    const [currentTabs, setCurrentTabs] = useState(0)

    const [oplist, setOplist] = useState<Array<Modules.OpListData>>([])
    const [opinfo, setOpinfo] = useState<Modules.TokenInfoData>()
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)

    const [prev, setPrev] = useState('')

    async function getOplist() {
        if (loading) return
        setLoading(true)
        KasplexApi.getOpList({ address, tick: (token.tick || token.ca || ""), prev }).then((r: Modules.OpListResponse) => {
            if (r.result) {
                setOplist(oplist.concat(r.result))
                setHasMore(r.result.length !== 0);
                setPrev(r.prev || "")
            }
        }).finally(() => {
            setLoading(false)
        })
    }

    const getTokenInfo = () => {
        if (opinfo) return
        KasplexApi.getToken(token.tick || token.ca || "").then((r: Modules.TokenInfoResponse) => {
            if (r.result.length === 1) {
                setOpinfo(r.result[0])
            }
        })
    }

    const handleTab = (val: number) => {
        if (val == currentTabs) return
        if (val == 1) {
            getTokenInfo()
        }
        setCurrentTabs(val)
    }

    const openKasplexTx = (tx: string) => {
        if(!tx) return
        const networkName = Kiwi.network === 0 ? 'Mainnet' : 'Testnet';
        window.open(`${KaspaExplorerUrl[networkName]}${tx}`);
    }

    const showOpinfo = (index: number) => {
        navigate("/krc20/opinfo", { state: { opinfo: oplist[index], token: token }})
    }

    const sendKrc20 = () => {
        navigate("/tx/send", { state: { token }})
    }

    const krc20Mint = () => {
        if (opinfo && opinfo.state == "finished") {
            noticeError(`${opinfo.tick} state finished`)
        } else {
            navigate("/krc20/mint", { state: { tick: token.tick }})
        }
    }

    return (
        <article className="page-box">
            <HeadNav title={token.name}></HeadNav>
            <div className="page-content assets-details">
                <Image
                    src={`https://krc20-assets.kas.fyi/icons/${token.name}.jpg`}
                    width={54}
                    height={54}
                    lazy={true}
                    placeholder={<SvgIcon iconName="PngCoinDef" size={54} />}
                    fallback={<SvgIcon iconName="PngCoinDef" size={54} />}
                    className="assets-logo"
                    fit='cover'
                    alt={token.name}
                    style={{ borderRadius: '50%' }}
                />
                <div className="assets-amount">{Number(formatBalance(token.balance, token.dec))} {token.name}</div>
                {
                    token.ca ? (
                        <p className="sc-info" onClick={() => handleCopy(token.ca || "")}><em
                            className="one-line">{formatHash(token.ca, 12)}</em>
                            <SvgIcon iconName="IconCopy" color="#7F7F7F" offsetStyle={{marginLeft: '5px'}}/>
                        </p>
                    ) : null
                }
                <div className={token.ca ? 'page-btn page-two-btn' : 'page-btn'}>
                    <div className="btn-def-icon" onClick={() => navigate('/account/receive')}>
                    <SvgIcon key="Receive-fff" size={22} iconName="IconReceive" color="#FFFFFF" offsetStyle={{marginRight: '5px'}} />
                        Receive
                    </div>
                    <div className="btn-def-icon" onClick={() => sendKrc20()} >
                        <SvgIcon key="Send-fff" size={22} iconName="IconSend" color="#FFFFFF" offsetStyle={{marginRight: '5px'}} />
                        Send
                    </div>
                    {
                        !token.ca ? (
                            <div className="btn-icon" onClick={() => krc20Mint()} >
                                <img className="icon-img" src={IconMint} alt="icon-mint" />
                                Mint
                            </div>
                        ) : null
                    }
                </div>
                <div className="assets-info">
                    <ul className="page-tabs mb20">
                        <li className={currentTabs === 0 ? "active" : ""} onClick={() => handleTab(0)}>History</li>
                        <li className={currentTabs === 1 ? "active" : ""} onClick={() => handleTab(1)}>Token info</li>
                    </ul>
                    <div className="history-box">
                        {currentTabs === 0 ? (
                            <>
                                <List>
                                    {oplist.map((item, index) =>
                                    (
                                        <div className="history-item" onClick={() => showOpinfo(index)}>
                                            <div className="history-top">
                                                <span>{item.op} {item.to ? formatAddress(item.to, 4) : ""}</span>
                                                <strong className={item.opAccept === '1' ? 'history-status' : 'history-status failed'}>{item.opAccept === '1' ? "Success" : "Failed"}</strong>
                                            </div>
                                            <div className="history-bottom">
                                                {
                                                    item.op == "deploy" ? (
                                                        item.pre && BigInt(item.pre) > 0 ?
                                                            <div className="history-left">
                                                                <em className={item.to !== address ? 'history-icon sub' : 'history-icon'}>{item.to !== address ? "-" : "+"}</em>
                                                                <strong
                                                                    className="history-amount">{formatBalance(item.pre, token.dec)} {item.tick}</strong>
                                                            </div> :
                                                            <div className="history-left"> -- </div>
                                                    ) : (
                                                        item.amt ?
                                                            <div className="history-left">
                                                                <em className={item.to !== address ? 'history-icon sub' : 'history-icon'}>{item.to !== address ? "-" : "+"}</em>
                                                                <strong className="history-amount">{formatBalance(item.amt, token.dec)} {token.name}</strong>
                                                            </div> :
                                                            <div className="history-left"> -- </div>
                                                    )
                                                }
                                                <span className="history-time">{
                                                    formatDate(item.mtsAdd)
                                                }</span>
                                            </div>
                                        </div>
                                    ))}
                                </List>
                                <InfiniteScroll loadMore={getOplist} hasMore={hasMore} />
                            </>
                        ) : (
                            <>
                                <div className="history-token-item">
                                    <span>Tick</span>
                                    <em>{token.name}</em>
                                </div>
                                <div className="history-token-item">
                                    <span>Decimal</span>
                                    <em>{token.dec}</em>
                                </div>
                                <div className="history-token-item">
                                    <span>State</span>
                                    <em>{opinfo?.state || ""}</em>
                                </div>
                                <div className="history-token-item">
                                    <span>Max supply</span>
                                    <em>{formatDecBalance(opinfo?.max || "", opinfo?.dec || "").toLocaleString()}</em>
                                </div>
                                <div className="history-token-item">
                                    <span>Minted amount</span>
                                    <em>{formatDecBalance(opinfo?.minted || "", opinfo?.dec || "").toLocaleString()}</em>
                                </div>

                                <div className="history-token-item">
                                    <span>Pre-allocation amount</span>
                                    <em>{formatDecBalance(opinfo?.pre || "", opinfo?.dec || "").toLocaleString()}</em>
                                </div>
                                <div className="history-token-item">
                                    <span>Total holders</span>
                                    <em>{BigInt(opinfo?.holderTotal || "").toLocaleString()}</em>
                                </div>
                                <div className="history-token-item">
                                    <span>Total Transfer Times</span>
                                    <em>{BigInt(opinfo?.transferTotal || "").toLocaleString()}</em>
                                </div>
                                <div className="history-token-item">
                                    <span>Total Mint Times</span>
                                    <em>{BigInt(opinfo?.mintTotal || "").toLocaleString()}</em>
                                </div>
                                <div className="history-token-item">
                                    <span>opScoreAdd</span>
                                    <em>{opinfo?.opScoreAdd || ""}</em>
                                </div>
                                <div className="history-token-item">
                                    <span>opScoreMod</span>
                                    <em>{opinfo?.opScoreMod || ""}</em>
                                </div>
                                <div className="history-token-item">
                                    <span>Reveal TX</span>
                                    <em onClick={() => openKasplexTx(opinfo?.hashRev || "")}
                                        className="history-href">{formatHash(opinfo?.hashRev || "", 10, 8)}
                                        <SendOutline className="ml5" /></em>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </article>
    )
}

export {Index, Deploy, DeployConfirm, DeployResult, Mint, MintConfirm, MintResult, OpInfo }