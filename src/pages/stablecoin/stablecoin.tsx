import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Mask, Popup, } from "antd-mobile";
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
import { useClipboard } from '@/components/useClipboard';

import { TransactionRequest } from "ethers/src.ts/providers/provider";


import { AccountEvm } from "@/chrome/accountEvm";
import { EvmNetwork } from '@/model/evm'
import { Evm } from "@/chrome/evm";
import { RootState } from "@/store";
import { formatAddress, formatBalanceFixed } from "@/utils/util";
import { ChainListTestnet, ChainListMainnet, StableCoinMainTokenList, StableCoinTestnetTokenList, FixDecimal } from '@/types/constant'
import { TokenListItem, ChainConfig, StableCoinItem, EvmNetworkItem } from "@/types/type";

type NetworkModalType = 'add' | 'switch';
type NetworkModalState = {
    type: NetworkModalType;
    content: string;
    targetChain: MergedChainItem;
};

type SelectTokenState = {
    type: 'from' | 'to';
    symbol: string;
};

type MergedChainItem = ChainConfig & {
    exists: boolean;
    networkName?: string;
    estTime: string
    fSymbol: string;
};

type BridgeParams = {
    fromAddress: string;
    toAddress: string;
    amountWei: bigint;
    amount: string;
    token: string;
    networkName?: string;
    symbol?: string;
    explorer?: string;
    toChainId?: number;
    bridgeAddress: string;
};

