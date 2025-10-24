import { useEffect, useState } from 'react';
import HeadNav from '@/components/HeadNav'
import { Image } from "antd-mobile";
import { SvgIcon } from '@/components/Icon/index'
import NoDataDom from "@/components/NoDataDom";

import { Permission } from "@/chrome/permission"
import { ConnectedSite } from "@/background/service/permission";

const ConnectSite = () => {
    const [siteList, setSiteList] = useState<ConnectedSite[]>([])

    const getConnectedSites = async () => {
        const sites = await Permission.getConnectedSites()
        setSiteList(sites)
    }

    const removeItem = (index: number) => {
        let item = siteList[index]
        Permission.removeConnectedSite(item.origin)
        setSiteList(siteList.filter((_, i) => index !== i))
    }

    useEffect(() => {
        getConnectedSites()
    }, [])

    return (
        <article className="page-box">
            <HeadNav title='Connect Site'></HeadNav>
            <div className="page-content page-search list-box pb20">
                {
                    siteList.length > 0 ? (
                        siteList.map((item, index) => (
                            <div className="list-item-box" key={index}>
                                <div className="flex-row">
                                    <Image
                                        src={item.icon}
                                        width={36}
                                        height={36}
                                        lazy
                                        placeholder={<SvgIcon iconName="PngCoinDef" size={36} color="" />}
                                        fallback={<SvgIcon iconName="PngCoinDef" size={36} color="" />}
                                        fit="cover"
                                        style={{ borderRadius: '10%', marginRight: '16px' }}
                                    />

                                    <div className="list-item-left">
                                        <strong className="one-line">{item.origin}</strong>
                                    </div>
                                </div>

                                <SvgIcon
                                    className="list-link-del"
                                    iconName="IconClose"
                                    onClick={() => removeItem(index)}
                                    color="#ffffff"
                                />
                            </div>
                        ))
                    ) : (
                        <div className="contact-list mt60">
                            <NoDataDom />
                        </div>
                    )
                }
            </div>
        </article>
    )
}
export default ConnectSite