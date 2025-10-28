import { Image } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon/index'

const DEFAULT_TOKEN_IMAGE = '../assets/images/icon-coin-def.png';
const tokensImages = require.context('../assets/images/tokens', false, /\.(png|jpe?g|svg)$/);
const chainsImages = require.context('../assets/images/chains', false, /\.(png|jpe?g|svg)$/);
const imageMap: Record<string, any> = { tokens: {}, chains: {} };

// 初始化 tokens 图片映射
tokensImages.keys().forEach((key: string) => {
    const name = key.replace('./', '').replace(/\.(png|jpe?g|svg)$/, '');
    imageMap.tokens[name] = tokensImages(key);
});

// 初始化 chains 图片映射
chainsImages.keys().forEach((key: string) => {
    const name = key.replace('./', '').replace(/\.(png|jpe?g|svg)$/, '');
    imageMap.chains[name] = chainsImages(key);
});
function handleTokenImage(url: string, urlPath: 'tokens' | 'chains'): {
    src: string;
    exists: boolean;
} {
    if (!url) {
        return { src: DEFAULT_TOKEN_IMAGE, exists: false };
    }

    const images = imageMap[urlPath];
    const imageSrc = images[url];

    if (imageSrc) {
        return { src: imageSrc as string, exists: true };
    } else {
        return { src: DEFAULT_TOKEN_IMAGE, exists: false };
    }
}

interface TokenImgProps {
    name: string;
    url: string;
    urlPath?: 'tokens' | 'chains';
    width?: number;
    height?: number;
    className?: string;
    showDefault?: boolean;
}

const TokenImg = (props: TokenImgProps) => {
    const { name, width = 44, url, height = 44, urlPath = 'tokens', className = "", showDefault = true } = props;
    const { src: imageSrc, exists: imageExists } = handleTokenImage(url, urlPath);
    if (!showDefault && !imageExists && name) {
        return (
            <div className={`token-icon-img ${className}`}>
                {name.slice(0, 1).toLocaleUpperCase()}
            </div>
        )
    }
    return (<Image
        src={imageSrc}
        className={className}
        width={width}
        height={height || 44}
        lazy={true}
        placeholder={<SvgIcon iconName="PngCoinDef" size={width} color="" />}
        fallback={<SvgIcon iconName="PngCoinDef" size={width} color="" />}
        fit='cover'
        style={{ borderRadius: '50%', marginRight: '16px' }}
    />)
}
export default TokenImg;