const Stablecoin = () => {
    const navigate = useNavigate();
    const { handleCopy } = useClipboard();
    const { noticeSuccess, noticeError } = useNotice();

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

    const ChainList = ChainListTestnet
    const TokenList = StableCoinTestnetTokenList
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

    const switchingRef = useRef(false);
    const updateUI = (key: keyof typeof uiState, value: boolean) => {
        setUiState(prev => ({ ...prev, [key]: value }));
    };

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
        if (!amount) return ''
        const feeVal = fromData?.baseFee.toString() || '0'
        const amountBN = ethers.parseUnits(amount.toString(), 8);
        const feeBN = ethers.parseUnits(feeVal, 8);
        const val = Number(ethers.formatUnits(amountBN - feeBN, 8))
        if (val <= 0 || isNaN(val)) return '0'
        return val.toString()
    }, [amount, fromData?.baseFee])

    const mergeChains = useCallback((walletChains: EvmNetworkItem[]) => {
        const map = new Map(walletChains.map(n => [n.chainId, n]));
        return ChainList.map(chain => {
            const match = map.get(chain.chainId.toString());
            return {
                ...chain,
                networkName: match?.name ?? chain.name,
                exists: !!match,
            };
        });
    }, [ChainList]);

    const fetchAllowance = useCallback(async () => {
        if (!fromData) return
        const fromItem = ChainList.find(item => item.chainId === fromData.chainId);
        const { token = '', bridgeAddress = '' } = fromItem!;
        if (!token || !bridgeAddress || !fromData.address || allowanceLoading) return;
        try {
            setAllowanceLoading(true);
            const val = await AccountEvm.getTokenAllowance(
                fromData.address,
                token,
                bridgeAddress
            );
            setAllowance(val);
        } catch {
            setAllowance(0n);
        } finally {
            setAllowanceLoading(false);
        }
    }, [fromData?.address, fromData?.chainId]);

    const fetchBalance = useCallback(async (data: typeof fromData) => {
        if (!data?.address || !data?.token) return;
        try {
            const bal = await AccountEvm.getTokenBalance(
                data.address,
                data.token,
                data.decimals
            );
            setFromData((prev) => prev ? { ...prev, balance: formatBalanceFixed(bal, FixDecimal) } : prev);
        } catch (error) {
            console.log('error', error)
        }
    }, []);

    const showNetworkModal = (target: MergedChainItem): void => {
        setNetworkIsUsable(false);
        setVisibleMask(true);
        const modalState: NetworkModalState = !target.exists
            ? {
                type: 'add',
                content: 'The current network does not support it. Please add a network',
                targetChain: target,
            }
            : {
                type: 'switch',
                content: 'The current network does not support it. Please switch networks',
                targetChain: target,
            };
        setNetworkModal(modalState);
    };

    const buildFromData = (currentSupported: MergedChainItem, fromToken?: TokenListItem): StableCoinItem => {
        return {
            ...currentSupported,
            chainId: Number(currentSupported.chainId),
            address: evmAddress,
            symbol: fromToken?.symbol!,
            baseFee: fromToken?.baseFee || 0,
            fSymbol: currentSupported.fSymbol,
            name: fromToken?.name! || currentSupported.name!,
            networkName: currentSupported.networkName!,
            estTime: currentSupported.estTime!,
            balance: '0',
        };
    };
    const buildToData = (targetChain: MergedChainItem, toToken?: TokenListItem): StableCoinItem => {
        return {
            ...targetChain,
            name: targetChain.name || '',
            symbol: toToken?.symbol || '',
            chainId: Number(targetChain.chainId),
            address: evmAddress,
            baseFee: toToken?.baseFee || 0,
            fSymbol: targetChain.fSymbol,
            networkName: targetChain.networkName!,
            balance: '0',
        };
    };

    const getChainInfo = (network: { chainId: string }) => {
        const mergedChains: MergedChainItem[] = mergeChains(networkList) as MergedChainItem[];
        const currentSupported = mergedChains.find((c) => c.chainId.toString() === network.chainId);
        const targetChain = mergedChains.find((item) => item.chainId.toString() !== currentSupported?.chainId?.toString());
        return {
            mergedChains,
            currentSupported,
            targetChain,
        };
    };

    const validateApprove = (fromItem: ChainConfig, currentFromData: StableCoinItem, currentAmount: string): boolean => {
        const minAmount = fromItem.minAmount || 0;
        if (Number(currentFromData.balance) < Number(currentAmount)) {
            noticeError('Current balance is insufficient');
            return false;
        }
        if (!currentAmount || Number(currentAmount) < Number(minAmount)) {
            noticeError(`Min Amount: ${minAmount}`);
            return false;
        }
        return true;
    };
    const buildBridgeParams = (fromItem: ChainConfig, spender: string, amountWei: bigint): BridgeParams => {
        return {
            fromAddress: fromData?.address || '',
            toAddress: spender,
            amountWei,
            amount,
            token: fromItem.token || '',
            networkName: fromData?.networkName,
            symbol: fromData?.symbol,
            explorer: fromItem.blockExplorerUrl,
            toChainId: toData?.chainId,
            bridgeAddress: fromItem.bridgeAddress || '',
        };
    };

    const initNetwork = async (): Promise<void> => {
        const network = await Evm.getSelectedNetwork();
        if (!network) return;

        const { mergedChains, currentSupported, targetChain } = getChainInfo(network);
        if (!currentSupported) {
            const fallbackTarget = mergedChains[0];
            if (!fallbackTarget) return;
            showNetworkModal(fallbackTarget);
            return;
        }

        setNetworkIsUsable(true);
        const fromToken = TokenList.find((item) => item.name === currentSupported.name);
        const fromNewData = buildFromData(currentSupported, fromToken);
        const selectTokenState: SelectTokenState = {
            type: 'from',
            symbol: currentSupported.fSymbol,
        };

        setSelectToken(selectTokenState);
        setFromData(fromNewData);
        fetchBalance(fromNewData);
        if (!targetChain) return;
        const toToken = TokenList.find((item) => item.name === targetChain.name);
        const newToData = buildToData(targetChain, toToken);
        setToData(newToData);
    };
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
            setVisibleMask(true)
            return
        }
        if (!fromData || !toData || switching) return;
        setSwitching(true)
        try {
            const newFrom = { ...toData }
            setFromData(toData);
            setToData(fromData);
            setAmount("");
            await switchNetwork(newFrom.chainId.toString())
            fetchBalance(newFrom)
        } finally {
            setSwitching(false)
        }
    }

    const approveFun = async (): Promise<void> => {
        if (!networkIsUsable) {
            setVisibleMask(true);
            return;
        }
        if (btnLoading || !fromData) return;

        const fromItem = ChainList.find((item) => item.chainId === fromData.chainId);
        if (!fromItem) return;

        const isValid = validateApprove(fromItem, fromData, amount);
        if (!isValid) return;

        const spender = toData?.address || evmAddress;
        const amountWei = ethers.parseUnits(amount, fromData.decimals);
        const allowanceWei = ethers.parseUnits(
            allowance.toString(),
            fromData.decimals
        );
        const nextParams = buildBridgeParams(fromItem, spender, amountWei);
        if (allowanceWei >= amountWei) {
            navigate('/stableCoin/stableCoinSendTx', {
                state: nextParams,
            });
            return;
        }
        setBtnLoading(true);
        if (!fromData?.token) return;
        const currentAddress = preference.currentAccount?.ethAddress;
        if (!currentAddress) return;
        try {
            const iface = new ethers.Interface(['function approve(address spender, uint256 amount) returns (bool)']);
            const data = iface.encodeFunctionData('approve', [fromItem.bridgeAddress, amountWei]);
            const unSignedTx = await AccountEvm.createContractTx({
                from: currentAddress,
                to: fromData.token,
                data,
                value: '0',
            });
            setUnSignedTx(unSignedTx)
        } finally {
            updateUI('approveVisible', true)
            setBtnLoading(false);
        }
    };

    const sendApprove = async() => {
        if(!unSignedTx || !fromData || uiState.approveBtnLoading) return
        updateUI('approveBtnLoading', true)
        try {
            const amountWei = ethers.parseUnits(amount, fromData.decimals);
            const fromItem = ChainList.find((item) => item.chainId === fromData.chainId);
            const nextParams = buildBridgeParams(fromItem!, toData?.address!, amountWei);
            const hash = await AccountEvm.sendTransaction(unSignedTx);
            if (!hash) return;
            navigate('/stableCoin/stableCoinSendTx', {
                state: {
                    ...nextParams,
                    token: fromData.token,
                },
            });
        } finally {
            updateUI('approveBtnLoading', false)
        }
    }

    const addNetwork = (networkInfo: ChainConfig) => {
        if (networkInfo && networkInfo.chainId) {
            setNewNetwork({
                name: networkInfo.name || '',
                rpcUrl: [networkInfo.rpcUrl],
                chainId: networkInfo.chainId.toString(),
                symbol: networkInfo.fSymbol!,
                decimals: 18,
                explorer: networkInfo.blockExplorerUrl || '',
            })
            setVisibleMask(false)
            updateUI('networkPopup', true)
        }
    }

    const switchNetwork = async (chainId: string) => {
        if (!chainId) return;
        try {
            let network = networkList.find(item => item.chainId === chainId)
            if (!network) {
                throw Error("network index invalid")
            }
            await Evm.setSelectedNetwork(chainId)
            setVisibleMask(false)
            initNetwork()
        } catch (error) {
            console.log('error', error)
            noticeError(error)
        }
    }

    useEffect(() => {
        if (!fromData?.token || !fromData?.address) return;
        void fetchAllowance();
    }, [fromData?.address, fromData?.chainId, fromData?.token]);

    useEffect(() => {
        const fetchNetworks = async () => {
            const res = await Evm.getNetworks()
            setNetworkList(res || [])
        }
        void fetchNetworks()
    }, [])

    useEffect(() => {
        if (!networkList.length) return;
        void initNetwork();
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
                                width={28}
                                height={28}
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
                            <span>
                                <BankcardOutline /> {fromData?.balance || 0}
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
                                width={28}
                                height={28}
                                marginRight={"3"}
                            />
                            <span>{toData?.symbol}</span>
                        </div>
                    </div>
                    <span className="">
                        {(toData?.networkName || toData?.name) || "Not Network"}
                    </span>
                </div>
                <div className="history-box mt20">
                    <div className="history-token-item">
                        <span>Est. Time</span>
                        <em>{fromData?.estTime || '-'} minute</em>
                    </div>
                    <div className="history-token-item">
                        <span>Service Fee</span>
                        <em>{fromData?.baseFee || 0}</em>
                    </div>
                </div>

                {/* submit */}
                <div className="btn-pos-two post-bottom">
                    <Button
                        block
                        size="large"
                        color="primary"
                        loading={btnLoading}
                        loadingText="Submitting..."
                        disabled={!amount || !toAmount || !networkIsUsable}
                        onClick={approveFun}
                    >
                        Bridge
                    </Button>
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
                        <div className="remove-nox-content">
                            <p className="remove-tip">{networkModal.content}</p>
                            <div className="remove-btns">
                                <Button onClick={() => setVisibleMask(false)}>Cancel</Button>
                                <Button color='primary' onClick={() => {
                                    if (networkModal.type === 'add') {
                                        addNetwork(networkModal.targetChain!)
                                    } else {
                                        switchNetwork(networkModal.targetChain!.chainId.toString())
                                    }
                                }}>Confirm</Button>
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
                    if (type === 'success') {
                        initNetwork()
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

            {/* Approve Popup */}
            <Popup
                bodyClassName="approve-popup-body"
                showCloseButton
                bodyStyle={{
                    height: '80vh',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    overflowY: 'auto',
                }}
                visible={uiState.approveVisible}
                onMaskClick={() => {
                    updateUI('approveVisible', false)
                }}
                onClose={() => {
                    updateUI('approveVisible', false)
                }}
            >
                <div className='popup-title'>
                    <h6>Approve Info</h6>
                </div>
                <article className='popup-box-auto assets-details'>
                    <div className="history-box">
                        <div className="history-token-item">
                            <span>Network</span>
                            <em>{ fromData?.networkName || ''}</em>
                        </div>
                        <div className="history-token-item">
                            <span>Method</span>
                            <em>approve</em>
                        </div>
                        <div className="history-token-item">
                            <span>Token Address</span>
                            <em>{formatAddress(fromData?.token || '', 6) } <SvgIcon onClick={() => handleCopy(fromData?.token || "")} iconName="IconCopy" offsetStyle={{ marginLeft: '5px', marginRight: '-12px' }} /></em>
                        </div>
                        <div className="history-token-item">
                            <span>Approve To</span>
                            <em>{ formatAddress(toData?.address || '', 6) } <SvgIcon onClick={() => handleCopy(toData?.address || "")} iconName="IconCopy" offsetStyle={{ marginLeft: '5px', marginRight: '-12px' }} /></em>
                        </div>
                        <div className="history-token-item">
                            <span>Approve Amount</span>
                            <em>{ amount } { fromData?.symbol}</em>
                        </div>
                        <div className="tx-confirm-box">
                            <h6 className="sub-tit mt15">Sign Message</h6>
                            <div className="tx-confirm-content">
                                <div className="tx-confirm-data">
                                    { unSignedTx && JSON.stringify(unSignedTx, null, 8) }
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" 
                    onClick={() => {
                        updateUI('approveVisible', false)
                        updateUI('approveBtnLoading', false)
                    }}
                    >
                        Reject
                    </Button>
                    <Button block size="large" color="primary"
                        onClick={() => sendApprove()}
                        loading={uiState.approveBtnLoading}
                        loadingText={'Approving...'}>
                        Approve
                    </Button>
                </div>
            </Popup>
        </div>
    );
};

export default Stablecoin;