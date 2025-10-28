import addServiceListener from './listener';
import PortMessage from '../content-script/message/portMessage';
import { providerController } from './controller';
import { sessionService } from './service';
import {Buffer} from 'buffer'

globalThis.Buffer = Buffer;

console.log("bg init 12344...")


// for page provider
chrome.runtime.onConnect.addListener((port) => {

    console.log("onConnect start provider", port.name)
    // if (port.name === 'popup' || port.name === 'notification' || port.name === 'tab') {
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     const pm = new PortMessage(port as any);
    //     pm.listen((data: any) => {
    //         console.log("haha: controller", data)
    //         if (data?.type) {
    //             switch (data.type) {
    //                 // console.log("haha: controller")
    //                 // case 'broadcast':
    //                 //     eventBus.emit(data.method, data.params);
    //                 //     break;
    //                 // case 'openapi':
    //                 //     if (walletController.openapi[data.method]) {
    //                 //         return walletController.openapi[data.method].apply(null, data.params);
    //                 //     }
    //                 //     break;
    //                 case 'controller':
    //                 default:
    //                     console.log("haha: controller")
    //                 // if (data.method) {
    //                 //     return walletController[data.method].apply(null, data.params);
    //                 // }
    //             }
    //         }
    //     });
    //
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     const boardcastCallback = (data: any) => {
    //         pm.request({
    //             type: 'broadcast',
    //             method: data.method,
    //             params: data.params
    //         });
    //     };
    //
    //     if (port.name === 'popup') {
    //         // preferenceService.setPopupOpen(true);
    //
    //         port.onDisconnect.addListener(() => {
    //             // preferenceService.setPopupOpen(false);
    //         });
    //     }
    //
    //     // eventBus.addEventListener(EVENTS.broadcastToUI, boardcastCallback);
    //     port.onDisconnect.addListener(() => {
    //         // eventBus.removeEventListener(EVENTS.broadcastToUI, boardcastCallback);
    //         // gradually close rpc when popup window is closed --shwan
    //         // openapiService.countDownToCloseRpc()
    //     });
    //
    //     return;
    // }

    const pm = new PortMessage(port);
    pm.listen(async (data : any) => {
        console.log("【BG】pm.listen:", data);
        const tabId = port.sender?.tab?.id;
        if (!tabId) return;

        const origin = new URL(port.sender?.tab?.url || "").origin;
        const session = sessionService.getOrCreateSession(tabId, {
            origin,
            icon: port.sender?.tab?.favIconUrl || "",
            name: port.sender?.tab?.title || "",
        });

        const req = { data, session };
        req.session.pushMessage = (event: any, data: any) => {
            console.log("init pushMessage function", event, data)
            pm.send('message', { event, data });
        };

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
    }
}, 20000);


addServiceListener()
