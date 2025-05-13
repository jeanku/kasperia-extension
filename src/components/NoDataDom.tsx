
import { Empty  } from 'antd-mobile'
import NoDataImg from '@/assets/images/no-data-2.png'
type NoDataParams = {
    description?: string
    style?: React.CSSProperties
}
const NoDataDom:React.FC<NoDataParams> = ({description = 'No data', style = {padding: '64px 0'}}) => {
    return (
        <Empty image={<img src={NoDataImg} alt="no data"/>} style={style}
            description={description} />
    );
};


export default NoDataDom;