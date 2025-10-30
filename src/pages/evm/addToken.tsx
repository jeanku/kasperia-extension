import React, { useEffect, useState } from "react"
import { Evm } from '@/chrome/evm'
import { Erc20Options, EvmNetwork } from '@/model/evm'
import HeadNav from '@/components/HeadNav'
import {Input, DotLoading, Button} from "antd-mobile";
import { Provider } from "@/utils/wallet/provider";
import { ethers } from "ethers";
import {useNotice} from "@/components/NoticeBar/NoticeBar";
import {useNavigate} from "react-router-dom";

const AddToken = () => {
    const { noticeError } = useNotice();
    const navigate = useNavigate();

    const [token, setToken] = useState<Erc20Options>({
        address: "",
        symbol: "",
        name: "",
        decimals: 0
    })

    const [network, setNetwork] = useState<EvmNetwork | undefined>(undefined)
    const [saveLoading, setSaveLoading] = useState(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const setTokenInfo = <K extends keyof Erc20Options>(key: K, value: Erc20Options[K]) => {
        setToken((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const [submitDisabled, setSubmitDisabled] = useState<boolean>(true)

    const fetchTokenInfo = async () => {
        setIsLoading(true)
        let provider: Provider
        if (!network) {
            let curNetwork = await Evm.getSelectedNetwork()
            if (!curNetwork) {
                throw Error("network not find")
            }
            setNetwork(curNetwork)
            provider = new Provider(curNetwork.rpcUrl[0], Number(curNetwork.chainId))
        } else {
            provider = new Provider(network.rpcUrl[0], Number(network.chainId))
        }
        let contract = await provider.getTokenInfo(token.address)
        setToken(contract)
        setIsLoading(false)
        setSubmitDisabled(false)
    }

    const submit = async () => {
        try {
            setSaveLoading(true)
            await Evm.addContract(network!.chainId, token)
            setSaveLoading(false)
            navigate(-1)
        } catch (error) {
            noticeError(error)
        }
    }

    useEffect(() => {
        if (ethers.isAddress(token.address)) {
            fetchTokenInfo()
        }
    }, [token.address])


    return (
        <article className="page-box">
            <HeadNav title="Add Token"></HeadNav>
            <div className="page-content page-setting list-box pb50">
                <h6 className="sub-tit">Token Address</h6>
                <div className="input-box mb12">
                    <Input
                        value={token.address}
                        maxLength={70}
                        placeholder="address"
                        onChange={val => {
                            setTokenInfo("address", val)
                        }}
                        type="text"
                    />
                </div>
                {
                    token.name.length > 0 && (
                        <>
                            <h6 className="sub-tit">Name</h6>
                            <div className="input-box mb12">
                                <Input disabled
                                   value={token.name}
                                   type="text"
                                />
                            </div>
                        </>
                    )
                }
                {
                    token.symbol.length > 0 && (
                        <>
                            <h6 className="sub-tit">Symbol</h6>
                            <div className="input-box mb12">
                                <Input disabled
                                       value={token.symbol}
                                       type="text"
                                />
                            </div>
                        </>
                    )
                }
                {
                    token.decimals > 0 && (
                        <>
                            <h6 className="sub-tit">Symbol</h6>
                            <div className="input-box mb12">
                                <Input disabled
                                       value={token.decimals.toString()}
                                       type="text"
                                />
                            </div>
                        </>
                    )
                }
                {
                    isLoading ? (
                        <div className="list-loading">
                            <>Loading<DotLoading/></>
                        </div>
                    ) : ''
                }
                <Button className="mb12" block loading={saveLoading} loadingText="Save..." color="primary"
                        disabled={submitDisabled} onClick={submit}>
                    Save
                </Button>
            </div>
        </article>
    )
}
export default AddToken