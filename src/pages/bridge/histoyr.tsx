import { useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { List } from 'antd-mobile'

import HeadNav from '@/components/HeadNav'
import { formatAddress, formatDate } from '@/utils/util'

const History = () => {
    const navigate = useNavigate();

    const historyList = useMemo(() => {
        return [
            {
                time: '1762058035000',
                hash: '0x7d8e4129a4e62ea5ed94083b1b521e73060ac39dcbb486e45f0c1920f3bab8c0',
                amount: 232323.33,
                type: 'Add',
                is_accepted: true,
            },
            {
                time: '1762058035000',
                hash: '0x7d8e4129a4e62ea5ed94083b1b521e73060ac39dcbb486e45f0c1920f3bab8c0',
                amount: 323.33,
                type: 'Reduce',
                is_accepted: false,
            },
        ]
    }, [])

    return(
        <div className="page-box">
            <HeadNav title='Kaspa-History' onBack={() => navigate('/bridge/bridgeIndex')} ></HeadNav>
            <div className="content-main history-box">
                <List>
                    {
                        historyList.map(item => (
                            <div className="history-item" key={item.hash}>
                            <div className="history-top">
                                <span>{formatAddress(item.hash, 6)}</span>
                                <strong className={item.is_accepted ? 'history-status' : 'history-status failed'}>{item.is_accepted ? "Success" : "Failed"}</strong>
                            </div>
                            <div className="history-bottom">
                                <div className="history-left">
                                    <em className={item.amount < 0 ? 'history-icon sub' : 'history-icon'}>{item.amount < 0 ? "-" : "+"}</em>
                                    <strong
                                        className="history-amount">{item.amount} Kas</strong>
                                </div>
                                <span
                                    className="history-time">{formatDate(item.time.toString())}</span>
                            </div>
                        </div>
                        ))
                    }
                </List>
            </div>
        </div>
    )
}

export default History;