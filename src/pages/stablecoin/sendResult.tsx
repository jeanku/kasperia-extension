import { useLocation, useNavigate } from "react-router-dom";
import { Button } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon/index'

import IconSuccess from '@/assets/images/icon-success.png'
import '@/styles/transaction.scss'

const SendResult = () => {
   const navigate = useNavigate();
   const { state } = useLocation()
   const { symbol, explorer = '', hash = '', sendTo = { address: '', amount: ''}} = state

   const openTxExplorer = () => {
      if (!hash || !explorer) return
      window.open(`${explorer}/tx/${hash}`);
   }

   return (
      <article className="page-box">
         <div className="content-main send-result">
            <div className='send-result-txt'>
               <img className='result-img' src={IconSuccess} alt="success" />
               <h6>Sent</h6>
               <p className='send-result-p send-result-amount'>{sendTo.amount} {symbol}</p>
               <p className='send-result-p'> Transfer is being processed on-chain. Bridging usually takes a few minutes depending on network traffic.</p>
               {/* <p className='send-result-p'>{formatAddress(sendTo.address, 12)}</p> */}
               <p className='send-result-share cursor-pointer' onClick={() => openTxExplorer()}><SvgIcon color="#74E6D8"
                  offsetStyle={{ marginRight: '6px' }}
                  iconName="IconShare" />View on Explorer</p>
            </div>
            <div className="btn-pos-two">
               <Button block size="large" onClick={() => navigate('/stableCoin/stableCoin')}>
                  Done
               </Button>
            </div>
         </div>
      </article>
   )
}

export default SendResult