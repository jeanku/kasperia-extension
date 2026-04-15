declare namespace chrome.sidePanel {
    interface CloseOptions {
        tabId?: number;
        windowId?: number;
    }

    function close(options: CloseOptions): Promise<void>;
}