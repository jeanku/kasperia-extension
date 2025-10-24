import {useEffect, useState} from "react"
import { Evm } from '@/chrome/evm'
import { EvmNetwork } from '@/model/evm'
import HeadNav from '@/components/HeadNav'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { Button, Input, } from "antd-mobile";
import { isValidUrl } from '@/utils/util'
import {NetworkType} from "@/utils/wallet/consensus";
import {Session} from "@/types/type";
import {Notification} from "@/chrome/notification";

interface networkData {
    network: NetworkType,
    chainParams: EvmNetwork,
}

interface RequestParam {
    data: networkData
    session: Session
}

const AddEthereumChain = () => {
    const { noticeError } = useNotice();

    const [saveLoading, setSaveLoading] = useState(false)
    const [chain, setChain] = useState<EvmNetwork>({
        name: "",
        rpcUrl: [],
        chainId: "",
        symbol: "",
        explorer: "",
        decimals: 18
    })

    const seChainInfo = <K extends keyof EvmNetwork>(key: K, value: EvmNetwork[K]) => {
        setChain((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const saveNetwork = async () => {
        try {
            validate()
            setSaveLoading(true)
            await Evm.addNetwork(chain)
            setSaveLoading(false)
        } catch (error) {
            noticeError(error)
        }
        Notification.resolveApproval()
    }

    const validate = () => {
        if (!chain.name.trim()) throw Error("Please enter a network name")
        if (chain.rpcUrl.length <= 0) throw Error("Please enter a rpc url")
        if (!isValidUrl(chain.rpcUrl[0])) throw Error(`Invalid rpc url`)
        if (!chain.chainId) throw Error(`Please enter a chain id`)
        if (!chain.symbol) throw Error(`Please enter a symbol`)
        if (chain.explorer && !isValidUrl(chain.explorer)) throw Error(`Invalid explorer url`)
    }

    const reject = () => {
        Notification.rejectApproval()
    }

    const getApproval = async () => {
        let approval: RequestParam = await Notification.getApproval()
        setChain(approval.data.chainParams)
    }

    useEffect(() => {
        getApproval()
    }, [])

    return (
        <article className="page-box">
            <HeadNav showLeft={false} title="Add Chain"></HeadNav>
            <div className="content-main pb96">
                <p className="tip-message mesage-bg">
                    Kasperia cannot verify the security of customnetworks.Please add trusted networks only.
                </p>
                <div className="change-pwd">
                    <h6 className="sub-tit">Network name</h6>
                    <div className="input-box mb12">
                        <Input
                            value={chain.name}
                            maxLength={16}
                            onChange={val => {
                                seChainInfo("name", val)
                            }}
                            type="text"
                        />
                    </div>
                    <h6 className="sub-tit">RPC URL</h6>
                    <div className="input-box mb12">
                        <Input
                            value={chain.rpcUrl[0]}
                            onChange={val => {
                                seChainInfo("rpcUrl", [val])
                            }}
                            type="text"
                        />
                    </div>
                    <h6 className="sub-tit">Chain Id</h6>
                    <div className="input-box mb12">
                        <Input
                            value={chain.chainId}
                            onChange={val => {
                                seChainInfo("chainId", val)
                            }}
                            type="text"
                        />
                    </div>
                    <h6 className="sub-tit">Currency symbol</h6>
                    <div className="input-box mb12">
                        <Input
                            maxLength={8}
                            value={chain.symbol}
                            onChange={val => {
                                seChainInfo('symbol', val)
                            }}
                            type="text"
                        />
                    </div>
                    <h6 className="sub-tit">Decimals(option)</h6>
                    <div className="input-box mb12">
                        <Input
                            value={chain.decimals.toString()}
                            onChange={val => {
                                seChainInfo('decimals', Number(val))
                            }}
                            type="text"
                        />
                    </div>

                    <h6 className="sub-tit">Block explorer URL(option)</h6>
                    <div className="input-box mb12">
                        <Input
                            value={chain.explorer}
                            onChange={val => {
                                seChainInfo('explorer', val)
                            }}
                            type="text"
                        />
                    </div>
                    <div className="btn-pos-two flexd-row post-bottom">
                        <Button block size="large" onClick={() => reject()}>
                            Cancel
                        </Button>
                        <Button block size="large" loading={saveLoading} loadingText="Save..." color="primary" onClick={saveNetwork}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    )
}
export {AddEthereumChain}