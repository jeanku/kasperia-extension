import addServiceListener from './listener';
import PortMessage from '../content-script/message/portMessage';
import {Buffer} from 'buffer'

globalThis.Buffer = Buffer;

chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('keepAlive', { periodInMinutes: 0.1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
        console.log('[keepAlive] Service worker woke up at', new Date().toLocaleTimeString());
    }
});

// let popupWindowId: number | null | undefined = null;

// const getCurrentWindow = (): Promise<chrome.windows.Window> => {
//     return new Promise((resolve) => {
//         chrome.windows.getCurrent({populate: false}, resolve);
//     });
// };
//
// const createOrUpdatePopupWindow = async (url: string = "index.html") => {
//     const currentWindow = await getCurrentWindow();
//
//     const windowWidth = 360;
//     const windowHeight = 600;
//     const leftPosition = (currentWindow.left || 0) + (currentWindow.width || 0) - windowWidth;
//     const topPosition = currentWindow.top;
//
//     if (popupWindowId) {
//         chrome.windows.update(popupWindowId, {focused: true}, () => {
//             if (chrome.runtime.lastError) {
//                 console.warn('Failed to focus existing popup:', chrome.runtime.lastError.message);
//                 popupWindowId = null;
//                 createOrUpdatePopupWindow();
//             }
//         });
//     } else {
//         chrome.windows.create(
//             {
//                 url: url,
//                 type: 'popup',
//                 width: windowWidth,
//                 height: windowHeight,
//                 left: leftPosition,
//                 top: topPosition,
//                 focused: true,
//             },
//             (newWindow) => {
//                 if (chrome.runtime.lastError) {
//                     console.error('Failed to open popup window:', chrome.runtime.lastError.message);
//                 } else if (newWindow) {
//                     popupWindowId = newWindow.id;
//
//                     // 清理关闭窗口时的 popupWindowId
//                     chrome.windows.onRemoved.addListener((windowId) => {
//                         if (windowId === popupWindowId) {
//                             popupWindowId = null;
//                         }
//                     });
//                 }
//             }
//         );
//     }
// };

// let portInstance: chrome.runtime.Port | null = null;
// chrome.runtime.onConnect.addListener((port) => {
//     console.log("addListener", port)
//     if (portInstance) {
//         return;
//     }
//
//     portInstance = port;
//
//     port.onMessage.addListener((msg) => {
//         console.log("【BG】onMessage port:", msg);
//
//         if (msg.action === 'PING') {
//             port.postMessage({action: 'PONG'});
//         }
//
//         // if (msg.type === 'OPEN_KASPERIA') {
//         //     createOrUpdatePopupWindow("index.html")
//         // }
//         //
//         // if (msg.type === 'KASPERIA_SIGN_MESSAGE') {
//         //     createOrUpdatePopupWindow("index.html#/unlock")
//         // }
//         //
//         // if (msg.type === 'KASPERIA_SEND_KAS') {
//         //     let data = msg.data.data
//         //     createOrUpdatePopupWindow(`index.html#/tx/send?tick=${data.tick}&dec=${data.dec}&amount=${data.amount}`)
//         // }
//     });
//
//     // Clean up the port instance when it gets disconnected
//     port.onDisconnect.addListener(() => {
//         console.log("Port disconnected");
//         portInstance = null;  // Reset port instance when disconnected
//     });
//
//     return true;
// });
//
//
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (portInstance) {
//         portInstance.postMessage(request)
//     }
//     console.log("request: ", request)
//     return true;
// });

// console.log("bg init ...")


// for page provider
chrome.runtime.onConnect.addListener((port) => {
    console.log("onConnect", port)
    if (port.name === 'popup' || port.name === 'notification' || port.name === 'tab') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pm = new PortMessage(port as any);
        pm.listen((data: any) => {
            if (data?.type) {
                switch (data.type) {
                    // case 'broadcast':
                    //     eventBus.emit(data.method, data.params);
                    //     break;
                    // case 'openapi':
                    //     if (walletController.openapi[data.method]) {
                    //         return walletController.openapi[data.method].apply(null, data.params);
                    //     }
                    //     break;
                    case 'controller':
                    default:
                        console.log("haha: controller")
                        // if (data.method) {
                        //     return walletController[data.method].apply(null, data.params);
                        // }
                }
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const boardcastCallback = (data: any) => {
            pm.request({
                type: 'broadcast',
                method: data.method,
                params: data.params
            });
        };

        if (port.name === 'popup') {
            // preferenceService.setPopupOpen(true);

            port.onDisconnect.addListener(() => {
                // preferenceService.setPopupOpen(false);
            });
        }

        // eventBus.addEventListener(EVENTS.broadcastToUI, boardcastCallback);
        port.onDisconnect.addListener(() => {
            // eventBus.removeEventListener(EVENTS.broadcastToUI, boardcastCallback);
            // gradually close rpc when popup window is closed --shwan
            // openapiService.countDownToCloseRpc()
        });

        return;
    }

    const pm = new PortMessage(port);
    pm.listen(async (data: any) => {
        console.log("hahaha pm")
        // if (!appStoreLoaded) {
        //     // todo
        // }
        // const sessionId = port.sender?.tab?.id;
        // const session = sessionService.getOrCreateSession(sessionId);
        //
        // const req = { data, session };
        // // for background push to respective page
        // req.session.pushMessage = (event, data) => {
        //     pm.send('message', { event, data });
        // };

        // return providerController(req);
    });

    port.onDisconnect.addListener(() => {
        // todo
    });
});

// Keep alive for MV3
const INTERNAL_STAYALIVE_PORT = 'CT_Internal_port_alive';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let alivePort: any = null;

setInterval(() => {
    console.log('Highlander', Date.now());
    if (alivePort == null) {
        // eslint-disable-next-line no-undef
        alivePort = chrome.runtime.connect({ name: INTERNAL_STAYALIVE_PORT });

        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        alivePort.onDisconnect.addListener((p: any) => {
            // eslint-disable-next-line no-undef
            if (chrome.runtime.lastError) {
                console.log('(DEBUG Highlander) Expected disconnect (on error). SW should be still running.');
            } else {
                console.log('(DEBUG Highlander): port disconnected');
            }

            alivePort = null;
        });
    }

    if (alivePort) {
        alivePort.postMessage({ content: 'keep alive~' });

        // eslint-disable-next-line no-undef
        if (chrome.runtime.lastError) {
            console.log(`(DEBUG Highlander): postMessage error: ${chrome.runtime.lastError.message}`);
        } else {
            console.log(`(DEBUG Highlander): sent through ${alivePort.name} port`);
        }
    }
}, 5000);




addServiceListener()