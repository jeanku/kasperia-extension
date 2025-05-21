/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethErrors } from 'eth-rpc-errors';
import { EthereumProviderError } from 'eth-rpc-errors/dist/classes';
import Events from 'events';
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
  reject(err: EthereumProviderError<any>): void;
}

export const IS_CHROME = /Chrome\//i.test(navigator.userAgent);

export const IS_FIREFOX = /Firefox\//i.test(navigator.userAgent);

export const IS_LINUX = /linux/i.test(navigator.userAgent);


// something need user approval in window
// should only open one window, unfocus will close the current notification
class NotificationService extends Events {
  approval: Approval | null = null;
  notifiWindowId = 0;
  isLocked = false;

  constructor() {
    super();

    winMgr.event.on('windowRemoved', (winId: number) => {
      if (winId === this.notifiWindowId) {
        this.notifiWindowId = 0;
        this.rejectApproval();
      }
    });

    winMgr.event.on('windowFocusChange', (winId: number) => {
      if (this.notifiWindowId && winId !== this.notifiWindowId) {
        if (IS_CHROME && winId === chrome.windows.WINDOW_ID_NONE && IS_LINUX) {
          return;
        }
        this.rejectApproval();
      }
    });
  }

  getApproval = () => this.approval?.data;

  resolveApproval = (data?: any, forceReject = false) => {
    if (forceReject) {
      this.approval?.reject(new EthereumProviderError(4001, 'User Cancel'));
    } else {
      this.approval?.resolve(data);
    }
    this.approval = null;
    this.emit('resolve', data);
  };

  rejectApproval = async (err?: string, stay = false, isInternal = false) => {
    if (!this.approval) return;
    if (isInternal) {
      this.approval?.reject(ethErrors.rpc.internal(err));
    } else {
      this.approval?.reject(ethErrors.provider.userRejectedRequest<any>(err));
    }

    await this.clear(stay);
    this.emit('reject', err);
  };

  // currently it only support one approval at the same time
  requestApproval = async (data: any, winProps?: any): Promise<any> => {
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
