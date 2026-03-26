import { useEffect, useState } from "react";
import { Popup, Input, Button } from "antd-mobile";
import { Evm } from '@/chrome/evm'
import { EvmNetwork } from "@/model/evm";
import { isValidUrl } from "@/utils/util";
import { useNotice } from '@/components/NoticeBar/NoticeBar'

type Props = {
    visible: boolean;
    mode: "add" | "edit";
    data?: EvmNetwork;
    onClose: () => void;
    onSuccess: (type: 'success' | 'error') => void;
};

const defaultForm: EvmNetwork = {
    name: "",
    rpcUrl: [],
    decimals: 18,
    chainId: "",
    symbol: "",
    explorer: "",
};

export default function NetworkFormPopup({
    visible,
    mode,
    data,
    onClose,
    onSuccess,
}: Props) {
    const { noticeError } = useNotice();
    const [form, setForm] = useState<EvmNetwork>(defaultForm);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setForm(data ? { ...data } : defaultForm);
        }
    }, [visible, data]);

    const setField = <K extends keyof EvmNetwork>(
        key: K,
        value: EvmNetwork[K]
    ) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const validate = () => {
        if (!form.name.trim()) throw Error("Please enter a network name");
        if (!form.rpcUrl.length) throw Error("Please enter a rpc url");
        if (!isValidUrl(form.rpcUrl[0])) throw Error("Invalid rpc url");
        if (!form.chainId) throw Error("Please enter a chain id");
        if (!form.symbol) throw Error("Please enter a symbol");
        if (form.explorer && !isValidUrl(form.explorer))
            throw Error("Invalid explorer url");
        if (form.decimals <= 0 || form.decimals > 18)
            throw Error("decimal invalid");
    };

    const handleSave = async () => {
        try {
            validate();
            setLoading(true);

            await Evm.addNetwork(form);
            onSuccess('success');
            setLoading(false);
            onClose();
        } catch (err: any) {
            noticeError(err.message || err);
            setLoading(false);
        }
    };

    return (
        <Popup
            visible={visible}
            className="wallet-popup"
            bodyClassName="wallet-popup-body"
            onMaskClick={onClose}
            onClose={onClose}
            bodyStyle={{
                height: "62vh",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                overflowY: "scroll",
            }}
        >
            <div className="content-main change-pwd padding-top20-imp">
                    <h6 className="sub-tit">Network name</h6>
                    <div className="input-box mb12">
                        <Input
                            value={form.name}
                            maxLength={16}
                            onChange={(v) => setField("name", v)}
                            type="text"
                        />
                    </div>
                    <h6 className="sub-tit">RPC URL</h6>
                    <div className="input-box mb12">
                        <Input
                            value={form.rpcUrl.join(",")}
                            onChange={(v) => setField("rpcUrl", v.trim().split(","))}
                            type="text"
                        />
                    </div>
                    <h6 className="sub-tit">Chain Id</h6>
                    <div className="input-box mb12">
                        <Input
                            value={form.chainId}
                            onChange={(v) => setField("chainId", v)}
                            type="text"
                        />
                    </div>
                    <h6 className="sub-tit">Currency symbol</h6>
                    <div className="input-box mb12">
                        <Input
                            maxLength={8}
                            value={form.symbol}
                            onChange={(v) => setField("symbol", v)}
                            type="text"
                        />
                    </div>

                    <h6 className="sub-tit">Decimals</h6>
                    <div className="input-box mb12">
                        <Input
                            value={form.decimals.toString() || "18"}
                            onChange={(v) => setField("decimals", Number(v))}
                            type="text"
                        />
                    </div>

                    <h6 className="sub-tit">Block explorer URL(option)</h6>
                    <div className="input-box mb12">
                        <Input
                            value={form.explorer}
                            onChange={(v) => setField("explorer", v)}
                            type="text"
                        />
                    </div>


                    <Button className="mb12" block loading={loading} loadingText="Save..." color="primary"
                        onClick={handleSave}>
                        Save
                    </Button>
                </div>
        </Popup>
    );
}