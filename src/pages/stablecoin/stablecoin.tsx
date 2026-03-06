
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useBlocker } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Mask, SpinLoading, Popup, Popover, } from 'antd-mobile'
import { Action } from 'antd-mobile/es/components/popover'

import { BankcardOutline } from 'antd-mobile-icons'
import { ethers } from "ethers";

import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import NumberInput from '@/components/NumberInput';
import TokenImg from "@/components/TokenImg";
import AddressSelectPopup from '@/components/AddressSelectPopup'
import { AccountEvm } from "@/chrome/accountEvm";
import { Evm } from '@/chrome/evm'

import { StableCoinData, TokenListItem, ChainConfig } from '@/types/type'
import { RootState } from '@/store';
import { EvmNetwork } from "@/model/evm";
import { ChainListTestnet, ChainListMainnet, StableCoinTestnetTokenList, StableCoinMainTokenList, FixDecimal } from '@/types/constant'
import { NetworkType } from "@/utils/wallet/consensus";
import { formatAddress, formatBalanceFixed } from '@/utils/util'

const Stablecoin = () => {
   const { state } = useLocation()
   // const { noticeError } = useNotice();
   const navigate = useNavigate();

   const { preference } = useSelector((state: RootState) => state.preference);
   const [evmNetwork, setEvmNetwork] = useState<EvmNetwork>(state?.evmNetwork)

   const isTestnet = preference.network.networkType === NetworkType.Testnet
   const ChainList = isTestnet ? ChainListTestnet : ChainListMainnet
   const StableCoinToken = isTestnet ? StableCoinTestnetTokenList : StableCoinMainTokenList

   const [btnLoading, setBtnLoading] = useState(false)
   const [approveBtnLoading, setApproveBtnLoading] = useState(false)

   const [popupVisible, setPopupVisible] = useState(false)
   const [popupToken, setPopupToken] = useState(false)
   const [approveVisible, setApproveVisible] = useState(false)

   const [selectChainName, setSelectChainName] = useState<string>('');
   const [selectType, setSelectType] = useState('')
   const [amount, setAmount] = useState<number | string>('')
   const [toAmount, setToAmount] = useState<number | string>('')

   const evmAddress = preference.currentAccount?.ethAddress!
   const [fromData, setFromData] = useState<StableCoinData>({
      ...ChainList[0],
      address: evmAddress,
      balance: '',
      baseFee: StableCoinToken.find(item => item.token === ChainList[0].token)?.baseFee || 0
   })
   const [toData, setToData] = useState<StableCoinData>({
      ...ChainList[1],
      address: evmAddress,
      balance: '',
      baseFee: StableCoinToken.find(item => item.token === ChainList[1].token)?.baseFee || 0
   })

   const tokenList = useMemo(() => {
      if (!selectChainName) return [];

      return StableCoinToken.filter(
         item => item.name === selectChainName
      );
   }, [StableCoinToken, selectChainName]);

   const actions: Action[] = useMemo(() => {
      return ChainList.map((item) => ({
         key: item.chainId!.toString(),
         icon: <img src={item.iconText!} style={{ borderRadius: '50%' }} alt={item.name} width={22} height={22} />,
         text: item.name,
      }));
   }, [ChainList]);
   const submitDisabled = () => {
      return !amount || !toAmount
   }

   const fetchBalance = useCallback(async (address: string, token: string, decimals: number) => {
      const bal = await AccountEvm.getTokenBalance(address, token, decimals);
      setFromData(prev => ({
         ...prev,
         balance: formatBalanceFixed(bal, FixDecimal),
      }));
   }, []);

   const calcToAmount = () => {
      const currentToken = StableCoinToken.find(item => item.token === fromData.token)
      if (currentToken) {
         const fee = currentToken.baseFee
         const toAmount = Number(amount) - fee
         if (toAmount > 0) {
            setToAmount(formatBalanceFixed(toAmount.toString(), FixDecimal))
         } else {
            setToAmount("")
         }
      }
   }

   const fetchEvmInfo = async () => {
      const network = await Evm.getSelectedNetwork()
      if (!network) return
      console.log('network', network)
      setEvmNetwork(network)
   }

   useEffect(() => {
      fetchEvmInfo()
   }, [])

   useEffect(() => {
      if (!fromData.token || !fromData.address) return;
      fetchBalance(fromData.address, fromData.token, Number(fromData.decimals));
   }, [fromData.address, fromData.token, fromData.decimals, fetchBalance]);

   useMemo(() => {
      if (!amount || Number(amount) < 1) {
         setToAmount("")
         return
      }
      calcToAmount()
   }, [amount]);

   const setMax = () => {
      setAmount(fromData.balance)
   }

   const setTokenListFun = (name: string, type: 'fromData' | 'toData') => {
      setSelectChainName(name);
      setSelectType(type);
      setPopupToken(true);
   };

   const switchNetwork = async (chainId: string) => {
      await Evm.setSelectedNetwork(chainId)
   }

   const setToken = (item: TokenListItem) => {
      if (selectType === 'fromData') {
         if (item.symbol !== fromData.symbol) {
            setFromData({
               ...fromData,
               ...item,
            });
            setAmount('')
            const toToken = StableCoinToken.find(token => token.symbol === item.symbol && token.name === toData.name)
            setToData({
               ...toData,
               ...toToken,
            });
         }
      }
      setPopupToken(false)
   }

   const setAddress = (address: string) => {
      setToData(prev => ({
         ...prev,
         address
      }));
   }

   const buildStableCoinData = (chain: ChainConfig): StableCoinData => {
      return {
         ...chain,
         address: evmAddress,
         balance: '',
         baseFee:
            StableCoinToken.find(token => token.token === chain.token)?.baseFee ?? 0
      };
   };

   const getAnotherChain = (excludeChainId: string): ChainConfig | undefined => {
      return ChainList.find(
         chain => chain.chainId.toString() !== excludeChainId
      );
   };

   const networkPopover = (key: string, type: 'from' | 'to') => {
      const selectedChain = ChainList.find(chain => chain.chainId.toString() === key);
      if (!selectedChain) return;

      const selectedChainId = selectedChain.chainId.toString();

      if (type === 'from') {
         if (selectedChainId === fromData.chainId.toString()) return;

         let nextFrom = buildStableCoinData(selectedChain);
         let nextTo = toData;
         if (toData.chainId.toString() === selectedChainId) {
            const anotherChain = getAnotherChain(selectedChainId);
            if (anotherChain) {
               nextTo = buildStableCoinData(anotherChain);
            }
         }

         setFromData(nextFrom);
         setToData(nextTo);
      }

      if (type === 'to') {
         if (selectedChainId === toData.chainId.toString()) return;
         let nextTo = buildStableCoinData(selectedChain);
         let nextFrom = fromData;
         if (fromData.chainId.toString() === selectedChainId) {
            const anotherChain = getAnotherChain(selectedChainId);
            if (anotherChain) {
               nextFrom = buildStableCoinData(anotherChain);
            }
         }
         setToData(nextTo);
         setFromData(nextFrom);
      }
   };

   const switchInfo = () => {
      switchNetwork(toData.chainId.toString());
      setFromData(prev => ({ ...toData }));
      setToData(prev => ({ ...fromData }));
      setAmount('');
      setToAmount('');
   };

   const bridgeSubmit = () => {

   }


   return (
      <div className="page-box">
         <HeadNav title='StableCoin Bridge' rightType={"history"} url="/stableCoin/stableCoinHistory" onBack={() => navigate('/home')}></HeadNav>
         <div className="content-main assets-details">
            {/* from info  */}
            <div className='card-box'>
               <div className='card-title flex-row cb as'>
                  <span>From</span>
                  <em className="one-line">{formatAddress(fromData?.address || '', 8)}</em>
               </div>
               <div className='flex-row cb ac mb12 mt30'>
                  <NumberInput
                     value={amount.toString() ?? ''}
                     onChange={(e) => setAmount(e.toString())}
                     decimalPlaces={Number(fromData.decimals)}
                     max={Number(fromData.balance)}
                     allowNegative={true}
                     placeholder="amount"
                     style={{ fontSize: '14px', color: 'white', flex: 2 }}
                  />
                  <div className="bridge-token-img-box" onClick={() => setTokenListFun(fromData.name!, 'fromData')}>
                     <TokenImg url={fromData.symbol!} name={fromData.symbol!} width={28} height={28} marginRight={"3"} />
                     <span>{fromData.symbol}</span>
                  </div>
               </div>
               <div className='mt15 flex-row cb ac' >
                  <Popover.Menu
                     className="account-popover"
                     actions={actions}
                     mode='dark'
                     trigger='click'
                     placement='bottom'
                     onAction={node => networkPopover(node.key as string, 'from')}
                  >
                     <span className='hover-text'>{fromData.name}</span>
                  </Popover.Menu>
                  <div className='sub-tit mb0import'>
                     <strong className='strong mr10' onClick={() => setMax()}>MAX</strong>
                     <span><BankcardOutline fontSize={16} /> {fromData.balance ? formatBalanceFixed(fromData.balance, 4) : 0}</span>
                  </div>
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
               <div className='flex-row cb ac mb12 mt30'>
                  <NumberInput
                     value={toAmount.toString() ?? ''}
                     onChange={(e) => { }}
                     decimalPlaces={Number(toData.decimals)}
                     allowNegative={true}
                     placeholder="to amount"
                     disabled={true}
                     style={{ fontSize: '14px', color: 'white', flex: 2 }}
                  />
                  <div className="bridge-token-img-box" >
                     <TokenImg url={toData.symbol!} name={toData.symbol!} width={28} height={28} marginRight={"3"} />
                     <span>{toData.symbol}</span>
                  </div>
               </div>
               <div className='mt15'>
                  <Popover.Menu
                     className="account-popover"
                     actions={actions}
                     mode='dark'
                     trigger='click'
                     placement='bottom'
                     onAction={node => networkPopover(node.key as string, 'to')}
                  >
                     <span className='hover-text'>{toData.name}</span>
                  </Popover.Menu>
               </div>
            </div>
            <div className='history-box mt20'>
               <div className="history-token-item">
                  <span>Est. Time</span>
                  <em>{fromData.estTime} minute</em>
               </div>
               <div className="history-token-item">
                  <span>Service Fee</span>
                  <em>{fromData.baseFee} {fromData.symbol}</em>
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
         {/* Select Token Popup */}
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
                  <h6>Select Token</h6>
               </div>
               <div className="contact-list">
                  <div className="contact-list-box">
                     {
                        tokenList.map((item: TokenListItem) => {
                           return (
                              <div className="contact-list-item flex-row cb ac mb12" key={`${item.name}-${item.symbol}-${item.token}`} onClick={() => setToken(item)}>
                                 <div className='flex2 flex-row'>
                                    <TokenImg url={item.symbol!} name={item.symbol!} width={40} height={40} marginRight={"8"} />
                                    <div>
                                       <span>{item.symbol}</span>
                                       <em>{formatAddress(item.token, 8)}</em>
                                    </div>
                                 </div>
                                 {
                                    fromData.token === item.token && <SvgIcon iconName="IconRight" size={20} color="#4AD961" />
                                 }
                              </div>
                           )
                        })
                     }
                  </div>
               </div>
            </article>
         </Popup>

         {/* Show Approve Popup */}
         <Popup
            bodyClassName="approve-popup-body"
            showCloseButton
            bodyStyle={{
               height: '80vh',
               borderTopLeftRadius: '8px',
               borderTopRightRadius: '8px',
               overflowY: 'auto',
            }}
            visible={approveVisible}
            onMaskClick={() => {
               setApproveVisible(false)
            }}
            onClose={() => {
               setApproveVisible(false)
            }}
         >
            <div className='popup-title'>
               <h6>Send Transaction</h6>
            </div>
            <article className='popup-box-auto assets-details'>
               <div className="history-box">
                  <div className="history-token-item">
                     <span>Network</span>
                     <em>Kasplex-L2</em>
                  </div>
                  <div className="history-token-item">
                     <span>Method</span>
                     <em>approve</em>
                  </div>
                  <div className="history-token-item">
                     <span>Token</span>
                     <em>USDC</em>
                  </div>
                  <div className="history-token-item">
                     <span>Token Address</span>
                     <em>0xd6f5...76285a <SvgIcon iconName="IconCopy" offsetStyle={{ marginLeft: '5px', marginRight: '-12px' }} /></em>
                  </div>
                  <div className="history-token-item">
                     <span>Approve To</span>
                     <em>0xd6f5...76285a <SvgIcon iconName="IconCopy" offsetStyle={{ marginLeft: '5px', marginRight: '-12px' }} /></em>
                  </div>
                  <div className="history-token-item">
                     <span>Approve Amount</span>
                     <em>234</em>
                  </div>
                  <div className="history-token-item">
                     <span>Nonce</span>
                     <em>145</em>
                  </div>
                  <div className="tx-confirm-box">
                     <h6 className="sub-tit mt15">Sign Message</h6>
                     <div className="tx-confirm-content">
                        <div className="tx-confirm-data">
                           {`{
                                 "gas": "0x1277f",
                                 "from": "0x8bd722c5d5fa7309507737fecbfa9f41eefe6975",
                                 "to": "0x328686dd5fbe0216faffca824d63613908f4b316",
                                 "data": "0xa60ee299000000000000000000000000c2df2f567d37ef4b8a620b41e46b17d7aec226870000000000000000000000000000000000000000000000001bc16d674ec800000000000000000000000000000000000000000000000000000000000000028c640000000000000000000000008bd722c5d5fa7309507737fecbfa9f41eefe6975",
                                 "nonce": 1182,
                                 "chainId": 97,
                                 "gasLimit": "90776",
                                 "gasPrice": "100000000",
                                 "value": 0
                           }` }
                        </div>
                     </div>
                  </div>
               </div>
            </article>
            <div className="btn-pos-two flexd-row post-bottom">
               <Button block size="large" onClick={() => setApproveVisible(false)}>
                  Reject
               </Button>
               <Button block size="large" color="primary"
                  loading={approveBtnLoading}
                  loadingText={'Submitting'}>
                  Sign & Pay
               </Button>
            </div>
         </Popup>
      </div>
   )
}

export default Stablecoin;