import { useEffect, useState } from "react"
import { Evm } from '@/chrome/evm'
import { EvmNetwork } from '@/model/evm'
import HeadNav from '@/components/HeadNav'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import TokenImg from "@/components/TokenImg";
import { Button, Input, Popup, Modal } from "antd-mobile";
import { SvgIcon } from '@/components/Icon/index'
import { isValidUrl } from '@/utils/util'

const EvmList = () => {
    const { noticeSuccess, noticeError } = useNotice();

    const [popupVisible, setPopupVisible] = useState<boolean>(false)
    const [networkList, setNetworkList] = useState<EvmNetwork[]>([])
    const [_, setIsEdit] = useState<boolean>(false)
    const [saveLoading, setSaveLoading] = useState(false)
    const [newNetwork, setNewNetwork] = useState<EvmNetwork>({
        name: "",
        rpcUrl: [],
        decimals: 18,
        chainId: "",
        symbol: "",
        explorer: "",
    })

    useEffect(() => {
        getNetWorkList()
    }, [])

    const getNetWorkList = async () => {
        let networks = await Evm.getNetworks()
        setNetworkList(networks)
    }

    const setNewNetworkInfo = <K extends keyof EvmNetwork>(key: K, value: EvmNetwork[K]) => {
        setNewNetwork((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const addNewNetwork = () => {
        resetForm()
        setPopupVisible(true)
    }

    const resetForm = () => {
        setNewNetwork({
            name: "",
            rpcUrl: [],
            chainId: "",
            symbol: "",
            decimals: 18,
            explorer: "",
        });
    };

    const editNetwork = (index: number) => {
        resetForm()
        let network = networkList[index]
        if (!network) {
            return noticeError("nerwork index invalid")
        }
        setNewNetwork(network)
        setIsEdit(true)
        setPopupVisible(true);
    };

    const delNetwork = async (index: number) => {
        let network = networkList[index]
        if (!network) {
            return noticeError("nerwork index invalid")
        }
        try {
            await Evm.removeNetwork(network.chainId)
            let networks = networkList.filter((_, i) => i !== index);
            setNetworkList(networks)
            noticeSuccess('Delete network successfully')
        } catch (error) {
            noticeError(error)
        }
    }

    const saveNetwork = async () => {
        try {
            validate()
            setSaveLoading(true)
            await Evm.addNetwork(newNetwork)
            refresh()
            setSaveLoading(false)
            setPopupVisible(false)
        } catch (error) {
            noticeError(error)
        }
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

    const refresh = () => {
        const idx = networkList.findIndex(r => r.chainId === newNetwork.chainId);
        if (idx === -1) {
            networkList.push(newNetwork)
        } else {
            networkList[idx] = newNetwork;
        }
        setNetworkList(networkList)
    }

    const validate = () => {
        if (!newNetwork.name.trim()) throw Error("Please enter a network name")
        if (!newNetwork.rpcUrl) throw Error("Please enter a rpc url")
        if (newNetwork.rpcUrl.length > 0 && !isValidUrl(newNetwork.rpcUrl[0])) throw Error(`Invalid rpc url`)
        if (!newNetwork.chainId) throw Error(`Please enter a chain id`)
        if (!newNetwork.symbol) throw Error(`Please enter a symbol`)
        if (newNetwork.explorer && !isValidUrl(newNetwork.explorer)) throw Error(`Invalid explorer url`)
        if (newNetwork.decimals <= 0 || newNetwork.decimals > 18) throw Error("decimal invalid")
        newNetwork.name = newNetwork.name.trim()
    }

    return (
        <article className="page-box">
            <HeadNav title="Custom Network"></HeadNav>
            <div className="content-main pb60">
                <p className="tip-message">
                    Kasperia cannot verify the security of customnetworks.Please add trusted networks only.
                </p>
                {
                    networkList.length > 0 && (
                        networkList.map((item, index) => (
                            <div className={ item.select ? "selected coin-item" : "coin-item" } key={item.name} onClick={() => switchNetwork(index)}>
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
                                <div className="coin-item-right">
                                    <SvgIcon size={24} iconName="IconEdit" color="#9CA3AF" onClick={() => editNetwork(index)} />
                                    <SvgIcon size={24} iconName="IconDel" onClick={() =>
                                        Modal.alert({
                                            title: 'Message',
                                            bodyClassName: 'modal-alert-body',
                                            content: 'If you delete this network, you need to add it again to view your assets in it',
                                            showCloseButton: true,
                                            confirmText: "Delete",
                                            onConfirm: async () => {
                                                delNetwork(index)
                                            },
                                        })
                                    } color="#F87171" />
                                </div>
                            </div>
                        ))
                    )
                }
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" color="primary" onClick={() => addNewNetwork()}>
                        Add Custom Network
                    </Button>
                </div>
            </div>
            <Popup
                visible={popupVisible}
                className="wallet-popup"
                bodyClassName="wallet-popup-body"
                onMaskClick={() => {
                    setPopupVisible(false)
                }}
                onClose={() => {
                    setPopupVisible(false)
                }}
                bodyStyle={{
                    height: '62vh', borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px', overflowY: 'scroll'
                }}
            >
                <div className="content-main change-pwd padding-top20-imp">
                    <h6 className="sub-tit">Network name</h6>
                    <div className="input-box mb12">
                        <Input
                            value={newNetwork.name}
                            maxLength={16}
                            onChange={val => {
                                setNewNetworkInfo("name", val)
                            }}
                            type="text"
                        />
                    </div>
                    <h6 className="sub-tit">RPC URL</h6>
                    <div className="input-box mb12">
                        <Input
                            value={newNetwork.rpcUrl.join(",")}
                            onChange={val => {
                                setNewNetworkInfo("rpcUrl", val.trim().split(","))
                            }}
                            type="text"
                        />
                    </div>
                    <h6 className="sub-tit">Chain Id</h6>
                    <div className="input-box mb12">
                        <Input
                            value={newNetwork.chainId}
                            onChange={val => {
                                setNewNetworkInfo("chainId", val)
                            }}
                            type="text"
                        />
                    </div>
                    <h6 className="sub-tit">Currency symbol</h6>
                    <div className="input-box mb12">
                        <Input
                            maxLength={8}
                            value={newNetwork.symbol}
                            onChange={val => {
                                setNewNetworkInfo('symbol', val.trim())
                            }}
                            type="text"
                        />
                    </div>

                    <h6 className="sub-tit">Decimals</h6>
                    <div className="input-box mb12">
                        <Input
                            value={newNetwork.decimals.toString() || "18"}
                            onChange={val => {
                                setNewNetworkInfo('decimals', Number(val))
                            }}
                            type="text"
                        />
                    </div>

                    <h6 className="sub-tit">Block explorer URL(option)</h6>
                    <div className="input-box mb12">
                        <Input
                            value={newNetwork.explorer}
                            onChange={val => {
                                setNewNetworkInfo('explorer', val.trim())
                            }}
                            type="text"
                        />
                    </div>


                    <Button className="mb12" block loading={saveLoading} loadingText="Save..." color="primary"
                            onClick={saveNetwork}>
                        Save
                    </Button>
                </div>
            </Popup>
        </article>
    )
}
export default EvmList