import React, { useState } from "react"
import HeadNav from '@/components/HeadNav'
import { Radio } from 'antd-mobile'
import { useLocation } from "react-router-dom";
import { Preference } from '@/chrome/preference'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { LockTimeList } from '@/types/enum'

const AutoLock = () => {

    const { state } = useLocation()
    const { noticeSuccess, noticeError } = useNotice();

    const [currentLockTime, setCurrentLockTime] = useState<number>(state.locktime)

    const changeLockTime = (value: number) => {
        if(currentLockTime === value) return
        try {
            setCurrentLockTime(value)
            Preference.setLockTime(value).then(_ => {
                noticeSuccess('Auto-lock time changed successfully')
            })
        } catch (error) {
            noticeError('Auto-lock time changed failed')
        }
    }

    return (
        <article className="page-box">
            <HeadNav title='Auto-Lock'></HeadNav>
            <div className="content-main list-box min-height">
                <Radio.Group value={currentLockTime} >
                    {
                        LockTimeList.map((item, index) => {
                            return (
                                <div className="list-item-box" key={item.name}>
                                    <Radio value={item.value} onChange={val => changeLockTime(item.value)} defaultChecked={ currentLockTime == item.value }>
                                        <div className="list-item-left">
                                            <strong>{item.name}</strong>
                                        </div>
                                    </Radio>
                                </div>
                            )
                        })
                    }
                </Radio.Group>
            </div>
        </article>
    )
}

export default AutoLock