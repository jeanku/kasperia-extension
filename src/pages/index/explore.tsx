import React, { useEffect, useState } from "react"
import HeadNav from '@/components/HeadNav'
import Footer from '@/components/Footer'
import { LinkItem } from '@/model/links'
import { useNavigate } from "react-router-dom";
import { SvgIcon } from '@/components/Icon/index'
import {Modal, Divider, Image} from "antd-mobile";
import { Share } from "@/chrome/share"
import { openUrl, getUrlIcon } from "@/utils/util"

const Explore = () => {

    const navigate = useNavigate();
    const [links, setLinks] = useState<LinkItem[]>([])

    const getShares = async () => {
        let links = await Share.getAll()
        const linksWithIcons = await Promise.all(
            links.map(async (link) => {
                return {
                    ...link,
                    imgIcon: getUrlIcon(link.url)
                };
            })
        );
        console.log("linksWithIcons", linksWithIcons)
        setLinks(linksWithIcons)
    }

    const removeLink = async (index: number) => {
        const curLink = links[index]
        if (!curLink) {
            return
        }
        await Share.remove(curLink.id)
        setLinks([...links.slice(0, index), ...links.slice(index + 1)])
    }

    const removeLinkConfirm = async (index: number) => {
        Modal.alert({
            title: 'Message',
            bodyClassName: 'modal-alert-body',
            content: 'Please confirm that you want to permanently remove this external website link from your wallet.',
            showCloseButton: true,
            confirmText: "Confirm Remove",
            onConfirm: async () => {
                removeLink(index)
            },
        })
    }

    useEffect(() => {
        getShares();
    }, []);

    return (
        <article className="page-box">
            <HeadNav url="/share/add" title='Explore' rightType="add"></HeadNav>
            <div className="page-content page-search list-box pb50">
                <div className="list-item-box" onClick={() => {
                    navigate('/krc20/mint')
                }}>
                    <div className="list-item-left">
                        <strong>KRC20 Mint Token</strong>
                    </div>
                    <SvgIcon iconName="IconExpand" />
                </div>

                <div className="list-item-box" onClick={() => {
                    navigate('/krc20/deploy')
                }}>
                    <div className="list-item-left">
                        <strong>KRC20 Create a new token</strong>
                    </div>
                    <SvgIcon iconName="IconExpand" />
                </div>
                {
                    links.length > 0 && (
                        <Divider className="mt15" style={{
                        color: '#ffffff',
                        borderColor: '#333333',
                    }}>My Sites</Divider>
                    )
                }
                {
                    links.map((item, index) => (
                        <div className="list-item-box" >
                            <div className="flex-row">
                                <Image
                                    src={ item.imgIcon! }
                                    width={44}
                                    height={44}
                                    lazy={true}
                                    placeholder={<SvgIcon iconName="PngCoinDef" size={44} color=""/>}
                                    fallback={<SvgIcon iconName="PngCoinDef" size={44} color=""/>}
                                    fit='cover'
                                    style={{borderRadius: '10%', marginRight: '16px'}}
                                />

                                <div className="list-item-left" onClick={() => openUrl(item.url)}>
                                    <strong>{item.name}</strong>
                                    <span>{item.url}</span>
                                </div>
                            </div>
                            <SvgIcon className="list-link-del" iconName="IconClose"
                                onClick={() => removeLinkConfirm(index)}
                                color="#ffffff" />
                        </div>
                    ))
                }
            </div>
            <Footer></Footer>
        </article>
    )
}
export { Explore }