import { useEffect } from 'react';
import HeadNav from '@/components/HeadNav'
import DeforeImg from '@/assets/images/icon-coin-def.png'
import { SvgIcon } from '@/components/Icon/index'

interface Props {
    params: {
        session: {
            origin: string;
            icon: string;
            name: string;
        };
    };
}

const ConnectedSite = ({ params: { session } }: Props) => {

    useEffect(() => {
        console.log("session", session)
    }, []);

    return (
        <article className="page-box">
            <HeadNav title='Connected Sites' url="/evokeBoost/notification/history" rightType="history"></HeadNav>
            <section className="content-main connect-box">
                <div className='source-box'>
                    <img className="logo-img" src={DeforeImg} alt="" />
                    <div className='source-txt'>
                        <strong>Kasperia</strong>
                        <p>http://localhost:5173</p>
                    </div>
                    <SvgIcon iconName="IconClose" />
                </div>
                <div className='source-box'>
                    <img className="logo-img" src={DeforeImg} alt="" />
                    <div className='source-txt'>
                        <strong>Kasperia</strong>
                        <p>http://localhost:5173</p>
                    </div>
                    <SvgIcon iconName="IconClose" />
                </div>
            </section>
        </article>
    )
}

export default ConnectedSite