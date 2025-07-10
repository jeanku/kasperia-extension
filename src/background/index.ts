import addServiceListener from './listener';
import PortMessage from '../content-script/message/portMessage';
import { providerController } from './controller';
import { sessionService } from './service';
import {Buffer} from 'buffer'

globalThis.Buffer = Buffer;

console.log("bg init ...")


// for page provider
chrome.runtime.onConnect.addListener((port) => {
    console.log("haha: addListener", port)
    if (port.name === 'popup' || port.name === 'notification' || port.name === 'tab') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pm = new PortMessage(port as any);
        pm.listen((data: any) => {
            console.log("haha: controller", data)
            if (data?.type) {
                switch (data.type) {
                    // console.log("haha: controller")
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
    pm.listen(async (data : any) => {
        console.log("【BG】pm.listen:", data);
        const tabId = port.sender?.tab?.id;
        if (!tabId) return;

        const session = sessionService.getOrCreateSession(tabId);

        //
        console.log("session hahah: ", session)
        const req = { data, session };
        // for background push to respective page
        // req.session.pushMessage = (event, data) => {
        //     pm.send('message', { event, data });
        // };
        // try {
        //     let s = await providerController(req);
        //     console.log("providerController(msg) then", s);
        //     return s;
        // } catch (e) {
        //     console.error("🔥 providerController 报错:", e);
        // }
        //
        // console.log("【BG】pm.listen44:", msg);
        return providerController(req);
    });

    port.onDisconnect.addListener(() => {
        console.log("port.onDisconnect")
    });
});

// Keep alive for MV3
const INTERNAL_STAYALIVE_PORT = 'CT_Internal_port_alive';
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
        alivePort.postMessage({ content: 'keep alive~', name: "123" });
        if (chrome.runtime.lastError) {
            console.log(`(DEBUG Highlander): postMessage error: ${chrome.runtime.lastError.message}`);
        } else {
            console.log(`(DEBUG Highlander): sent through ${alivePort.name} port`);
        }
    }
}, 20000);

addServiceListener()

import { initialize, Kiwi, Rpc } from '@kasplex/kiwi-web'
const wasmUrl = chrome.runtime.getURL('kaspa_bg.wasm');
await initialize(wasmUrl);

// //
// console.log(5555)
// //
// Kiwi.setNetwork(0)
//
// await Rpc.setInstance(Kiwi.network).connect()
// let mnemonicStr = Mnemonic.random(12)
//
// console.log("mnemonicStr:", mnemonicStr)
// let res = await KaspaApi.getBalance("kaspatest:qr6uzet8l842fz33kjl4jk0t6t7m43n8rxvfj6jms9jjz0n08rneuej3f0m08")
// let res = await KaspaApi.getBalance("kaspa:qr6uzet8l842fz33kjl4jk0t6t7m43n8rxvfj6jms9jjz0n08rneuc5hjq97r")
// console.log("balance:", res)
