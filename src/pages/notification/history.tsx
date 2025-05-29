import { useEffect, useState } from 'react';
import HeadNav from '@/components/HeadNav'
import { SvgIcon } from '@/components/Icon/index'

interface HistoryProps {
    url: string,
    operationType: string,
    time: string,
    result: string,
    show?: boolean,
}
const History = () => {
    const [historyList, setHistoryList] = useState<HistoryProps[]>([])
    const getList = () => {
        let list = [
            {   
                url: 'http://localhost:5173', 
                operationType: 'SendKaspa',
                time: '2025/5/15 17:23:58',
                show: false,
                result: JSON.stringify({"to":"kaspatest:qp5aflmtqc9zk9s8cnlkne7sxh895eqqjs cpadOwgjpjxtrgqszy55v22vejn","amount":1.3,"priorityFe e":3e-12, "fee":0.00003154})
            },
            {   
                url: 'http://localhost:5173', 
                operationType: 'SendKaspa',
                time: '2025/5/15 17:23:58',
                show: false,
                result: JSON.stringify({"to":"kaspatest:qp5aflmtqc9zk9s8cnlkne7sxh895eqqjs cpadOwgjpjxtrgqszy55v22vejn","amount":1.3,"priorityFe e":3e-12, "fee":0.00003154})
            },
            {   
                url: 'http://localhost:5173', 
                operationType: 'SendKaspa',
                time: '2025/5/15 17:23:58',
                show: false,
                result: JSON.stringify({"to":"kaspatest:qp5aflmtqc9zk9s8cnlkne7sxh895eqqjs cpadOwgjpjxtrgqszy55v22vejn","amount":1.3,"priorityFe e":3e-12, "fee":0.00003154})
            },
        ]
        setHistoryList(list)
    }

    const changeStatus = (index: number) => {
        setHistoryList(historyList.map((item, i) => 
            i === index ? { ...item, show: !item.show } : item
        ));
    }
    useEffect(() => {
        getList()
    },[])
    return (
        <article className="page-box">
            <HeadNav title='Approval/Sign History'></HeadNav>
            <div className="content-main history-box">
                <div className='sign-history-list'>
                    {
                        historyList.map((item,index) => {
                            return (
                                <div className={ item.show ? 'sign-history-item active' : 'sign-history-item'} key={index}>
                                    <div className='history-head' onClick={ () => changeStatus(index)} >
                                        <SvgIcon iconName="IconRightArrow" />
                                        <span>{item.url}</span>
                                        <span>{item.time}</span>
                                        <span>{item.show}</span>
                                    </div>
                                    <div className='history-body'>
                                        <strong>{item.operationType}</strong>
                                        <p>{item.result}</p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </article>
    )
}
export { History }