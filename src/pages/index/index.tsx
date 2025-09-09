import React from "react"
import { useNavigate } from "react-router-dom";
import { Button } from "antd-mobile";
import logoImg from '@/assets/images/logo512.png';
import { Boost } from "./boost"
import { Explore } from "./explore"
import { ShareAdd } from "./shareAdd"
import { Home } from "./home"
import { Nopage } from "./404"

const Index = () => {
    const navigate = useNavigate();

    const create = (params: string) => {
        navigate(`/account/createpwd?target=${params}`);
    };

    return (
        <div className="page-box">
            <div className="page-index page-flex md-mr-30">
                <div className="page-index-header">
                    <div className="index-log">
                        <img src={logoImg} alt="logo" />
                        <span> KASPERIA </span>
                    </div>
                    <p>
                        First open source chrome wallet for kaspa in the world! simple and
                        reliable.
                    </p>
                </div>
                <div className="page-content">
                    <Button block  color="primary" size="large" onClick={ () => create('/import/randomMnemonic') }>
                        Create a new wallet
                    </Button>
                    <div className="mb40"></div>
                    <Button block size="large" color="warning" onClick={ () => create('/import/frommnemonic') }>
                        I already have a wallet
                    </Button>
                </div>
            </div>
        </div>
    )
}


export { Index, Boost, Explore, Home, Nopage, ShareAdd }