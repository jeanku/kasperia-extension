import React, { useState, useEffect, useRef } from "react";

import refresh from '@/assets/icons/refresh.svg'
import footerWallet from '@/assets/icons/footer-wallet.svg'
import footerCenter from '@/assets/icons/footer-center.svg'
import footerSettings from '@/assets/icons/footer-setting.svg'
import arrowRight from '@/assets/icons/arrow-right.svg'
import IconArrowLeft from '@/assets/icons/icon-arrow-left.svg'
import IconUser from '@/assets/icons/icon-user.svg'
import IconShare from '@/assets/icons/icon-share.svg'
import IconConvert from '@/assets/icons/icon-convert.svg'
import IconCheck from '@/assets/icons/check.svg'
import IconCheckSelect from '@/assets/icons/check-select.svg'
import IconCopy from '@/assets/icons/copy.svg'
import IconArrowRightTheme from '@/assets/icons/arrow-right-theme.svg'
import IconSearch from '@/assets/icons/icon-search.svg'
import IconReceive from '@/assets/icons/icon-receive.svg'
import IconSend from '@/assets/icons/icon-send.svg'
import IconKey from '@/assets/icons/icon-key.svg'
import IconEdit from '@/assets/icons/icon-edit.svg'
import IconDel from '@/assets/icons/icon-del.svg'
import IconImportKey from '@/assets/icons/icon-import-key.svg'
import IconCreate from '@/assets/icons/icon-create.svg'
import IconParase from '@/assets/icons/icon-parase.svg'
import IconSetting from '@/assets/icons/icon-setting.svg'
import IconClose from '@/assets/icons/icon-close.svg'
import IconTipError from '@/assets/icons/icon-tip-error.svg'
import IconTipSuccess from '@/assets/icons/icon-tip-success.svg'
import IconRadioTrue from '@/assets/icons/icon-radio-true.svg'
import IconRadioFalse from '@/assets/icons/icon-raido-false.svg'
import IconExpand from '@/assets/icons/icon-expand.svg'
import IconRight from '@/assets/icons/icon-right.svg'
import IconEyeClose from '@/assets/icons/icon-eye-close.svg'
import IconEyeOpen from '@/assets/icons/icon-eye-open.svg'
import IconDiscord from '@/assets/icons/discord.svg'
import IconTwitter from '@/assets/icons/twitter.svg'
import IconGithub from '@/assets/icons/github.svg'
import IconHistory from '@/assets/icons/icon-history.svg'
import IconRightArrow from '@/assets/icons/icon-right-arrow.svg'
import IconMoreVertical from '@/assets/icons/more-vertical.svg'
import PngCoinDef from '@/assets/images/icon-coin-def.png'

const svgRegistry = {
    refresh,
    footerWallet,
    footerCenter,
    footerSettings,
    arrowRight,
    IconArrowLeft,
    IconUser,
    IconShare,
    IconConvert,
    IconCheck,
    IconCheckSelect,
    IconCopy,
    IconArrowRightTheme,
    IconSearch,
    IconReceive,
    IconSend,
    IconKey,
    IconEdit,
    IconDel,
    IconImportKey,
    IconCreate,
    IconParase,
    IconSetting,
    IconClose,
    IconTipError,
    IconTipSuccess,
    PngCoinDef,
    IconRadioTrue,
    IconRadioFalse,
    IconExpand,
    IconRight,
    IconEyeClose,
    IconEyeOpen,
    IconDiscord,
    IconTwitter,
    IconGithub,
    IconHistory,
    IconRightArrow,
    IconMoreVertical,
};

type IconName = keyof typeof svgRegistry;

const svgCache: Record<string, string> = {};
export const SvgIcon = ({
                            iconName,
                            size = 24,
                            color = "#D8D8D8",
                            offsetStyle = {},
                            onClick,
                            className,
                        }: {
    iconName: IconName;
    size?: number;
    color?: string,
    offsetStyle?: {},
    className?: string,
    onClick?: () => void
}) => {
    const [svgContent, setSvgContent] = useState<string | null>(null)
    const isPng = iconName.startsWith('Png');
    useEffect(() => {
        if (isPng) return;
        const cacheKey = `${iconName}-${color || 'color'}`;
        if (svgCache[cacheKey]) {
            setSvgContent(svgCache[cacheKey]);
            return;
        }
        const fetchSvg = async () => {
            try {
                const response = await fetch(svgRegistry[iconName]);
                let svgText = await response.text();
                svgText = svgText.replace(/<svg([^>]*)>/, (match) => {
                    const cleanedMatch = match.replace(/\s*(width|height)=["'][^"']*["']/g, '');
                    return `${cleanedMatch.slice(0, -1)} viewBox="0 0 24 24" style="width: 100%; height: 100%;">`;
                });
                svgText = svgText.replace(/<path([^>]*)>/g, (match, p1) => {
                    if (!p1.includes('fill="')) {
                        return `<path${p1} fill="${color}">`;
                    }
                    return match.replace(/fill="[^"]*"/g, `fill="${color}"`);
                });
                svgCache[cacheKey] = svgText;
                setSvgContent(svgText);
            } catch (error) {
                console.error(`Failed to load SVG: ${iconName}`, error);
            }
        };
        fetchSvg();
    }, [iconName, size, isPng]);
    if (isPng) {
        return (
            <img
                src={svgRegistry[iconName]}
                alt={iconName}
                style={{
                    width: size,
                    height: size,
                    ...offsetStyle,
                }}
                className={className}
                onClick={onClick}
            />
        );
    }
    if (!svgContent) return null;

    return (
        <div
            style={{
                width: size,
                height: size,
                display: 'inline-block',
                verticalAlign: 'middle',
                ...offsetStyle,
            }}
            className={className}
            onClick={onClick}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};