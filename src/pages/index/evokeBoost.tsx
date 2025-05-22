import { Outlet } from "react-router-dom";
import MessageProvider from '@/components/NoticeBar/NoticeBar'

const EvokeBoost = () => {
    return (
        <MessageProvider><Outlet /></MessageProvider>
    )
}
export default EvokeBoost