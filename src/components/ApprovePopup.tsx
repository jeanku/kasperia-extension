import { Button, Popup } from "antd-mobile";
import { SvgIcon } from "@/components/Icon";
import { useClipboard } from "@/components/useClipboard";
import { formatAddress } from "@/utils/util";
import { StableCoinItem } from "@/types/type";
import { TransactionRequest } from "ethers/src.ts/providers/provider";

type ApprovePopupProps = {
    visible: boolean;
    loading: boolean;
    fromData?: StableCoinItem | null;
    toData?: StableCoinItem | null;
    amount: string;
    unSignedTx: TransactionRequest | null;
    onClose: () => void;
    onReject: () => void;
    onApprove: () => void;
};

const ApprovePopup = ({
    visible,
    loading,
    fromData,
    toData,
    amount,
    unSignedTx,
    onClose,
    onReject,
    onApprove,
}: ApprovePopupProps) => {
    const { handleCopy } = useClipboard();

    return (
        <Popup
            bodyClassName="approve-popup-body"
            showCloseButton
            bodyStyle={{
                height: "80vh",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                overflowY: "auto",
            }}
            visible={visible}
            onMaskClick={onClose}
            onClose={onClose}
        >
            <div className="popup-title">
                <h6>Approve Info</h6>
            </div>
            <article className="popup-box-auto assets-details">
                <div className="history-box">
                    <div className="history-token-item">
                        <span>Network</span>
                        <em>{fromData?.networkName || ""}</em>
                    </div>
                    <div className="history-token-item">
                        <span>Method</span>
                        <em>approve</em>
                    </div>
                    <div className="history-token-item">
                        <span>Token Address</span>
                        <em>
                            {formatAddress(fromData?.token || "", 6)}
                            <SvgIcon
                                onClick={() => handleCopy(fromData?.token || "")}
                                iconName="IconCopy"
                                offsetStyle={{ marginLeft: "5px", marginRight: "-12px" }}
                            />
                        </em>
                    </div>
                    <div className="history-token-item">
                        <span>Approve To</span>
                        <em>
                            {formatAddress(toData?.address || "", 6)}
                            <SvgIcon
                                onClick={() => handleCopy(toData?.address || "")}
                                iconName="IconCopy"
                                offsetStyle={{ marginLeft: "5px", marginRight: "-12px" }}
                            />
                        </em>
                    </div>
                    <div className="history-token-item">
                        <span>Approve Amount</span>
                        <em>
                            {amount} {fromData?.symbol}
                        </em>
                    </div>
                    <div className="tx-confirm-box">
                        <h6 className="sub-tit mt15">Sign Message</h6>
                        <div className="tx-confirm-content">
                            <div className="tx-confirm-data">
                                {unSignedTx && JSON.stringify(unSignedTx, null, 8)}
                            </div>
                        </div>
                    </div>
                </div>
            </article>
            <div className="btn-pos-two flexd-row post-bottom">
                <Button block size="large" onClick={onReject}>
                    Reject
                </Button>
                <Button
                    block
                    size="large"
                    color="primary"
                    onClick={onApprove}
                    loading={loading}
                    loadingText="Approving"
                >
                    Approve
                </Button>
            </div>
        </Popup>
    );
};

export default ApprovePopup;