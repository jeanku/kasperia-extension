import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, Radio } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon/index'
import DeforeImg from '@/assets/images/icon-coin-def.png'

const BorwerConnect = () => {
    const [currentAccount, setCurrentAccount] = useState<string>('')
    const [accountList, setAccountList] = useState<[]>([]) 

    return (
        <article className="page-box">
            <HeadNav title='Kasperia Wallet'></HeadNav>
            <section className="content-main connect-box pb96">
                <div className='source-bpx'>
                    <img className="logo-img" src={DeforeImg} alt="" />
                    <div className='source-txt'>
                        <strong>Kasperia</strong>
                        <p>http://localhost:5173</p>
                    </div>
                </div>
                <div className='contant-txt'>
                    <p className='txt-tit-1'>Connect with Kasperia Wallet</p>
                    <p className='txt-tit-2'>Select the account to use on this site</p>
                    <p className='txt-tit-tip'>Only connect with sites you trust</p>
                </div>
                <div className="list-box">
                    <Radio.Group value={currentAccount} >
                        <strong className="list-tit-1">Wallet 2</strong>
                        <div className="list-item-box">
                            <Radio >
                                <div className="list-item-left">
                                    <strong>Kasperia</strong>
                                    <span>http://localhost:5173</span>
                                </div>
                            </Radio>
                        </div>
                        <div className="list-item-box">
                            <Radio >
                                <div className="list-item-left">
                                    <strong>Kasperia</strong>
                                    <span>http://localhost:5173</span>
                                </div>
                            </Radio>
                        </div>
                        <div className="list-item-box">
                            <Radio >
                                <div className="list-item-left">
                                    <strong>Kasperia</strong>
                                    <span>http://localhost:5173</span>
                                </div>
                            </Radio>
                        </div>
                        <strong className="list-tit-1">Wallet 2</strong>
                        <div className="list-item-box">
                            <Radio >
                                <div className="list-item-left">
                                    <strong>Kasperia</strong>
                                    <span>http://localhost:5173</span>
                                </div>
                            </Radio>
                        </div>
                        <strong className="list-tit-1">Wallet 2</strong>
                        <div className="list-item-box">
                            <Radio >
                                <div className="list-item-left">
                                    <strong>Kasperia</strong>
                                    <span>http://localhost:5173</span>
                                </div>
                            </Radio>
                        </div>
                        <strong className="list-tit-1">Wallet 2</strong>
                        <div className="list-item-box">
                            <Radio >
                                <div className="list-item-left">
                                    <strong>Kasperia</strong>
                                    <span>http://localhost:5173</span>
                                </div>
                            </Radio>
                        </div>
                    </Radio.Group>
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" >
                        Cancel
                    </Button>
                    <Button block size="large" color="primary" 
                        >
                        Connect
                    </Button>
                </div>
            </section>
        </article>
    )
}

export { BorwerConnect }