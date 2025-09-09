import { useEffect, useState } from "react"
import { Evm } from '@/chrome/evm'
import { NetworkConfig } from '@/model/evm'
import HeadNav from '@/components/HeadNav'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { Button, Input, Image, Popup, Modal } from "antd-mobile";
import { SvgIcon } from '@/components/Icon/index'
import { isValidUrl } from '@/utils/util'

const EvmIndex = () => {
    const { noticeError } = useNotice();

    const [networkList, setNetworkList] = useState<NetworkConfig[]>([])

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
            let networks = networkList.map(r => {
                r.select = r.chainId == network.chainId
                return r
            })
            setNetworkList(networks)
        } catch (error) {
            noticeError(error)
        }
    }

    return (
        <article className="page-box">
            <HeadNav title="Custom Network"></HeadNav>
            <div className="content-main">
                <p className="tip-message">
                    Kasperia cannot verify the security of customnetworks.Please add trusted networks only.
                </p>
                {
                    networkList.length > 0 && (
                        networkList.map((item, index) => (
                            <div className="coin-item" key={item.name} onClick={() => switchNetwork(index)}>
                                <Image src={`https://krc20-assets.kas.fyi/icons/TKAS.jpg`}
                                    placeholder={<SvgIcon iconName="PngCoinDef" size={44} />}
                                    width={44} height={44}
                                    fallback={<SvgIcon iconName="PngCoinDef" size={44} />}
                                    style={{ borderRadius: '50%', marginRight: '12px' }} lazy fit='cover' />
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
export default EvmIndex