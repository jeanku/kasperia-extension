import { ethErrors } from 'eth-rpc-errors';
import { EthereumProviderError } from 'eth-rpc-errors/dist/classes';
import { winMgr } from '../webapi';

interface Approval {
  data: {
    state: number;
    params?: any;
    origin?: string;
    approvalComponent: string;
    requestDefer?: Promise<any>;
    approvalType: string;
  };
  resolve(params?: any): void;
  reject(err: Error): void;
}

export const IS_CHROME = /Chrome\//i.test(navigator.userAgent);

export const IS_FIREFOX = /Firefox\//i.test(navigator.userAgent);

export const IS_LINUX = /linux/i.test(navigator.userAgent);


// something need user approval in window
// should only open one window, unfocus will close the current notification
class NotificationService {
  approval: Approval | null = null;
  notifiWindowId = 0;
  isLocked = false;

  constructor() {
    chrome.windows.onFocusChanged.addListener((winId) => {
      console.log("onFocusChanged: ", this.notifiWindowId, winId, IS_CHROME && winId === chrome.windows.WINDOW_ID_NONE && IS_LINUX)
      if (this.notifiWindowId && winId !== this.notifiWindowId) {
        return;
        // if (IS_CHROME && winId === chrome.windows.WINDOW_ID_NONE) {
        //   return;
        // }
        // this.rejectApproval();
      }
    });

    chrome.windows.onRemoved.addListener((winId) => {
      if (winId === this.notifiWindowId) {
        this.notifiWindowId = 0;
        this.rejectApproval();
      }
    });
  }

  getApproval = async () => this.approval?.data;

  resolveApproval = async (data?: any, forceReject = false) => {
    if (forceReject) {
      this.approval?.reject(new EthereumProviderError(4001, 'User Cancel'));
    } else {
      this.approval?.resolve(data);
    }
    this.approval = null;
    this.clear();
  };

  rejectApproval = async (err?: string, stay = false, isInternal = false) => {
    if (!this.approval) return;
    if (isInternal) {
      this.approval?.reject(ethErrors.rpc.internal(err));
    } else {
      this.approval?.reject(new EthereumProviderError(4001, 'User Cancel'));
    }
    await this.clear(stay);
  };

  // currently it only support one approval at the same time
  requestApproval = async (data: any, winProps?: any): Promise<any> => {
    console.log("requestApproval .............." )
    return new Promise((resolve, reject) => {
      this.approval = {
        data,
        resolve,
        reject
      };
      this.openNotification(winProps);
    });
  };

  clear = async (stay = false) => {
    this.approval = null;
    if (this.notifiWindowId && !stay) {
      await winMgr.remove(this.notifiWindowId);
      this.notifiWindowId = 0;
    }
  };

  unLock = () => {
    this.isLocked = false;
  };

  lock = () => {
    this.isLocked = true;
  };

  openNotification = (winProps: any) => {
    if (this.notifiWindowId) {
      this.notifiWindowId = 0;
    }
    winMgr.openNotification(winProps).then((winId: any) => {
      this.notifiWindowId = winId!;
    });
  };
}

export default new NotificationService();
