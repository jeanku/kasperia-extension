import { useEffect, useState } from "react"
import { Evm } from '@/chrome/evm'
import { EvmNetwork } from '@/model/evm'
import HeadNav from '@/components/HeadNav'
import TokenImg from "@/components/TokenImg";
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import {useNavigate} from "react-router-dom";


const SelectNetwork = () => {
    const { noticeError } = useNotice();
    const navigate = useNavigate();

    const [networkList, setNetworkList] = useState<EvmNetwork[]>([])

    useEffect(() => {
        getNetWorkList()
    }, [])

    const getNetWorkList = async () => {
        let networks = await Evm.getNetworks()
        setNetworkList(networks)
    }

    const switchNetwork = async (index: number) => {
        try {
            let network = networkList[index]
            if (!network) {
                throw Error("network index invalid")
            }
            await Evm.setSelectedNetwork(network.chainId)
            navigate( "/home", { state: {tab: "EVM"} })
        } catch (error) {
            noticeError(error)
        }
    }

    return (
        <article className="page-box">
            <HeadNav title="Custom Network"></HeadNav>
            <div className="content-main">
                {
                    networkList.length > 0 && (
                        networkList.map((item, index) => (
                            <div className={item.select ? "selected coin-item" : "coin-item"} onClick={() => switchNetwork(index)}>
                                <TokenImg url={item.chainId} name={ item.name } urlPath="chains" showDefault={ false } />
                                <div className="coin-item-info">
                                    <div className="coin-item-name">
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="coin-item-network">
                                        <em>Currency: {item.symbol}</em>
                                        <em>ID: {item.chainId}</em>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                }
            </div>
        </article>
    )
}

export default SelectNetwork