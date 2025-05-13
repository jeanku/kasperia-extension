import React, {useState, useMemo} from "react"
import HeadNav from '@/components/HeadNav'
import { useNavigate } from "react-router-dom";
import { Contact } from "@/chrome/contact"
import { Kiwi, Wallet } from '@kasplex/kiwi-web'
import { Button, Input } from "antd-mobile";

const ContactAdd = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const submitDisabled = useMemo(() => {
        return !name || !address || !Wallet.validate(address)
    }, [name, address]);

    const handleSubmit = async () => {
        await Contact.add({name: name, address: address, network: Kiwi.network.valueOf()})
        navigate(-1)
    }
    
    return(
        <article className="page-box">
            <HeadNav title='Add contact'></HeadNav>
            <div className="page-content page-setting list-box pb50">
                <div className="input-box mb12">
                    <Input
                        className="input"
                        placeholder='name'
                        value={name}
                        type='text'
                        maxLength={20}
                        clearable
                        onChange={val => {
                            setName(val)
                        }}
                    />
                </div>
                <div className="input-box mb12">
                    <Input
                        className="input"
                        placeholder='address'
                        value={address}
                        type='text'
                        clearable
                        onChange={val => {
                            setAddress(val)
                        }}
                    />
                </div>
                <Button block size="large" color="primary" disabled={submitDisabled} onClick={ handleSubmit }>
                    Confirm
                </Button>
            </div>
        </article>
    )
}
export default ContactAdd