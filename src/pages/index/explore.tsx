import React, { useEffect, useState } from "react"
import HeadNav from '@/components/HeadNav'
import Footer from '@/components/Footer'
import { LinkItem } from '@/model/links'
import { useNavigate } from "react-router-dom";
import { SvgIcon } from '@/components/Icon/index'
import { Share } from "@/chrome/share"
import { openUrl } from "@/utils/util"

const Explore = () => {

    const navigate = useNavigate();
    const [links, setLinks] = useState<LinkItem[]>([])

    const getShares = async () => {
        let links = await Share.getAll()
        setLinks(links)
    }

    useEffect(() => {
        getShares();
    }, []);

    return(
        <article className="page-box">
            <HeadNav url="/share/add" title='Explore' rightType="add"></HeadNav>
            <div className="page-content page-search list-box pb50">
                <div className="list-item-box" onClick={() => {
                    navigate('/krc20/mint')
                }}>
                    <div className="list-item-left">
                        <strong>KRC20 Mint Token</strong>
                    </div>
                    <SvgIcon iconName="IconExpand"/>
                </div>

                <div className="list-item-box" onClick={() => {
                    navigate('/krc20/deploy')
                }}>
                    <div className="list-item-left">
                        <strong>KRC20 Create a new token</strong>
                    </div>
                    <SvgIcon iconName="IconExpand"/>
                </div>
                {
                    links.map((item) => (
                        <div className="list-item-box" onClick={() => openUrl(item.url)}>
                            <div className="list-item-left">
                                <strong>{item.name}</strong>
                                <span onClick={() => {}}>{item.name} <SvgIcon iconName="IconCopy" color="#7F7F7F" offsetStyle={{marginRight: '-12px'}} /></span>
                            </div>
                        </div>
                    ))
                }
            </div>
            <Footer></Footer>
        </article>
    )
}
export {Explore}