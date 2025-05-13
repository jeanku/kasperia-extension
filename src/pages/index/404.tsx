import React from "react"
import { useNavigate } from "react-router-dom";
import { Result, Button } from 'antd-mobile'
const Nopage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <article className="page-box page-nopage">
            <Result
                status='info'
                title=''
                description='The page does not exist'
            />
            <div className="btn-pos-two flexd-row post-bottom">
                <Button block size="large" color="primary" onClick={() => navigate('/home')}>
                    Back Home
                </Button>
            </div>
        </article>
    )
}
export { Nopage }