import React from "react"
import HeadNav from '@/components/HeadNav'
import Footer from '@/components/Footer'
import { useNavigate } from "react-router-dom";
import { SvgIcon } from '@/components/Icon/index'
const Explore = () => {

    const navigate = useNavigate();

    return(
        <article className="page-box">
            <HeadNav title='Explore' ></HeadNav>
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
            </div>
            <Footer></Footer>
        </article>
    )
}
export { Explore }