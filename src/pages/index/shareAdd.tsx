import React, {useState, useMemo} from "react"
import HeadNav from '@/components/HeadNav'
import { useNavigate } from "react-router-dom";
import { Share } from "@/chrome/share"
import { isValidUrl } from "@/utils/util"
import { Button, Input } from "antd-mobile";

const ShareAdd = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')
    const submitDisabled = useMemo(() => {
        return !name || !url || !isValidUrl(url)
    }, [name, url]);

    const handleSubmit = async () => {
        await Share.add({
            name: name,
            url: url,
        })
        navigate(-1)
    }
    
    return(
        <article className="page-box">
            <HeadNav title='Add Share link'></HeadNav>
            <div className="page-content page-setting list-box pb50">
                <div className="input-box mb12">
                    <Input
                        className="input"
                        placeholder='name'
                        value={name}
                        type='text'
                        clearable
                        onChange={val => {
                            setName(val)
                        }}
                    />
                </div>
                <div className="input-box mb12">
                    <Input
                        className="input"
                        placeholder='url'
                        value={url}
                        type='text'
                        clearable
                        onChange={val => {
                            setUrl(val)
                        }}
                    />
                </div>
                <Button block size="large" color="primary" disabled={submitDisabled} onClick={handleSubmit}>
                    Confirm
                </Button>
            </div>
        </article>
    )
}

export { ShareAdd }