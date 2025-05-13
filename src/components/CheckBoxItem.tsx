import React from "react";
import { Checkbox, Space } from "antd-mobile";
import { SvgIcon } from '@/components/Icon/index';

interface CheckBoxItemProps {
    text: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}
const CheckBoxItem: React.FC<CheckBoxItemProps> = ({ text, checked, onChange }) => {
    return (
        <Space direction='vertical' className="mb12" block>
            <Checkbox 
                block 
                onChange={(val: boolean) => onChange(val)} 
                checked={checked}
                icon={(checked) => (checked ? <SvgIcon iconName="IconCheckSelect" color="#74E6D8" offsetStyle={{marginTop: '2px'}} /> : <SvgIcon iconName="IconCheck" offsetStyle={{marginTop: '2px'}} />)}
            >
                {text}
            </Checkbox>
        </Space>
    );
};

export default CheckBoxItem;