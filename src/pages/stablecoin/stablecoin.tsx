import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Mask, } from "antd-mobile";
import { BankcardOutline } from "antd-mobile-icons";
import { ethers } from "ethers";

import HeadNav from "@/components/HeadNav";
import NumberInput from "@/components/NumberInput";
import TokenImg from "@/components/TokenImg";
import AddressSelectPopup from "@/components/AddressSelectPopup";
import { SvgIcon } from "@/components/Icon";
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import NetworkFormPopup from '@/components/NetworkFormPopup'
import SelectTokenPopup from "@/components/SelectTokenPopup";
import ApprovePopup from '@/components/ApprovePopup';

import { AccountEvm } from "@/chrome/accountEvm";
import { EvmNetwork } from '@/model/evm'
import { Evm } from "@/chrome/evm";
import { RootState } from "@/store";
import { TransactionRequest } from "ethers/src.ts/providers/provider";
import { formatAddress, formatBalanceFixed } from "@/utils/util";
import { ChainList, TokenList, FixDecimal } from '@/types/constant'
import { TokenListItem, ChainConfig, StableCoinItem, EvmNetworkItem } from "@/types/type";

type MergedChainItem = ChainConfig & {
    exists: boolean;
    networkName?: string;
    estTime: string;
    fSymbol: string;
};

type NetworkModalState = {
    type: "add" | "switch";
    content: string;
    targetChain: MergedChainItem;
};

