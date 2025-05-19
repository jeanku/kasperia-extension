let channelName = 'kasperiaChannel';
//
// let portInstance: chrome.runtime.Port | null = null;
//
// // Connect to the background script
// const connectToBackground = (): void => {
//     if (portInstance) {
//         console.log("Already connected to background.");
//         return;
//     }
//
//     portInstance = chrome.runtime.connect({ name: channelName });
//
//     // Listen for messages from the background script
//     portInstance.onMessage.addListener((response: any) => {
//         window.postMessage(response, '*');
//     });
//
//     // Handle disconnection from background
//     portInstance.onDisconnect.addListener(() => {
//         portInstance = null; // Reset port when disconnected
//     });
// };
//
// // Message event type (for stricter typing)
// interface KasperiaMessageEvent extends MessageEvent {
//     data: {
//         type: string;
//         [key: string]: any;
//     };
// }
//
// // Add event listener to handle messages from the window
// window.addEventListener('message', (event: KasperiaMessageEvent) => {
//     console.log("content addEventListener", event);
//
//     // Make sure the event comes from the same window
//     if (event.source !== window) return;
//
//     if (event.data.type === 'KASPERIA_SIGN_MESSAGE') {
//         console.log("Received OPEN_KASPERIA message in content script");
//
//         // Ensure we are connected to the background script
//         connectToBackground();
//
//         // Forward the message to the background
//         if (portInstance) {
//             portInstance.postMessage({ type: 'OPEN_KASPERIA' });
//         }
//     }
//
//     if (event.data.type === 'KASPERIA_SEND_KAS') {
//         console.log("Received KASPERIA_SEND_KAS message in content script");
//
//         connectToBackground();
//
//         if (portInstance) {
//             portInstance.postMessage({ type: 'KASPERIA_SEND_KAS', data: event.data });
//         }
//     }
// });

console.log("inject Script... 123")

import PortMessage from './message/portMessage';
import BroadcastChannelMessage from './message/boardcastMessage';

// Inject custom script into the page
function injectScript(): void {
    try {
        console.log("injectScript...")
        const container = document.head || document.documentElement;
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute('async', 'false');
        scriptTag.src = chrome.runtime.getURL('injected.js');
        container.insertBefore(scriptTag, container.children[0]);
        container.removeChild(scriptTag);

        // const { BroadcastChannelMessage, PortMessage } = Message;


        const pm = new PortMessage().connect();
        //
        const bcm = new BroadcastChannelMessage(channelName).listen(
            (data: any) => {
                pm.request(data)
            });
        //
        // background notification
        pm.on('message', (data: any) => {
            console.log("haha pm.on", data)
            bcm.send('message', data);
        });
        //
        document.addEventListener('beforeunload', () => {
            bcm.dispose();
            pm.dispose();
        });

    } catch (error) {
        console.error('Kasperia: Provider injection failed.', error);
    }
}

/**
 * Checks the doctype of the current document if it exists
 *
 * @returns {boolean} {@code true} if the doctype is html or if none exists
 */
function doctypeCheck() {
    const { doctype } = window.document;
    if (doctype) {
        return doctype.name === 'html';
    }
    return true;
}

/**
 * Returns whether or not the extension (suffix) of the current document is prohibited
 *
 * This checks {@code window.location.pathname} against a set of file extensions
 * that we should not inject the provider into. This check is indifferent of
 * query parameters in the location.
 *
 * @returns {boolean} whether or not the extension of the current document is prohibited
 */
function suffixCheck() {
    const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
    const currentUrl = window.location.pathname;
    for (let i = 0; i < prohibitedTypes.length; i++) {
        if (prohibitedTypes[i].test(currentUrl)) {
            return false;
        }
    }
    return true;
}

/**
 * Checks the documentElement of the current document
 *
 * @returns {boolean} {@code true} if the documentElement is an html node or if none exists
 */
function documentElementCheck() {
    const documentElement = document.documentElement.nodeName;
    if (documentElement) {
        return documentElement.toLowerCase() === 'html';
    }
    return true;
}

/**
 * Checks if the current domain is blocked
 *
 * @returns {boolean} {@code true} if the current domain is blocked
 */
function blockedDomainCheck() {
    const blockedDomains: string[] = [];
    const currentUrl = window.location.href;
    let currentRegex;
    for (let i = 0; i < blockedDomains.length; i++) {
        const blockedDomain = blockedDomains[i].replace('.', '\\.');
        currentRegex = new RegExp(`(?:https?:\\/\\/)(?:(?!${blockedDomain}).)*$`, 'u');
        if (!currentRegex.test(currentUrl)) {
            return true;
        }
    }
    return false;
}

function iframeCheck() {
    const isInIframe = self != top;
    if (isInIframe) {
        return true;
    } else {
        return false;
    }
}

/**
 * Determines if the provider should be injected
 *
 * @returns {boolean} {@code true} Whether the provider should be injected
 */
function shouldInjectProvider() {
    return doctypeCheck() && suffixCheck() && documentElementCheck() && !blockedDomainCheck() && !iframeCheck();
}

// if (shouldInjectProvider()) {
//     injectScript();
// }


injectScript();

export {}