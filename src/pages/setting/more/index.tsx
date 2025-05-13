import React, { useEffect, useState } from "react"
import HeadNav from '@/components/HeadNav'
import { SvgIcon } from '@/components/Icon/index'
import { useNavigate } from "react-router-dom";
import { Mask, Button, Checkbox, Space } from 'antd-mobile'
import { LockTimeList } from '@/types/enum'
import { Preference } from '@/chrome/preference'
import { Keyring } from '@/chrome/keyring'
import CheckBoxItem from '@/components/CheckBoxItem'

import IconArrowRight from '@/assets/images/icon-arrow-right.png'
import RemoveInset from '@/assets/images/remove-img.png'

const MoreOptions = () => {
    const navigate = useNavigate();
    const [visibleMask, setVisibleMask] = useState(false)

    const [checkClear, setCheckClear] = useState(false)
    const [checkBackups, setCheckBackups] = useState(false)
    const [checkReversible, setCheckReversible] = useState(false)
    const [lockTime, setLockTime] = React.useState(0)
    const [lockTimeDesc, setLockTimeDesc] = React.useState<string>('')

    const logoOut = () => {
        if (!checkClear || !checkBackups || !checkReversible) return 
        Keyring.clear().then(_=> {
            navigate("/")
        })
    }

    useEffect(() => {
        async function setDefLockTime() {
            const defLockTime = await Preference.getLockTime()
            const desc = LockTimeList.find(item => item.value === defLockTime)?.name || LockTimeList[0].name
            setLockTime(defLockTime as number)
            setLockTimeDesc(desc)
        }
        setDefLockTime()
    }, [])

    return (
        <article className="page-box">
            <HeadNav title='More options'></HeadNav>
            <div className="page-content page-more list-box pb50">
                <div className="list-item-box" key="Change password" onClick={() => navigate("/setting/changepwd")}>
                    <div className="list-item-left">
                        <strong>Change password</strong>
                        <span>Change your lockscreen password</span>
                    </div>
                    <img src={IconArrowRight} className="right-img" alt="Change password"/>
                </div>

                <div className="list-item-box" key="Auto-lock option" onClick={() => navigate("/setting/autolock", {state: {locktime: lockTime}})}>
                    <div className="list-item-left">
                        <strong>Auto-lock option</strong>
                        <span>{lockTimeDesc}</span>
                    </div>
                    <img src={IconArrowRight} className="right-img" alt="Auto-lock option"/>
                </div>

                <div className="list-item-box" key="Donate to us" onClick={() => navigate("/setting/donation")}>
                    <div className="list-item-left">
                        <strong>Donate to us</strong>
                    </div>
                    <img src={IconArrowRight} className="right-img" alt="Donate to us"/>
                </div>

                <div className="list-item-box" onClick={() => setVisibleMask(true)}>
                    <p className="list-box-btn">Logout</p>
                </div>
            </div>
            <Mask visible={visibleMask} onMaskClick={() => setVisibleMask(false)}>
                <article className="remove-box">
                    <div className="remove-bg">
                        <SvgIcon 
                            className="remove-close" 
                            onClick={() => setVisibleMask(false)} 
                            iconName="IconClose"
                            color="#7F7F7F"/>
                        <div className="remove-nox-content">
                            <img src={RemoveInset} alt=""/>
                            <div className="remove-check">
                                <CheckBoxItem 
                                    text="By logout,all data stored locally will be erased" 
                                    checked={checkClear} 
                                    onChange={(val) => setCheckClear(val)} 
                                />
                                <CheckBoxItem 
                                    text="Please pay attention to whether you have backed up the mnemonic/private key to prevent asset loss" 
                                    checked={checkBackups} 
                                    onChange={(val) => setCheckBackups(val)} 
                                />
                                <CheckBoxItem 
                                    text="This action is not reversible" 
                                    checked={checkReversible} 
                                    onChange={(val) => setCheckReversible(val)} 
                                />
                            </div>
                        </div>
                        <div className="remove-btns">
                            <Button onClick={() => {
                                setVisibleMask(false)
                                setCheckBackups(false)
                                setCheckClear(false)
                                setCheckReversible(false)
                            }}>Cancel</Button>
                            <Button color='primary' disabled={!checkClear || !checkBackups || !checkReversible} onClick={() => logoOut()}>Logout</Button>
                        </div>
                    </div>
                </article>
            </Mask>
        </article>
    )
}
export default MoreOptions