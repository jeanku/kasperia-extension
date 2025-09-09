import { useEffect, useState } from "react"
import { Evm } from '@/chrome/evm'
import { NetworkConfig } from '@/model/evm'
import HeadNav from '@/components/HeadNav'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { Button, Input, Image, Popup, Modal } from "antd-mobile";
import { SvgIcon } from '@/components/Icon/index'
import { isValidUrl } from '@/utils/util'

const EvmIndex = () => {
    const { noticeSuccess, noticeError } = useNotice();
    const [popupVisible, setPopupVisible] = useState<boolean>(false)
    const [networkList, setNetworkList] = useState<NetworkConfig[]>([])
    const [_, setIsEdit] = useState<boolean>(false)
    const [saveLoading, setSaveLoading] = useState(false)
    const [newNetwork, setNewNetwork] = useState<NetworkConfig>({
        name: "",
        rpcUrl: "",
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

    const setNewNetworkInfo = <K extends keyof NetworkConfig>(key: K, value: NetworkConfig[K]) => {
        setNewNetwork((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    //a
    const addNewNetwork = () => {
        resetForm()
        setPopupVisible(true)
    }

    const resetForm = () => {
        setNewNetwork({
            name: "",
            rpcUrl: "",
            chainId: "",
            symbol: "",
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
        if (!isValidUrl(newNetwork.rpcUrl)) throw Error(`Invalid rpc url`)
        if (!newNetwork.chainId) throw Error(`Please enter a chain id`)
        if (!newNetwork.symbol) throw Error(`Please enter a symbol`)
        if (newNetwork.explorer && !isValidUrl(newNetwork.explorer)) throw Error(`Invalid explorer url`)
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
                            <div className="coin-item" key={item.name}>
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
                                <div className="coin-item-right">
                                    <SvgIcon size={24} iconName="IconEdit" onClick={() => editNetwork(index)} />
                                    <SvgIcon size={24} iconName="IconDel" onClick={() =>
                                        Modal.alert({
                                            title: 'Message',
                                            content: 'If you delete this network, you need to add it again to view your assets in it',
                                            showCloseButton: true,
                                            confirmText: "Delete",
                                            onConfirm: async () => {
                                                delNetwork(index)
                                            },
                                        })
                                    } color="#E64E4E" />
                                </div>
                            </div>
                        ))
                    )
                }
                <div className="mnemonic-btn-pos">
                    <Button block color="primary" onClick={() => addNewNetwork()}>
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
                            value={newNetwork.rpcUrl}
                            onChange={val => {
                                setNewNetworkInfo("rpcUrl", val)
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
                                setNewNetworkInfo('symbol', val)
                            }}
                            type="text"
                        />
                    </div>
                    <h6 className="sub-tit">Block explorer URL(option)</h6>
                    <div className="input-box mb12">
                        <Input
                            value={newNetwork.explorer}
                            onChange={val => {
                                setNewNetworkInfo('explorer', val)
                            }}
                            type="text"
                        />
                    </div>
                    <Button block loading={saveLoading} loadingText="Save..." color="primary" onClick={saveNetwork}>
                        Save
                    </Button>
                </div>
            </Popup>
        </article>
    )
}
export default EvmIndex