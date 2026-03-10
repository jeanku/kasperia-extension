import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { Button, Popup, Popover } from "antd-mobile";
import { Action } from "antd-mobile/es/components/popover";
import { BankcardOutline } from "antd-mobile-icons";

import HeadNav from "@/components/HeadNav";
import NumberInput from "@/components/NumberInput";
import TokenImg from "@/components/TokenImg";
import AddressSelectPopup from "@/components/AddressSelectPopup";
import { SvgIcon } from "@/components/Icon";
import { useNotice } from '@/components/NoticeBar/NoticeBar'

import { AccountEvm } from "@/chrome/accountEvm";
import { Evm } from "@/chrome/evm";
import { RootState } from "@/store";

import {
   StableCoinData,
   TokenListItem,
   ChainConfig
} from "@/types/type";

import {
   ChainListMainnet,
   ChainListTestnet,
   StableCoinMainTokenList,
   StableCoinTestnetTokenList,
   FixDecimal
} from "@/types/constant";

import { NetworkType } from "@/utils/wallet/consensus";
import { formatAddress, formatBalanceFixed } from "@/utils/util";

import { EvmNetwork } from "@/model/evm";

interface EvmNetworkItem {
   chainId: string;
   name: string;
}

const Stablecoin = () => {
   const navigate = useNavigate();
   const { noticeError, noticeInfo } = useNotice();
   const { state } = useLocation();

   const { preference } = useSelector((state: RootState) => state.preference);
   const evmAddress = preference.currentAccount?.ethAddress ?? "";
   const isTestnet = preference.network.networkType === NetworkType.Testnet;
   const ChainList = isTestnet ? ChainListTestnet : ChainListMainnet;
   const StableCoinToken = isTestnet ? StableCoinTestnetTokenList : StableCoinMainTokenList;

   const [runtimeChainList, setRuntimeChainList] = useState<ChainConfig[]>(ChainList);

   const [fromData, setFromData] = useState<StableCoinData | null>(null);
   const [toData, setToData] = useState<StableCoinData | null>(null);

   const [amount, setAmount] = useState<string>("");
   const [toAmount, setToAmount] = useState<string>("");
   const [TokenList, setTokenList] = useState<TokenListItem[]>(StableCoinToken)

   const [popupToken, setPopupToken] = useState(false);
   const [approveVisible, setApproveVisible] = useState(false)
   const [approveBtnLoading, setApproveBtnLoading] = useState(false)
   const [popupVisible, setPopupVisible] = useState(false);
   const [btnLoading, setBtnLoading] = useState(false);
   const [isChain, setIsChain] = useState(true);

   const [selectType, setSelectType] = useState<"from" | "to">("from");
   const [selectChainId, setSelectChainId] = useState("");

   /* ---------------- network ---------------- */

   const buildStableCoinData = (chain: ChainConfig): StableCoinData => {
      return {
         ...chain,
         address: evmAddress,
         balance: "",
         networkName: chain.name ?? "",
         baseFee:
            StableCoinToken.find((t) => t.token === chain.token)?.baseFee ?? 0
      };
   };

   const fetchEvmInfo = useCallback(async () => {
      const network = await Evm.getSelectedNetwork();
      const networkList: EvmNetworkItem[] = await Evm.getNetworks();
      if (!network) return;
      setTokenList(() => TokenList.map(item => {
         const chainId = ChainList.find(chain => chain.name === item.name)?.chainId.toString();
         return {
            ...item,
            chainId,
         }
      }))
      const updatedChainList = ChainList.map((chain) => {
         const match = networkList.find((n) => n.chainId === chain.chainId.toString());
         return {
            ...chain,
            name: match?.name ?? chain.name
         };
      });
      
      setRuntimeChainList(updatedChainList);
      const currentChain = updatedChainList.find((c) => c.chainId.toString() === network.chainId);

      if (!currentChain) {
         setIsChain(false);
         const defaultFrom = updatedChainList[0];
         const defaultTo = updatedChainList[1];
         setFromData(buildStableCoinData(defaultFrom));
         setToData(buildStableCoinData(defaultTo));
         noticeError("target network invalid!")
         return
      }
      const anotherChain = updatedChainList.find((c) => c.chainId !== currentChain.chainId);
      if (!anotherChain) return;

      setFromData(buildStableCoinData(currentChain));
      setToData(buildStableCoinData(anotherChain));

      setIsChain(true);
   }, [ChainList, StableCoinToken, evmAddress]);

   const tokenList = useMemo(() => {
      if (!selectChainId) return [];
      return TokenList.filter(
         item => item.chainId === selectChainId
      );
   }, [TokenList, selectChainId]);

   const setToken = (item: TokenListItem) => {
      if (selectType === 'from' && fromData) {
         if (item.symbol !== fromData.symbol) {
            setFromData({
               ...fromData,
               ...item,
            });
            setAmount('')
            if(!toData) return
            const toToken = StableCoinToken.find(token => token.symbol === item.symbol && token.name === toData.name)
            setToData({
               ...toData,
               ...toToken,
            });
         }
      }
      setPopupToken(false)
   }

   const selectNetworkTip = () => {
      if(!isChain) {
         noticeInfo("Please select a network")
      }
   }

   const isBridgeAvailable = useMemo(() => {
      if (!fromData) return false;
      return runtimeChainList.some(c => c.chainId === fromData.chainId);
   }, [runtimeChainList, fromData]);

   /* ---------------- balance ---------------- */
   const fetchBalance = useCallback(async () => {
      if (!fromData || !isChain) return;
      const bal = await AccountEvm.getTokenBalance(
         fromData.address,
         fromData.token,
         fromData.decimals
      );
      console.log('fetchBalance- bal', bal)
      setFromData((prev) => prev ? { ...prev, balance: formatBalanceFixed(bal, FixDecimal) } : prev);
   }, [fromData?.token, fromData?.address]);

   /* ---------------- bridge calc ---------------- */

   const calcToAmount = useCallback(() => {
      if (!fromData || !amount) {
         setToAmount("");
         return;
      }
      const fee = fromData.baseFee ?? 0;
      const result = Number(amount) - fee;
      if (result <= 0) {
         setToAmount("");
         return;
      }
      setToAmount(formatBalanceFixed(result.toString(), FixDecimal));
   }, [amount, fromData]);

   /* ---------------- network dropdown ---------------- */
   const actions: Action[] = useMemo(() => {
      const getList = runtimeChainList.map((item) => ({
         key: item.chainId.toString(),
         text: item.name ?? "",
         icon: (
            <img
               src={item.iconText ?? ""}
               width={22}
               height={22}
               alt=""
               style={{ borderRadius: "50%" }}
            />
         )
      }));
      return getList
   }, [runtimeChainList]);

   const isValidRuntimeChain = useCallback((chainId: string | number) => {
      return runtimeChainList.some((c) => c.chainId.toString() === chainId.toString());
   }, [runtimeChainList]);

   const networkPopover = async (key: string, type: "from" | "to") => {
      if (!isValidRuntimeChain(key)) {
         noticeError("Network not supported");
         return;
      }

      const selected = runtimeChainList.find((c) => c.chainId.toString() === key);
      if (!selected || !fromData || !toData) return;
      if (type === "from") {
         const another = runtimeChainList.find((c) => c.chainId !== selected.chainId);
         console.log('another', another)
         if (!another) return;
         setFromData(buildStableCoinData(selected));
         setToData(buildStableCoinData(another));
         setIsChain(true)
         await Evm.setSelectedNetwork(fromData.chainId.toString())
      }

      if (type === "to") {
         const another = runtimeChainList.find((c) => c.chainId !== selected.chainId);
         if (!another) return;
         setToData(buildStableCoinData(selected));
         setFromData(buildStableCoinData(another));
         setIsChain(true)
      }
   };
   /* ---------------- actions ---------------- */

   const setMax = () => {
      if (!fromData) return;
      setAmount(fromData.balance);
   };

   const switchInfo = async () => {
      if(!isChain) selectNetworkTip();
      if (!fromData || !toData) return;
      const nextChainId = toData.chainId;
      if (!isValidRuntimeChain(nextChainId)) {
         noticeError("Target network not available");
         return;
      }
      setFromData(toData);
      setToData(fromData);
      setAmount("");
      setToAmount("");
      await Evm.setSelectedNetwork(fromData.chainId.toString())
      fetchBalance()
   };

   const bridgeSubmit = async () => {
      setBtnLoading(true);
      try {
         console.log("bridge submit");
      } finally {
         setBtnLoading(false);
      }
   };

   useEffect(() => {
      fetchEvmInfo();
   }, [fetchEvmInfo]);

   useEffect(() => {
      fetchBalance();
   }, [fetchBalance]);

   useEffect(() => {
      calcToAmount();
   }, [calcToAmount]);

   if (!fromData || !toData) return null;

   /* ---------------- render ---------------- */

   return (
      <div className="page-box">
         <HeadNav
            title="StableCoin Bridge"
            rightType="history"
            url="/stableCoin/stableCoinHistory"
            onBack={() => navigate("/home")}
         />
         <div className="content-main assets-details">
            {/* FROM */}
            <div className="card-box">
               <div className="card-title flex-row cb as">
                  <span>From</span>
                  <em>{formatAddress(fromData.address, 8)}</em>
               </div>
               <div className="flex-row cb ac mb12 mt30">
                  <NumberInput
                     value={amount}
                     onChange={(v) => setAmount(v.toString())}
                     decimalPlaces={fromData.decimals}
                     max={Number(fromData.balance)}
                     placeholder="amount"
                     style={{ flex: 2, fontSize: '14px', color: 'white', }}
                  />
                  <div
                     className="bridge-token-img-box"
                     onClick={() => {
                        if(!isChain) {
                           selectNetworkTip()
                           return;
                        };
                        setSelectChainId(fromData.chainId.toString() ?? "");
                        setSelectType("from");
                        setPopupToken(true);
                     }}
                  >
                     <TokenImg
                        url={fromData.symbol ?? ""}
                        name={fromData.symbol ?? ""}
                        width={28}
                        height={28}
                        marginRight={"3"}
                     />
                     <span>{fromData.symbol}</span>
                  </div>
               </div>

               <div className="mt15 flex-row cb ac">
                  <Popover.Menu
                     actions={actions}
                     trigger="click"
                     placement="bottom"
                     onAction={(node) => networkPopover(node.key as string, "from")}
                  >
                     <span className="hover-text">
                        {isChain ? (fromData.networkName || fromData.name) : "Not Network"}
                     </span>
                  </Popover.Menu>
                  <div className="sub-tit">
                     <strong className="mr5" onClick={setMax}>MAX</strong>
                     <span>
                        <BankcardOutline /> {fromData.balance || 0}
                     </span>
                  </div>
               </div>
            </div>

            {/* SWITCH */}
            <div className="bridge-divider flex-row cc ac">
               <div className="bridge-icon" onClick={switchInfo}>
                  <SvgIcon iconName="IconConvert" size={22} />
               </div>
            </div>

            {/* TO */}
            <div className="card-box">
               <div className="card-title flex-row cb as">
                  <span>To</span>
                  <p onClick={() => setPopupVisible(true)}>
                     {formatAddress(toData.address, 8)}
                  </p>
               </div>
               <div className="flex-row cb ac mb12 mt30">
                  <NumberInput
                     value={toAmount}
                     disabled
                     onChange={(e) => { }}
                     decimalPlaces={toData.decimals}
                     placeholder="to amount"
                     style={{ flex: 2, fontSize: '14px', color: 'white', }}
                  />
                  <div className="bridge-token-img-box">
                     <TokenImg
                        url={toData.symbol ?? ""}
                        name={toData.symbol ?? ""}
                        width={28}
                        height={28}
                        marginRight={"3"}
                     />
                     <span>{toData.symbol}</span>
                  </div>
               </div>
               <Popover.Menu
                  actions={actions}
                  trigger="click"
                  placement="bottom"
                  onAction={(node) => networkPopover(node.key as string, "to")}
               >
                  <span className="hover-text">
                     {isChain ? (toData.networkName || toData.name) : "Not Network"}
                  </span>
               </Popover.Menu>
            </div>

            {/* submit */}
            <div className="btn-pos-two post-bottom">
               <Button
                  block
                  size="large"
                  color="primary"
                  loading={btnLoading}
                  disabled={!amount || !toAmount || !isBridgeAvailable || !isChain}
                  onClick={bridgeSubmit}
               >
                  Bridge
               </Button>
            </div>
         </div>
         {/* address popup */}
         <AddressSelectPopup
            visible={popupVisible}
            isKaspa={false}
            isUpdata
            onClose={() => setPopupVisible(false)}
            onSelect={(res) =>
               setToData((prev) =>
                  prev ? { ...prev, address: res.address } : prev
               )
            }
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
   );
};

export default Stablecoin;