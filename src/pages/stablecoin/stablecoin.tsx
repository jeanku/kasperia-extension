
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useBlocker } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Mask, SpinLoading, Popup, } from 'antd-mobile'
import { BankcardOutline } from 'antd-mobile-icons'
import { ethers } from "ethers";

import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import NumberInput from '@/components/NumberInput';
import TokenImg from "@/components/TokenImg";
import AddressSelectPopup from '@/components/AddressSelectPopup'

import { StableCoinData, TokenListItem } from '@/types/type'
import { RootState } from '@/store';
import { EvmNetwork } from "@/model/evm";
import { ChainListTestnet, ChainListMainnet, StableCoinTestnetTokenList, } from '@/types/constant'
import { NetworkType } from "@/utils/wallet/consensus";
import { formatAddress, formatBalanceFixed } from '@/utils/util'

const Stablecoin = () => {
   const { state } = useLocation()
   // const { noticeError } = useNotice();
   const navigate = useNavigate();

   const { preference } = useSelector((state: RootState) => state.preference);
   const [evmNetwork, setEvmNetwork] = useState<EvmNetwork>(state?.evmNetwork)
   console.log('evmNetwork', evmNetwork)

   const ChainList = ChainListTestnet

   const [popupVisible, setPopupVisible] = useState(false)
   const [btnLoading, setBtnLoading] = useState(false)
   const [popupToken, setPopupToken] = useState(false)

   const [tokenList, setTokenList] = useState<TokenListItem[]>(StableCoinTestnetTokenList)

   const [selectType, setSelectType] = useState('')
   const [amount, setAmount] = useState<number | string>('')
   const [toAmount, setToAmount] = useState<number | string>('')

   const [fromData, setFromData] = useState({
      ...ChainList[0],
      address: preference.currentAccount?.ethAddress!,
      balance: '',
   })
   const [toData, setToData] = useState<StableCoinData>({
      ...ChainList[1],
      address: preference.currentAccount?.ethAddress!,
      balance: '',
   })


   const submitDisabled = () => {
      return !amount || !toAmount
   }
   const setMax = () => {
      setAmount(fromData.balance)
   }

   const setTokenListFun = (name: string, type: string) => {
      const tokenList = StableCoinTestnetTokenList.filter(item => item.name === name)
      setSelectType(type)
      setTokenList(tokenList)
      setPopupToken(true)
   }

   const setToken = (item: TokenListItem) => {
      if (selectType === 'fromData') {
         setFromData({
            ...fromData,
            ...item,
         });
         } else {
         setToData({
            ...toData,
            ...item,
         });
         }
      setPopupToken(false)
   }

   const currentToken = useCallback(() => {
      return selectType === 'fromData' ? fromData.token : toData.token;
   }, [selectType, fromData.token, toData.token])

   const setAddress = (address: string) => {
      toData.address = address
      setToData(toData)
   }

   const switchInfo = () => {
   }

   const bridgeSubmit = () => {

   }


   return (
      <div className="page-box">
         <HeadNav title='StableCoin Bridge' rightType={"history"} url="/stableCoin/stableCoinHistory" onBack={() => navigate('/home')}></HeadNav>
         <div className="content-main page-bridge">
            {/* from info  */}
            <div className='card-box'>
               <div className='card-title flex-row cb as'>
                  <span>From</span>
                  <p className="cursor-pointer">
                     <em className="one-line">{formatAddress(fromData?.address || '', 8)}</em>
                  </p>
               </div>
               <div className='flex-row cb ac mb12 mt20'>
                  <NumberInput
                     value={amount.toString() ?? ''}
                     onChange={(e) => setAmount(e.toString())}
                     decimalPlaces={Number(fromData.decimals)}
                     max={Number(fromData.balance)}
                     allowNegative={true}
                     placeholder="amount"
                     style={{ fontSize: '14px', color: 'white', flex: 2 }}
                  />
                  <div className='flex-row cb ac'>
                     <div className='sub-tit mr10 mb0import'>
                        <strong className='strong' onClick={() => setMax()}>MAX</strong>
                     </div>
                     <div className="bridge-token-img-box" onClick={() => setTokenListFun(fromData.name, 'fromData')}>
                        <TokenImg url={fromData.symbol!} name={fromData.symbol} width={28} height={28} marginRight={"3"} />
                        <img className='symbol-icon' src={fromData.iconText!} alt={fromData.symbol} />
                        <span>{fromData.symbol}</span>
                     </div>
                  </div>
               </div>
               <div className='mt15 flex-row cb ac' >
                  <span className='cursor-pointer'>{fromData.name}</span>
                  <span><BankcardOutline /> {fromData.balance ? formatBalanceFixed(fromData.balance, 4) : 0}</span>
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
                     <em className="one-line">{formatAddress(toData?.address || '', 8)}</em>
                     <SvgIcon iconName="IconUser" size={18} offsetStyle={{ marginLeft: '3px' }} />
                  </p>
               </div>
               <div className='flex-row cb ac mb12 mt20'>
                  <NumberInput
                     value={toAmount.toString() ?? ''}
                     onChange={(e) => { }}
                     decimalPlaces={Number(toData.decimals)}
                     allowNegative={true}
                     placeholder=""
                     disabled={true}
                     style={{ fontSize: '14px', color: 'white', flex: 2 }}
                  />
                  <div className="bridge-token-img-box" >
                     <TokenImg url={toData.symbol!} name={toData.symbol!} width={28} height={28} marginRight={"3"} />
                     <img className='symbol-icon' src={toData.iconText!} alt={toData.symbol} />
                     <span>{toData.symbol}</span>
                  </div>
               </div>
               <div className='mt15 flex-row cb ac'>
                  <span>{toData.name}</span>
                  <span><BankcardOutline /> {toData.balance ? formatBalanceFixed(toData.balance, 4) : 0}</span>
               </div>
            </div>
            <div className="btn-pos-two flexd-row post-bottom">
               <Button block size="large" color="primary" loading={btnLoading} disabled={submitDisabled()} onClick={() => bridgeSubmit()}>
                  Bridge
               </Button>
            </div>
         </div>
         <AddressSelectPopup
            visible={popupVisible}
            isKaspa={false}
            isUpdata={true}
            onClose={() => setPopupVisible(false)}
            onSelect={(res: any) => {
               setAddress(res.address)
            }}
         />
         <Popup
            className="wallet-popup"
            bodyClassName="wallet-popup-body"
            showCloseButton
            bodyStyle={{
               height: '55vh',
               borderTopLeftRadius: '8px',
               borderTopRightRadius: '8px',
               overflowY: 'auto',
            }}
            visible={popupToken}
            onMaskClick={() => {
               setPopupToken(false)
            }}
            onClose={() => {
               setPopupToken(false)
            }}
         >
            <article className='popup-box'>
               <div className='popup-title'>
                  <h6>Select Chain</h6>
               </div>
               <div className="contact-list">
                  <div className="contact-list-box">
                     {
                        tokenList.map((item: TokenListItem) => {
                           return (
                              <div className="contact-list-item flex-row cb ac" key={item.name} onClick={() => setToken(item)}>
                                 <div className='flex2 flex-row'>
                                    <TokenImg url={item.symbol!}  name={item.symbol!} width={40} height={40} marginRight={"3"} />
                                    <div>
                                       <span>{item.symbol}</span>
                                       <em>{formatAddress(item.token, 8)}</em>
                                    </div>
                                 </div>
                                 {
                                    currentToken() === item.token && <SvgIcon iconName="IconRight" size={20} color="#4AD961" />
                                 }
                              </div>
                           )
                        })
                     }
                  </div>
               </div>
            </article>
         </Popup>
      </div>
   )
}

export default Stablecoin;