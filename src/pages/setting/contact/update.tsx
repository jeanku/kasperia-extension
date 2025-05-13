import React, {useState, useMemo} from "react"
import HeadNav from '@/components/HeadNav'
import { useNavigate } from "react-router-dom";
import { Address } from "@/model/contact"
import { Contact } from "@/chrome/contact"
import { Button, Input } from "antd-mobile";
import { useLocation } from 'react-router-dom'

const ContactUpdate = () => {
    const { state } = useLocation()
    const navigate = useNavigate();
    const [name, setName] = useState('')
    const [address, _] = useState<Address>(state?.address)
    const submitDisabled = useMemo(() => !name, [name]);

    const changeName = async () => {
        await Contact.changeName(address.address, name)
        navigate(-1)
    }

    const removeChange = async () => {
        await Contact.remove(address.address)
        navigate(-1)
    }

    return(
        <article className="page-box">
            <HeadNav title='Edit Address'></HeadNav>
            <div className="page-content page-setting list-box">
                <div className="input-box mb12">
                    <Input
                        className="input"
                        placeholder={address.name}
                        value={name}
                        type='text'
                        maxLength={20}
                        onChange={val => {
                            setName(val)
                        }}
                    />
                </div>
                <div className="btn-pos-two">
                    <Button block size="large" color="primary" disabled={submitDisabled} onClick={ () => changeName() }>
                        Change Name
                    </Button>
                    <Button block size="large" onClick={ () => removeChange() }>
                        Remove Contact
                    </Button>
                </div>
            </div>
        </article>
    )
}
export default ContactUpdate