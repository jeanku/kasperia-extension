import React, { useEffect, useState } from "react"
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { SpinLoading } from 'antd-mobile'
import { HeadNavProps } from '@/types/type'
import { SvgIcon } from '@/components/Icon/index'
import { useSelector } from "react-redux";
import { RootState } from '@/store';

import IconAdd from '../assets/images/icon-add.png'
import IconHistory from '@/assets/icons/icon-history.svg'
import {NetworkType} from "@/utils/wallet/consensus";

const HeadNav: React.FC<HeadNavProps> = ({
    title = "",
    rightTit,
    url,
    leftDom,
    rightType,
    loading,
    showLeft = true,
    state,
    onBack = () => window.history.back(),
    onClickRight,
}) => {
    const navigate = useNavigate();   
    const handleRightClick = () => {
        if (onClickRight && typeof onClickRight === "function") {
            onClickRight();
        } else if (url) {
            navigate(url, { state });
        }
    }
    const { preference } = useSelector((state: RootState) => state.preference);
    const [ isTest, setIsTest ] = useState<boolean>(false)
    const renderLeftElement = () => {
        return leftDom || <SvgIcon iconName="IconArrowLeft" offsetStyle={{position: 'relative', top: '-2px'}} color="#D8D8D8" />
    }

    useEffect(() => {
        if (preference.network) {
            setIsTest(!((preference.network.networkType || NetworkType.Mainnet) === NetworkType.Mainnet));
        }
    }, [preference.network]);
    const renderRightContent = () => {
        switch(rightType) {
            case 'add':
                return <img className="icon-add norem" src={IconAdd} alt="Add" onClick={ () => handleRightClick() } />
            case 'history':
                return  <img className="icon-add norem" src={IconHistory} alt="History" onClick={ () => handleRightClick()} />
            case 'arrow':
                return (
                    <div className="nav-bar-right" onClick={ () => handleRightClick()}>
                    <span>{title}</span>
                    <SvgIcon iconName="arrowRight" size={20} color="#D8D8D8" />
                </div>
                )
            case 'arrowText':
                return (
                    <div className="nav-bar-right" onClick={ () => handleRightClick()}>
                        <span>{rightTit}</span>
                        <SvgIcon iconName="arrowRight" size={20} color="#D8D8D8" />
                    </div>
                )
            default:
                return null;
        }
    }
    return (
        <div className="nav-bar">
            <div className="nav-left" onClick={() => onBack()}>
                { showLeft && renderLeftElement() }
            </div>
            <strong className="nav-bar-title">{title} {loading ? <SpinLoading style={{ '--size': '16px' }} color='default' /> : '' }
            { isTest ? <em className="tip-test-tn">TN10</em> : null }
            </strong>
            <div className="nav-right">
                { renderRightContent() }
            </div>
        </div>
    )
}
HeadNav.propTypes = {
    title: PropTypes.string,
    rightTit: PropTypes.string,
    url: PropTypes.string,
    leftDom: PropTypes.element,
    rightType: PropTypes.string,
    loading: PropTypes.bool,
    onBack: PropTypes.func,
    showLeft: PropTypes.bool,
    state: PropTypes.object,
    onClickRight: PropTypes.func,
};
export default HeadNav