import React, { useEffect, useState } from "react"
import { Evm } from '@/chrome/evm'
import { Erc20Options, EvmNetwork } from '@/model/evm'
import HeadNav from '@/components/HeadNav'
import { Button } from "antd-mobile";
import { ethers } from "ethers";
import {useNotice} from "@/components/NoticeBar/NoticeBar";
import {Session} from "@/types/type";
import {Notification} from "@/chrome/notification";
import {formatAddress} from "@/utils/util";
import {SvgIcon} from "@/components/Icon";
import {useClipboard} from "@/components/useClipboard";


interface RequestParam {
    data: {
        network: EvmNetwork,
        options: Erc20Options
    }
    session: Session
}

const AddErc20Token = () => {
    const { noticeError, noticeSuccess } = useNotice();
    const [token, setToken] = useState<Erc20Options>({
        address: "",
        symbol: "",
        name: "",
        image: "",
        decimals: 0
    })

    const [network, setNetwork] = useState<EvmNetwork | undefined>(undefined)
    const [saveLoading, setSaveLoading] = useState(false)
    const { handleCopy } = useClipboard()

    const submit = async () => {
        try {
            console.log("submit 1111")
            if (!ethers.isAddress(token.address)) throw new Error("invalid address")
            console.log("submit 111222")
            // if (token.name.trim() =="") {
                token.name = token.name || token.symbol
            // }
            console.log("submit 11122333", token)
            setSaveLoading(true)
            await Evm.addContract(network!.chainId, token)
            console.log("submit 111223444")
            Notification.resolveApproval()
        } catch (error) {
            noticeError(error)
        }
        setSaveLoading(false)
    }

    const getApproval = async () => {
        let approval: RequestParam = await Notification.getApproval()
        setToken(approval.data.options)
        setNetwork(approval.data.network)
    }

    useEffect(() => {
        getApproval()
    }, []);


    return (
        <article className="page-box">
            <HeadNav title="Add ERC20 Token" showLeft={false}></HeadNav>
            <div className="content-main sign-transactuon assets-details pb96">
                <div className="history-token-item">
                    <span>Network </span>
                    <em>{network?.name || ""}</em>
                </div>

                <div className="history-token-item">
                    <span>Address</span>
                    <em className="cursor-pointer"
                        onClick={() => handleCopy(token.address)}>{formatAddress(token.address, 6)}<SvgIcon
                        iconName="IconCopy" offsetStyle={{marginLeft: '5px', marginRight: '-12px'}}/></em>
                </div>

                <div className="history-token-item">
                    <span>Symbol</span>
                    <em>{token.symbol}</em>
                </div>

                <div className="history-token-item">
                    <span>Decimals</span>
                    <em>{token.decimals}</em>
                </div>

                <Button className="mb12" block loading={saveLoading} loadingText="Save..." color="primary"
                        onClick={submit}>
                    Save
                </Button>
            </div>
        </article>
    )
}
export {AddErc20Token}