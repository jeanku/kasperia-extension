type SignMessageResponseEvent = MessageEvent<{
    type: 'KASPERIA_SIGN_MESSAGE_RESP';
    data: any;
}>;

// type MessageEvent = MessageEvent<{
//     type: 'KASPERIA_SIGN_MESSAGE_RESP';
//     data: any;
// }>;


// 扩展 window 接口，添加自定义字段
declare global {
    interface Window {
        kasperia?: Kasperia;
        mywallet?: any;
    }
}

class Kasperia {
    private bindEvent: boolean;

    constructor() {
        this.bindEvent = false;
    }

    signMessage(data?: any): Promise<any> {
        return new Promise((resolve) => {
            const listener = (event: SignMessageResponseEvent) => {
                if (event.data.type === 'KASPERIA_SIGN_MESSAGE_RESP') {
                    window.removeEventListener('message', listener);
                    this.bindEvent = false;
                    resolve(event.data.data);
                }
            };

            if (!this.bindEvent) {
                window.addEventListener('message', listener);
                this.bindEvent = true;
            }

            window.postMessage({ type: 'KASPERIA_SIGN_MESSAGE', data }, '*');
        });
    }

    getAccounts(): Promise<{ address: string }> {
        return Promise.resolve({
            address: 'kaspa:qrk9decfnl4rayeegp6gd3tc6605zavclkpud5jp78axat5namppwt050d57j',
        });
    }

    getBalance(): Promise<{ balance: string }> {
        return Promise.resolve({
            balance: '12600000000000',
        });
    }

    send(data?: any): Promise<any> {
        return new Promise((resolve) => {
            const listener = (event: SignMessageResponseEvent) => {
                if (event.data.type === 'KASPERIA_SIGN_MESSAGE_RESP') {
                    window.removeEventListener('message', listener);
                    this.bindEvent = false;
                    resolve(event.data.data);
                }
            };

            if (!this.bindEvent) {
                window.addEventListener('message', listener);
                this.bindEvent = true;
            }

            console.log("send", data)
            window.postMessage({ type: 'KASPERIA_SEND_KAS', data }, '*');
        });
    }
}

// 实例化
const kasperia = new Kasperia();

// 防止被覆盖
if (!window.mywallet) {
    Object.defineProperty(window, 'kasperia', {
        value: new Proxy(kasperia, {
            deleteProperty: () => true,
        }),
        writable: false,
    });
}

// 通知外部页面插件已注入
window.dispatchEvent(new Event('kasperia#initialized'));

export {};
