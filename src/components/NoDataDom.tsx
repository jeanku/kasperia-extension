
import { Empty  } from 'antd-mobile'
import NoDataImg from '@/assets/images/no-data-2.png'
type NoDataParams = {
    description?: string
    style?: React.CSSProperties
    imgStyle?: React.CSSProperties
}
const NoDataDom:React.FC<NoDataParams> = ({description = 'No data', style = {padding: '64px 0'}, imgStyle ={}}) => {
    return (
        <Empty image={<img src={NoDataImg} style={imgStyle} alt="no data"/>} style={style}
            description={description} />
    );
};


export default NoDataDom;