const Stablecoin = () => {
    const navigate = useNavigate();
    const { noticeError } = useNotice();

    const { preference } = useSelector((state: RootState) => state.preference);
    const evmAddress = preference.currentAccount?.ethAddress ?? "";

    const [amount, setAmount] = useState<string>('');
    const [networkIsUsable, setNetworkIsUsable] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [visibleMask, setVisibleMask] = useState<boolean>(false);
    const [switching, setSwitching] = useState(false);
    const [allowanceLoading, setAllowanceLoading] = useState(false);
    const [uiState, setUiState] = useState({
        networkPopup: false,
        addressPopup: false,
        tokenPopup: false,
        approveVisible: false,
        approveBtnLoading: false,
    });

    const [toData, setToData] = useState<StableCoinItem | null>();
    const [fromData, setFromData] = useState<StableCoinItem | null>();
    const [networkList, setNetworkList] = useState<EvmNetworkItem[]>([])
    const [unSignedTx, setUnSignedTx] = useState<TransactionRequest | null>(null);

    const [allowance, setAllowance] = useState<bigint>(0n);
    const [selectToken, setSelectToken] = useState<{ type: 'from' | 'to', symbol: string }>({ type: 'from', symbol: '' });
    const [networkModal, setNetworkModal] = useState<{ type: 'add' | 'switch' | null, content: string, targetChain?: ChainConfig }>({ type: null, content: '' })
    const [newNetwork, setNewNetwork] = useState<EvmNetwork>({
        name: "",
        rpcUrl: [],
        decimals: 18,
        chainId: "",
        symbol: "",
        explorer: "",
    })

    const updateUI = useCallback((key: keyof typeof uiState, value: boolean) => {
        setUiState((prev) => ({ ...prev, [key]: value }));
    }, []);

    const tokenList = useMemo(() => {
        return TokenList.filter(item => item.fSymbol === selectToken.symbol);
    }, [TokenList, selectToken.symbol]);

    const historyChainId = useMemo(() => {
        const isKasplex = newNetwork.name.toLowerCase().includes('kasplex') ?
            ChainList.find(c => c.name === newNetwork.name)?.chainId :
            ChainList.find(c => !c.name.toLowerCase().includes('kasplex'))?.chainId
        return isKasplex
    }, [newNetwork.chainId, newNetwork.name])

    const toAmount = useMemo(() => {
        if (!amount) return "";
        const feeVal = fromData?.baseFee?.toString() || "0";
        const amountBN = ethers.parseUnits(amount.toString(), 8);
        const feeBN = ethers.parseUnits(feeVal, 8);
        const val = Number(ethers.formatUnits(amountBN - feeBN, 8));
        if (val <= 0 || Number.isNaN(val)) return "0";
        return val.toString();
    }, [amount, fromData?.baseFee]);

    const mergeChains = (walletChains: EvmNetworkItem[]) => {
        return ChainList.map(chain => {
            const match = walletChains.find((n) => n.chainId === chain.chainId.toString());
            return {
                ...chain,
                networkName: match?.name ?? chain.name,
                exists: !!match,
            };
        })
    }

    const fetchAllowance = useCallback(async () => {
        if (!fromData?.address || !fromData?.token) return;
        const fromItem = ChainList.find((item) => item.chainId === fromData.chainId);
        const bridgeAddress = fromItem?.bridgeAddress || "";
        if (!bridgeAddress || allowanceLoading) return;

        try {
            setAllowanceLoading(true);
            const val = await AccountEvm.getTokenAllowance(
                fromData.address,
                fromData.token,
                bridgeAddress
            );
            setAllowance(val);
        } catch {
            setAllowance(0n);
        } finally {
            setAllowanceLoading(false);
        }
    }, [fromData?.address, fromData?.token, allowanceLoading]);

    const balanceReqKeyRef = useRef<string>("");
    const fetchBalance = useCallback(async (data: StableCoinItem | null | undefined) => {
        if (!data?.address || !data?.token) return;

        const requestKey = `${data.chainId}_${data.address}_${data.token}`;

        if (balanceReqKeyRef.current === requestKey) return;
        balanceReqKeyRef.current = requestKey;
        const run = async () => {
            const bal = await AccountEvm.getTokenBalance(
                data.address,
                data.token,
                data.decimals
            );
            return formatBalanceFixed(bal, FixDecimal);
        };

        try {
            let balance = "";
            try {
                balance = await run();
            } catch {
                await new Promise((resolve) => setTimeout(resolve, 500));
                balance = await run();
            }
            setFromData((prev) => {
                if (!prev) return prev;
                if (prev.chainId !== data.chainId || prev.address !== data.address || prev.token !== data.token) {
                    return prev;
                }
                return { ...prev, balance };
            });
        } finally {
            if (balanceReqKeyRef.current === requestKey) {
                balanceReqKeyRef.current = "";
            }
        }
    }, []);

    const sendApprove = async () => {
        if (!unSignedTx || !fromData || !toData || uiState.approveBtnLoading) return;
        updateUI("approveBtnLoading", true);
        try {
            const amountWei = ethers.parseUnits(amount, fromData.decimals);
            const fromItem = ChainList.find((item) => item.chainId === fromData.chainId);
            if (!fromItem) return;
            const nextParams = buildBridgeParams(fromItem, toData.address, amountWei);
            const hash = await AccountEvm.sendTransaction(unSignedTx);
            if (!hash) return;
            navigate("/stableCoin/stableCoinSendTx", { state: { ...nextParams, token: fromData.token } });
        } finally {
            updateUI("approveBtnLoading", false);
        }
    }

    const showNetworkModal = useCallback((target: MergedChainItem): void => {
        const modalState: NetworkModalState = !target.exists ? {
            type: "add",
            content: "The selected network hasn't been added to your wallet yet. Please add it to continue.",
            targetChain: target,
        }
            : {
                type: "switch",
                content: "The current network does not support it. Please switch networks",
                targetChain: target,
            };
        setNetworkModal(modalState);
        setNetworkIsUsable(false);
        setVisibleMask(true);
    }, []);

    const initNetwork = async (list?: EvmNetworkItem[]) => {
        const network = await Evm.getSelectedNetwork();
        if (!network) return;
        const mergedChains = mergeChains(list || networkList);
        const currentSupported = mergedChains.find((c) => c.chainId.toString() === network.chainId);

        if (!currentSupported) {
            const target = mergedChains[0];
            showNetworkModal(target);
            return;
        }
        setNetworkIsUsable(true);
        const fromToken = TokenList.find((item) => item.name === currentSupported.name);
        const toData = mergedChains.find((item) => item.chainId.toString() !== currentSupported.chainId.toString());

        const fromNewData = {
            ...currentSupported,
            chainId: Number(currentSupported.chainId),
            address: evmAddress,
            baseFee: fromToken?.baseFee || 0,
            fSymbol: currentSupported.fSymbol,
            networkName: currentSupported.networkName,
            balance: "0",
        };

        setSelectToken({ type: "from", symbol: currentSupported.fSymbol });
        setFromData(fromNewData);
        fetchBalance(fromNewData);

        if (toData) {
            const toToken = TokenList.find((item) => item.name === toData.name);
            const newToData = {
                ...toData,
                name: toData?.name || "",
                chainId: Number(toData?.chainId!),
                address: evmAddress,
                baseFee: toToken?.baseFee || 0,
                fSymbol: toData?.fSymbol!,
                networkName: toData?.networkName!,
                balance: "0",
            };
            setToData(newToData);
        }
    };

    const buildBridgeParams = useCallback((fromItem: ChainConfig, spender: string, amountWei: bigint) => {
        return {
            fromAddress: fromData?.address || "",
            toAddress: spender,
            amountWei,
            amount,
            token: fromData?.token || "",
            networkName: fromData?.networkName,
            symbol: fromData?.symbol,
            explorer: fromItem.blockExplorerUrl,
            toChainId: toData?.chainId,
            bridgeAddress: fromItem.bridgeAddress || "",
        };
    }, [amount, fromData?.address, fromData?.token, toData?.chainId,]);
    const setToken = (item: TokenListItem) => {
        if (selectToken.type === 'from' && fromData) {
            if (item.symbol !== fromData.symbol) {
                const newFrom = {
                    ...fromData,
                    balance: '0',
                    token: item.token,
                    symbol: item.symbol,
                    decimals: item.decimals,
                };
                setFromData(newFrom);
                setAmount('')
                if (!toData) return
                const toToken = TokenList.find(token => token.symbol === item.symbol && token.fSymbol === toData.fSymbol)
                if (toToken) {
                    setToData((prev) => prev ? { ...prev, token: toToken.token, symbol: toToken.symbol, decimals: toToken.decimals } : prev);
                }
                fetchBalance(newFrom)
            }
        }
        updateUI('tokenPopup', false)
    }

    const switchInfo = async () => {
        if (!networkIsUsable) {
            setVisibleMask(true);
            return;
        }
        if (!fromData || !toData || switching) return;
        const mergedChains = mergeChains(networkList);
        const target = mergedChains.find((item) => item.chainId.toString() === toData.chainId.toString());
        if (!target) return;
        if (!target.exists) {
            showNetworkModal(target);
            return;
        }
        setSwitching(true);
        try {
            const newFrom = { ...toData };
            setFromData(toData);
            setToData(fromData);
            setAmount("");
            await switchNetwork(newFrom.chainId.toString(), false);
            void fetchBalance(newFrom);
        } finally {
            setSwitching(false);
        }
    };

    const approveFun = async () => {
        if (!networkIsUsable) {
            setVisibleMask(true)
            return
        }
        if (!fromData || btnLoading) return
        const fromItem = ChainList.find(item => item.chainId === fromData?.chainId)
        if (!fromItem) return
        const { minAmount = 0 } = fromItem!
        if (Number(fromData?.balance) < Number(amount)) {
            noticeError(`Current balance is insufficient`)
            return
        }
        if (!amount || Number(amount) < Number(minAmount)) {
            noticeError(`Min Amount: ${minAmount}`)
            return
        }
        const spender = toData?.address || evmAddress;
        const amountWei = ethers.parseUnits(amount, fromData.decimals);
        const allowanceWei = ethers.parseUnits(allowance.toString(), fromData.decimals);
        const nextParams = buildBridgeParams(fromItem, spender, amountWei);
        if (allowanceWei >= amountWei) {
            navigate("/stableCoin/stableCoinSendTx", { state: nextParams });
            return;
        }
        if (!fromData.token) return;
        const currentAddress = preference.currentAccount?.ethAddress;
        if (!currentAddress) return;
        setBtnLoading(true);

        try {
            const iface = new ethers.Interface(["function approve(address spender, uint256 amount) returns (bool)"]);
            const data = iface.encodeFunctionData("approve", [
                fromItem.bridgeAddress,
                amountWei,
            ]);
            const tx = await AccountEvm.createContractTx({
                from: currentAddress,
                to: fromData.token,
                data,
                value: "0",
            });

            setUnSignedTx(tx);
        } finally {
            updateUI("approveVisible", true);
            setBtnLoading(false);
        }
    }

    const addNetwork = (networkInfo: ChainConfig) => {
        if (networkInfo && networkInfo.chainId) {
            setNewNetwork({
                name: networkInfo.name || '',
                rpcUrl: networkInfo.rpcUrl,
                chainId: networkInfo.chainId.toString(),
                symbol: networkInfo.fSymbol!,
                decimals: 18,
                explorer: networkInfo.blockExplorerUrl || '',
            })
            setVisibleMask(false)
            updateUI('networkPopup', true)
        }
    }

    const switchNetwork = async (chainId: string, isInit: boolean = false) => {
        if (!chainId) return;
        try {
            const network = networkList.find((item) => item.chainId === chainId);
            if (!network) { throw Error("network index invalid"); }
            await Evm.setSelectedNetwork(chainId);
            setVisibleMask(false);
            if(isInit) {
                await initNetwork();
            }
        } catch (error) {
            noticeError(error);
        }
    };

    useEffect(() => {
        if (!fromData?.token || !fromData?.address) return;
        fetchAllowance();
    }, [
        fromData?.chainId,
        fromData?.token,
        fromData?.address,
    ]);

    useEffect(() => {
        const fetchNetworks = async () => {
            const res = await Evm.getNetworks()
            setNetworkList(res || [])
        }
        fetchNetworks()
    }, [])

    useEffect(() => {
        if (!networkList.length) return;
        initNetwork();
    }, [networkList]);

    return (
        <div className="page-box">
            <HeadNav
                title="StableCoin Bridge"
                rightType="history"
                state={{ chainId: historyChainId }}
                url='/stableCoin/stableCoinHistory'
                onBack={() => navigate("/home")}
            />
            <div className="content-main assets-details">
                {/* FROM */}
                <div className="card-box">
                    <div className="card-title flex-row cb as">
                        <span>From</span>
                        <em>{formatAddress(fromData?.address, 8)}</em>
                    </div>
                    <div className="flex-row cb ac mb12 mt30">
                        <NumberInput
                            value={amount}
                            onChange={(v) => setAmount(v.toString())}
                            decimalPlaces={fromData?.decimals}
                            max={Number(fromData?.balance)}
                            placeholder="amount"
                            style={{ flex: 2, fontSize: '14px', color: 'white', }}
                        />
                        <div
                            className="bridge-token-img-box"
                            onClick={() => {
                                if (!networkIsUsable) {
                                    setVisibleMask(true)
                                    return
                                }
                                setSelectToken({ type: 'from', symbol: fromData?.fSymbol || '' })
                                updateUI('tokenPopup', true)
                            }}
                        >
                            <TokenImg
                                url={fromData?.symbol ?? ""}
                                name={fromData?.symbol ?? ""}
                                width={30}
                                height={30}
                                marginRight={"3"}
                            />
                            <span>{fromData?.symbol}</span>
                        </div>
                    </div>
                    <div className="mt15 flex-row cb ac">
                        <span className="max-100 one-line">
                            {(fromData?.networkName || fromData?.name) || "Not Network"}
                        </span>
                        <div className="sub-tit mb0import">
                            <strong className="mr5" onClick={() => setAmount(fromData?.balance! || '')}>MAX</strong>
                            <span><BankcardOutline /> {fromData?.balance || 0}</span>
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
                        <p className="hover-text" onClick={() => updateUI('addressPopup', true)}>
                            {formatAddress(toData?.address, 8)}
                        </p>
                    </div>
                    <div className="flex-row cb ac mb12 mt30">
                        <NumberInput
                            value={toAmount.toString()}
                            disabled
                            onChange={(e) => { }}
                            decimalPlaces={toData?.decimals}
                            placeholder="to amount"
                            style={{ flex: 2, fontSize: '14px', color: 'white', }}
                        />
                        <div className="bridge-token-img-box">
                            <TokenImg
                                url={toData?.symbol ?? ""}
                                name={toData?.symbol ?? ""}
                                width={30}
                                height={30}
                                marginRight={"3"}
                            />
                            <span>{toData?.symbol}</span>
                        </div>
                    </div>
                    <span className="">
                        {(toData?.networkName || toData?.name) || "Not Network"}
                    </span>
                </div>
                {/* submit */}
                <div className="btn-pos-two post-bottom">
                    <Button
                        block
                        size="large"
                        color="primary"
                        loading={btnLoading}
                        disabled={!amount || !toAmount || !networkIsUsable}
                        onClick={approveFun}
                    >Bridge</Button>
                </div>
            </div>
            {/* address popup */}
            <AddressSelectPopup
                visible={uiState.addressPopup}
                isKaspa={false}
                showAdd={true}
                isUpdata
                onClose={() => updateUI('addressPopup', false)}
                onSelect={(res) =>
                    setToData((prev) =>
                        prev ? { ...prev, address: res.address } : prev
                    )
                }
                onSave={address => {
                    setToData((prev) =>
                        prev ? { ...prev, address: address } : prev
                    )
                }}
            />
            <Mask visible={visibleMask} onMaskClick={() => setVisibleMask(false)}>
                <article className="remove-box">
                    <div className="remove-bg">
                        <SvgIcon className="remove-close" onClick={() => setVisibleMask(false)} iconName="IconClose" color="#7F7F7F" />
                        <h3 className="remove-tit">
                            {networkModal.type === "add" ? "Network Not Added" : "Switch Network"}
                        </h3>
                        <div className="remove-nox-content">
                            <p className="remove-tip">{networkModal.content}</p>
                            <div className="remove-btns">
                                <Button onClick={() => setVisibleMask(false)}>Cancel</Button>
                                <Button color='primary' onClick={() => {
                                    if (networkModal.type === 'add') {
                                        addNetwork(networkModal.targetChain!)
                                    } else {
                                        switchNetwork(networkModal.targetChain!.chainId.toString(), true)
                                    }
                                }}>{networkModal.type === "add" ? "Add Network" : "Switch Network"}</Button>
                            </div>
                        </div>
                    </div>
                </article>
            </Mask>

            {/* Add Custom Network  */}
            <NetworkFormPopup
                visible={uiState.networkPopup}
                mode="add"
                data={newNetwork}
                onClose={() => updateUI('networkPopup', false)}
                onSuccess={async (type) => {
                    if (type === "success") {
                        const res = await Evm.getNetworks();
                        const latestNetworks = res || [];
                        setNetworkList(latestNetworks);
                        initNetwork(latestNetworks);
                    }
                }}
            />
            {/* Select Token Popup */}
            <SelectTokenPopup
                visible={uiState.tokenPopup}
                tokenList={tokenList}
                selectedToken={fromData?.token}
                onClose={() => updateUI('tokenPopup', false)}
                onSelect={setToken}
            />

            <ApprovePopup
                visible={uiState.approveVisible}
                loading={uiState.approveBtnLoading}
                fromData={fromData}
                toData={toData}
                amount={amount}
                unSignedTx={unSignedTx}
                onClose={() => updateUI("approveVisible", false)}
                onReject={() => {
                    updateUI("approveVisible", false);
                    updateUI("approveBtnLoading", false);
                }}
                onApprove={() => void sendApprove()}
            />
        </div>
    );
};

export default Stablecoin;