import React, {useMemo, useState} from "react"
import HeadNav from '@/components/HeadNav'
import {useNavigate} from "react-router-dom";
import {Contact} from "@/chrome/contact"
import {Button, Input} from "antd-mobile";
import { AddressType } from "@/types/enum";
import { ethers } from "ethers";
import {useNotice} from "@/components/NoticeBar/NoticeBar";
import { toAddressType } from "@/utils/util";
import {Address} from "@/utils/wallet/address";
import { NetworkType } from "@/utils/wallet/consensus";

const ContactAdd = () => {
    const navigate = useNavigate();
    const { noticeError } = useNotice();

    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const submitDisabled = useMemo(() => {
        return !name || !address
    }, [name, address]);

    const handleSubmit = async () => {
        var addressType = undefined
        var networkType = NetworkType.Mainnet

        if (Address.validate(address)) {
            networkType = toAddressType(address)
            addressType = AddressType.KaspaAddress
        } else {
            if (ethers.isAddress(address)) {
                addressType = AddressType.EvmAddress
            } else {
                return noticeError("address invalid")
            }
        }
        await Contact.add(
            {
                name: name,
                address: address,
                network: networkType,
                type: addressType
            })
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