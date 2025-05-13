import HeadNav from '@/components/HeadNav'
import { useNavigate } from "react-router-dom";
import { SvgIcon } from '@/components/Icon/index'

const CreateWallet = () => {
    const navigate = useNavigate();
    return (
        <article className="page-box">
            <HeadNav title='Create a new wallet'></HeadNav>
            <section className="page-create-wallet">
                <div className="create-wallet-item" key='Create a wallet' onClick={() => navigate('/import/randomMnemonic',{replace: true})}>
                    <SvgIcon iconName="IconCreate" offsetStyle={{marginRight: '20px'}} color="#FFFFFF" />
                    <div className="create-wallet-item-title">
                        <strong>Create a wallet</strong>
                        <p>You will use this to unlock your wallet</p>
                    </div>
                </div>

                <div className="create-wallet-item" key='Import seed phrase' onClick={() => navigate('/import/frommnemonic', {replace: true})}>
                    <SvgIcon iconName="IconParase" offsetStyle={{marginRight: '20px'}} color="#FFFFFF" />
                    <div className="create-wallet-item-title">
                        <strong>Import seed phrase</strong>
                        <p>Import accounts from another wallet app</p>
                    </div>
                </div>

                <div className="create-wallet-item" key='Import private key' onClick={() => navigate('/import/fromprivatekey', {replace: true})}>
                    <SvgIcon iconName="IconImportKey" offsetStyle={{marginRight: '20px'}} color="#FFFFFF" />
                    <div className="create-wallet-item-title">
                        <strong>Import private key</strong>
                        <p>Import a single account</p>
                    </div>
                </div>
            </section>
        </article>
    )
}

export { CreateWallet }
