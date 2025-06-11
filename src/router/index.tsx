import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import {
  Index,
  Boost,
  Explore,
  Home,
  Nopage,
} from "@/pages/index/index";

import {
  RandomMnemonic,
  FromMnemonic,
  FromPrivatekey,
} from "@/pages/import/index";

import {
  Index as AccountIndex,
  CreatePwd,
  CreateWallet,
  Unlock,
  EditName,
  Receive,
  SwitchAdd,
  SwitchAccount,
  SwitchUpdate,
} from "@/pages/account/index";

import {
  Index as ExportIndex,
  PrivateKey as ExportPrivateKey,
  Mnemonic as ExportMnemonic
} from "@/pages/export/index";

import {
  Send,
  Sign,
  Result,
  ChooseToken,
  Info
} from "@/pages/transaction/index";

import {
  Index as Krc20Index,
  Mint,
  MintConfirm,
  MintResult,
  Deploy,
  DeployConfirm,
  DeployResult,
  OpInfo,
} from "@/pages/krc20/index";

import More from "@/pages/setting/more";
import Setting from "@/pages/setting/setting";
import ContactIndex from "@/pages/setting/contact/index";
import ContactAdd from "@/pages/setting/contact/add";
import ContactUpdate from "@/pages/setting/contact/update";
import NetworkIndex from "@/pages/setting/network/index";
import NetworkUpdate from "@/pages/setting/network/update";
import Donation from "@/pages/setting/more/donation";
import ChangePwd from "@/pages/setting/more/changepwd";
import AutoLock from "@/pages/setting/more/autoLock";

import {
  Unlock as NotificationUnlock,
  SendKaspa as NotificationSendKaspa,
  Connect,
  EvokeBoost,
  History,
  SwitchNetwork,
  SignInfo,
} from "@/pages/notification";

const AppRouter: React.FC = () => {
  return (
    <HashRouter>
        <Routes>
          <Route path="/" element={<Boost />} >
            <Route index element={<Index />} />
            <Route path="/index" element={<Index />} />
            <Route path="/unlock" element={<Unlock />} />
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore />} />

            <Route path="/account" element={<AccountIndex />} />
            <Route path="/account/receive" element={<Receive />} />
            <Route path="/account/editName" element={<EditName />} />
            <Route path="/account/createpwd" element={<CreatePwd />} />
            <Route path="/account/createWallet" element={<CreateWallet />} />
            <Route path="/account/switch" element={<SwitchAccount />} />
            <Route path="/account/switch/add" element={<SwitchAdd />} />
            <Route path="/account/switch/update" element={<SwitchUpdate />} />
            

            <Route path="/export" element={<ExportIndex />} />
            <Route path="/export/privateKey" element={<ExportPrivateKey />} />
            <Route path="/export/mnemonic" element={<ExportMnemonic />} />

            <Route path="/import/randomMnemonic" element={<RandomMnemonic />} />
            <Route path="/import/fromprivatekey" element={<FromPrivatekey />} />
            <Route path="/import/frommnemonic" element={<FromMnemonic />} />

            <Route path="/krc20" element={<Krc20Index />} />
            <Route path="/krc20/opinfo" element={<OpInfo />} />
            <Route path="/krc20/mint" element={<Mint />} />
            <Route path="/krc20/mintConfirm" element={<MintConfirm />} />
            <Route path="/krc20/mintResult" element={<MintResult />} />
            <Route path="/krc20/deploy" element={<Deploy />} />
            <Route path="/krc20/deployConfirm" element={<DeployConfirm />} />
            <Route path="/krc20/deployResult" element={<DeployResult />} />

            <Route path="/tx/send" element={<Send />} />
            <Route path="/tx/sign" element={<Sign />} />
            <Route path="/tx/result" element={<Result />} />
            <Route path="/tx/chooseToken" element={<ChooseToken />} />
            <Route path="/tx/info" element={<Info />} />

            <Route path="/setting" element={<Setting />} />
            <Route path="/contact/index" element={<ContactIndex />} />
            <Route path="/contact/add" element={<ContactAdd />} />
            <Route path="/contact/update" element={<ContactUpdate />} />
            <Route path="/network/index" element={<NetworkIndex />} />
            <Route path="/network/update" element={<NetworkUpdate />} />
            <Route path="/setting/more" element={<More />} />
            <Route path="/setting/donation" element={<Donation />} />
            <Route path="/setting/changepwd" element={<ChangePwd />} />
            <Route path="/setting/autolock" element={<AutoLock />} />
          </Route>{/**/}



          <Route path="/evokeBoost" element={<EvokeBoost />} >
            <Route path="notification/unlock" element={  <NotificationUnlock /> } />
            <Route path="notification/sendkaspa" element={<NotificationSendKaspa />} />
            <Route path="notification/connect" element={<Connect />} />
            <Route path="notification/history" element={<History />} />
            <Route path="notification/network" element={<SwitchNetwork />} />
            <Route path="notification/sign" element={<SignInfo />} />
          </Route>

          <Route path="*" element={<Nopage />} />
        </Routes>
    </HashRouter>
  );
};

export default AppRouter