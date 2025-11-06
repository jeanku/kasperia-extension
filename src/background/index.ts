import addServiceListener from './listener';
import PortMessage from '../content-script/message/portMessage';
import { providerController } from './controller';
import { sessionService } from './service';
import {Buffer} from 'buffer'

globalThis.Buffer = Buffer;

// for page provider
chrome.runtime.onConnect.addListener((port) => {

    const pm = new PortMessage(port);
    pm.listen((data : any) => {
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
            pm.send('message', { event, data });
        };
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
