import React, { useState, useEffect } from "react"
import { QRCodeSVG } from 'qrcode.react';
import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import { useSelector } from "react-redux";
import { RootState } from '@/store';
import { formatAddress } from '@/utils/util';
import { useClipboard } from '@/components/useClipboard'

const Receive = () => {
    const { handleCopy } = useClipboard();
    const preference = useSelector((state: RootState) => state.preference.preference);

    const [addressName, setAddressName] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (!preference) return;
        setAddress(preference?.currentAccount?.address || "")
        setAddressName(preference?.currentAccount?.name || "")
    }, [preference]);

    return (
        <article className="page-box">
            <HeadNav title="Address"></HeadNav>
            <div className="receive-box">
                <div className="receive-qr-code">
                    <QRCodeSVG value={address} size={256} level="H"/>
                </div>

                <div className="receive-address-copy" >
                    <p className="tit-18">{addressName}</p>
                </div>
                <div className="receive-address-copy cursor-pointer" onClick={() => handleCopy(address)}>
                    <p>{formatAddress(address, 8)}</p><SvgIcon size={28} color="#D8D8D8" iconName="IconCopy" />
                </div>
            </div>
        </article>
    )
}
export { Receive }