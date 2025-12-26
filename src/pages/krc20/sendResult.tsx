import {useState} from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from 'antd-mobile'
import {useSelector} from "react-redux";
import { SvgIcon } from '@/components/Icon/index'
import { SubmitSendTx } from '@/model/transaction'
import { formatBalance, formatAddress } from '@/utils/util'
import { KaspaExplorerUrl } from '@/types/enum'
import IconSuccess from '@/assets/images/icon-success.png'
import '@/styles/transaction.scss'
import {RootState} from "@/store";
import {NetworkType} from "@/utils/wallet/consensus";

const SendResult = () => {
    const navigate = useNavigate();
    const { state } = useLocation()
    const { preference } = useSelector((state: RootState) => state.preference);

    const [submitTx] = useState<SubmitSendTx>(state?.submitTx)
    const [txid] = useState<SubmitSendTx>(state?.txid)

    const openTxExplorer = () => {
        if(!txid) return
        const networkName = preference.network.networkType === NetworkType.Mainnet ? 'Mainnet' : 'Testnet';
        window.open(`${KaspaExplorerUrl[networkName]}${txid}`);
    }

    return (
        <article className="page-box">
            <div className="content-main send-result">
                <div className='send-result-txt'>
                    <img className='result-img' src={IconSuccess} alt="success" />
                    <h6>Sent</h6>
                    {
                        submitTx && <>
                            <p className='send-result-p'>{formatBalance(submitTx.amount.toString(), submitTx.token.dec)} {submitTx.token.name} was
                                successfully sent to</p>
                            <p className='send-result-p'>{formatAddress(submitTx.address, 8)}</p>
                        </>
                    }
                    <p className='send-result-share' onClick={() => openTxExplorer()}><SvgIcon color="#74E6D8" offsetStyle={{marginRight: '6px'}} iconName="IconShare" />View transaction</p>
                </div>
                <div className="btn-pos-two">
                    <Button block size="large" onClick={() => navigate('/home')}>
                        Done
                    </Button>
                </div>
            </div>
        </article>
    )
}

export { SendResult }