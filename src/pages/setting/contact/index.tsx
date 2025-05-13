import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { formatAddress } from '@/utils/util'
import { Contact } from "@/chrome/contact"
import { Address } from "@/model/contact"
import { SvgIcon } from '@/components/Icon/index'
import { useClipboard } from '@/components/useClipboard'
import IconArrowRight from '@/assets/images/icon-arrow-right.png'
import { useNavigate } from "react-router-dom";

const ContactIndex = () => {
    const { handleCopy } = useClipboard()
    const navigate = useNavigate()
    const [address, setAddress] = useState<Address[]>([]);

    const getContact = async () => {
        let address: Address[] = await Contact.get()
        if (address.length > 0) {
            setAddress(address)
        }
    }

    useEffect(() => {
        getContact()
    }, []);

    return(
        <article className="page-box">
            <HeadNav url="/contact/add" title='Address Book' rightType="add"></HeadNav>
            <div className="page-content page-setting list-box pb50">
                {
                    address.length ? address.map((item, index) => (
                        <div className="list-item-box" onClick={() => {}}>
                            <div className="list-item-left">
                                <strong>{item.name}</strong>
                                <span onClick={() => handleCopy(item.address)}>{formatAddress(item.address)} <SvgIcon iconName="IconCopy" color="#7F7F7F" offsetStyle={{marginRight: '-12px'}} /></span>
                            </div>
                            <img src={IconArrowRight} className="right-img" onClick={() => navigate("/contact/update", { state: {address: item}})} alt="right"/>
                        </div>
                    ))
                    : <div className="no-data-tip">
                        <p className="cursor-pointer" onClick={ () => navigate("/contact/add")}>Add to Address Book?</p>
                    </div>
                }
            </div>
        </article>
    )
}
export default ContactIndex