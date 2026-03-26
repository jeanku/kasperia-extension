import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, DotLoading } from 'antd-mobile'
import { ethers } from "ethers";
import { useLocation, useNavigate } from "react-router-dom";

import { useNotice } from "@/components/NoticeBar/NoticeBar";
import { AccountEvm } from "@/chrome/accountEvm";
import { TransactionRequest } from "ethers/src.ts/providers/provider";
import '@/styles/transaction.scss'

const SendTransaction = () => {
   const { noticeError } = useNotice()
   const { state } = useLocation()
   const navigate = useNavigate();

   const [btnLoading, setBtnLoading] = useState(false)
   const [unSignedTx, setUnSignedTx] = useState<TransactionRequest | null>(null);
   const { 
      fromAddress, 
      amountWei = 0n, 
      amount = '', 
      token = '', 
      toAddress = '', 
      toChainId, 
      bridgeAddress = '',
      symbol = '',
      explorer = '',
      networkName = '',
   } = state

   const buildTx = async () => {
      if (!fromAddress || !token || !bridgeAddress) return;
      try {
         const iface = new ethers.Interface(["function deposit(address token,uint256 amount,uint32 toChainId,address toAddress)"]);
         const data = iface.encodeFunctionData("deposit", [
            token,
            amountWei,
            toChainId,
            toAddress
         ]);
         const tx = await AccountEvm.createContractTx({
            from: fromAddress,
            to: bridgeAddress,
            data,
            value: "0"
         });
         
         setUnSignedTx(tx);
      } catch (err) {
         noticeError(err);
      }
   };

   const submitTransaction = async () => {
      if (!unSignedTx) {
         noticeError("Transaction not ready");
         return;
      }
      try {
         setBtnLoading(true);
         const hash = await AccountEvm.sendTransaction(unSignedTx);
         navigate('/stableCoin/stableCoinSendResult', {
               state: {
                  hash,
                  symbol,
                  explorer,
                  sendTo: {
                     address: toAddress,
                     amount: amount,
                  },
               }
         })
      } catch (error) {
         noticeError(error);
      } finally {
         setBtnLoading(false);
      }
   };

   useEffect(() => {
      if (!fromAddress || !token || !bridgeAddress) return;
      buildTx();
   }, [fromAddress, token, amountWei, bridgeAddress]);

   return (
      <article className="page-box">
         <HeadNav title='Sign Transaction' showLeft={false}></HeadNav>
         <div className="content-main sign-transactuon assets-details pb96">

            <div className="history-box">
               <div className="history-token-item">
                  <span>Network </span>
                  <em>{networkName || ""}</em>
               </div>
            </div>

            <div className="tx-confirm-box">
               <h6 className="sub-tit mt15">Sign Message</h6>
               <div className="tx-confirm-content">
                  <div className="tx-confirm-data">
                     {unSignedTx ? JSON.stringify(unSignedTx, null, 8) :
                        <div>
                           <DotLoading color='primary' />
                           <span>Loading</span>
                        </div>}
                  </div>
               </div>
            </div>

            <div className="btn-pos-two flexd-row post-bottom">
               <Button block size="large" onClick={() => navigate(-1)}>
                  Reject
               </Button>

               <Button block size="large" color="primary"
                  loading={btnLoading || !unSignedTx}
                  loadingText={'Submitting'}
                  onClick={() => submitTransaction()}>
                  Bridge
               </Button>
            </div>
         </div>
      </article>
   )
}

export default SendTransaction