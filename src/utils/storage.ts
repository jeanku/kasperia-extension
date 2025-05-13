export class Storage {
  
  /**
   * Sets data in Chrome storage
   * @param key - The key to identify the data
   * @param value - The value to store
   * @returns Promise<void>
   */
  static setData<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Retrieves data from Chrome storage
   * @param key - The key to identify the data
   * @returns Promise<T | null>
   */
  static getData<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key] || null);
        }
      });
    });
  }

  /**
   * Removes data from Chrome storage
   * @param key - The key to identify the data
   * @returns Promise<void>
   */
  static removeData(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Clears all data from Chrome storage
   * @returns Promise<void>
   */
  static clearData(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Adds a listener for storage changes
   * @param callback - Function to handle changes
   */
  static addChangeListener(callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void): void {
    chrome.storage.onChanged.addListener(callback);
  }
}
