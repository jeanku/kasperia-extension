import { Popup } from "antd-mobile";
import TokenImg from "@/components/TokenImg";
import { SvgIcon } from "@/components/Icon";
import { formatAddress } from "@/utils/util";
import { TokenListItem } from "@/types/type";

interface Props {
    visible: boolean;
    tokenList: TokenListItem[];
    selectedToken?: string;
    onClose: () => void;
    onSelect: (item: TokenListItem) => void;
}

const SelectTokenPopup = ({
    visible,
    tokenList,
    selectedToken,
    onClose,
    onSelect,
}: Props) => {
    return (
        <Popup
            className="wallet-popup"
            bodyClassName="wallet-popup-body"
            showCloseButton
            bodyStyle={{
                height: "55vh",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                overflowY: "auto",
            }}
            visible={visible}
            onMaskClick={onClose}
            onClose={onClose}
        >
            <article className="popup-box">
                <div className="popup-title">
                    <h6>Select Token</h6>
                </div>
                <div className="contact-list">
                    <div className="contact-list-box">
                        {tokenList?.map((item) => (
                            <div
                                key={`${item.name}-${item.symbol}-${item.token}`}
                                className="contact-list-item flex-row cb ac mb12"
                                onClick={() => onSelect(item)}
                            >
                                <div className="flex2 flex-row">
                                    <TokenImg
                                        url={item.symbol!}
                                        name={item.symbol!}
                                        width={40}
                                        height={40}
                                        marginRight={"8"}
                                    />
                                    <div>
                                        <span>{item.symbol}</span>
                                        <em>{formatAddress(item.token, 8)}</em>
                                    </div>
                                </div>

                                {selectedToken === item.token && (
                                    <SvgIcon iconName="IconRight" size={20} color="#4AD961" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </article>
        </Popup>
    );
};

export default SelectTokenPopup;