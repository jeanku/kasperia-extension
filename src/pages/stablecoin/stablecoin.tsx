
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

import { Button, Mask, SpinLoading } from 'antd-mobile'
import { useNotice } from '@/components/NoticeBar/NoticeBar'

import { useSelector } from "react-redux";
import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import NumberInput from '@/components/NumberInput';
import TokenImg from "@/components/TokenImg";
import AddressSelectPopup from '@/components/AddressSelectPopup'
import { RootState } from '@/store';
import { EvmNetwork } from "@/model/evm";
import { NetworkType } from "@/utils/wallet/consensus";
import { formatAddress, formatBalanceFixed } from '@/utils/util'
import { ethers } from "ethers";

const Stablecoin = () => {
   const { state } = useLocation()
   // const { noticeError } = useNotice();
   const navigate = useNavigate();

   const { preference } = useSelector((state: RootState) => state.preference);
   const [evmNetwork, setEvmNetwork] = useState<EvmNetwork>(state?.evmNetwork)
   console.log('preference', preference)

   const [popupVisible, setPopupVisible] = useState(false)
   const [btnLoading, setBtnLoading] = useState(false)

   const [amount, setAmount] = useState<number | string>('')
   const [toAmount, setToAmount] = useState<number | string>('')

   const [fromData, setFromData] = useState({
      address: preference.currentAccount?.address!,
      token: "KAS",
      balance: ethers.formatUnits(preference.currentAccount?.balance || "0", 8),
      desc: 8,
      isKaspa: true,
      network: `Kaspa ${preference.network.networkType}`,
   })

   const [toData, setToData] = useState({
      address: preference.currentAccount?.ethAddress!,
      token: 'KAS',
      balance: "0",
      desc: 18,
      isKaspa: false,
      network: evmNetwork?.name || "",
   })

   const submitDisabled = () => {
      return !amount || !toAmount
   }
   const setMax = () => {
      setAmount(fromData.balance)
   }

   const switchInfo = () => {
   }

   const bridgeSubmit = () => {

   }


   return (
      <div className="page-box">
         <HeadNav title='Bridge' rightType={"history"} url="/stableCoin/stableCoinHistory" onBack={() => navigate('/home')}></HeadNav>
         <div className="content-main page-bridge">
            {/* from info  */}
            <div className='card-box'>
               <div className='card-title flex-row cb as'>
                  <span>From</span>
                  <p className="cursor-pointer">
                     <em className="one-line">xxxxxx</em>
                  </p>
               </div>
               <div className='flex-row cb ac mb12 mt20'>
                  <NumberInput
                     value={amount.toString() ?? ''}
                     onChange={(e) => setAmount(e.toString())}
                     decimalPlaces={Number(fromData.desc)}
                     max={Number(fromData.balance)}
                     allowNegative={true}
                     placeholder="amount"
                     style={{ fontSize: '14px', color: 'white', flex: 2 }}
                  />
                  <div className='flex-row cb ac'>
                     <div className='sub-tit mr10 mb0import'>
                        <strong className='strong' onClick={() => setMax()}>MAX</strong>
                     </div>
                     <div className="input-select flex-row cb ac">
                        <TokenImg url={fromData.token!} className={'visable-top-img'} name={fromData.token} width={20} height={20} marginRight={"3"} />
                        <span>{fromData.token}</span>
                     </div>
                  </div>
               </div>
               <div className='mt15 flex-row cb ac'>
                  <span>{fromData.network}</span>
                  <span>max: {formatBalanceFixed(fromData.balance, 4)}</span>
               </div>
            </div>
            {/* switch */}
            <div className='bridge-divider flex-row cc ac'>
               <div className='bridge-icon' onClick={() => switchInfo()}>
                  <SvgIcon iconName="IconConvert" size={22} color="#D8D8D8" />
               </div>
            </div>
            <div className='card-box'>
               <div className='card-title flex-row cb as'>
                  <span>To</span>
                  <p className="cursor-pointer" onClick={() => setPopupVisible(true)}>
                     <em className="one-line">{'xxxxxxx'}</em>
                     <SvgIcon iconName="IconUser" size={18} offsetStyle={{ marginLeft: '3px' }} />
                  </p>
               </div>
               <div className='flex-row cb ac mb12 mt20'>
                  <NumberInput
                     value={toAmount.toString() ?? ''}
                     onChange={(e) => { }}
                     decimalPlaces={Number(toData.desc)}
                     allowNegative={true}
                     placeholder=""
                     disabled={true}
                     style={{ fontSize: '14px', color: 'white', flex: 2 }}
                  />
                  <div className="input-select flex-row cb ac" >
                     <TokenImg url={toData.token!} className={'visable-top-img'} name={toData.token} width={20} height={20} marginRight={"3"} />
                     <span>{toData.token}</span>
                  </div>
               </div>
               <div className='mt15 flex-row cb ac'>
                  <span>{toData.network}</span>
                  <span></span>
               </div>
            </div>
            <div className="btn-pos-two flexd-row post-bottom">
               <Button block size="large" color="primary" loading={btnLoading} disabled={submitDisabled()} onClick={() => bridgeSubmit()}>
                  Bridge
               </Button>
            </div>
         </div>
      </div>
   )
}

export default Stablecoin;