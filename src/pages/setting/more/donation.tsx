import React from "react"
import HeadNav from '@/components/HeadNav'
import { QRCodeSVG } from 'qrcode.react';
import { SvgIcon } from '@/components/Icon/index'
import { useClipboard } from '@/components/useClipboard'
import { formatAddress } from '@/utils/util';

const Donation = () => {
    const { handleCopy } = useClipboard();
    const address = 'kaspa:qzpl8vvasj7m9wk6he6efyd4t9w53vcgnlzxgq52p9vm00wuaf4dql864qdhx'

    return (
        <article className="page-box">
            <HeadNav title='Donation'></HeadNav>
            <div className="receive-box">
                <div className="receive-qr-code">
                    <QRCodeSVG value={address} size={256} level="H"/>
                </div>
                <div className="receive-address-copy cursor-pointer" onClick={() => handleCopy(address)}>
                    <p>{formatAddress(address, 8)}</p><SvgIcon size={28} color="#D8D8D8" iconName="IconCopy" />
                </div>
            </div>
        </article>
    )
}

export default Donation