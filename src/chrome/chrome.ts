export class Chrome {
    static request(param: any): Promise<any> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(param, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    if (response && (typeof response === 'object' && response.error)) {
                        reject(Error(response.error))
                    }
                    resolve(response);
                }
            });
        });
    }
}
