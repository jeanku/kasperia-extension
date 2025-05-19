/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ethErrors } from 'eth-rpc-errors';
// import 'reflect-metadata';

import { keyringService, notificationService, permissionService } from '@/background/service';
import { PromiseFlow, underline2Camelcase } from '@/background/utils';

export const IS_CHROME = /Chrome\//i.test(navigator.userAgent);

export const IS_FIREFOX = /Firefox\//i.test(navigator.userAgent);

export const IS_LINUX = /linux/i.test(navigator.userAgent);


const flow = new PromiseFlow();

const flowContext = flow
  .use(async (ctx: any, next: any) => {
      let isLocked = await keyringService.isLocked()
      if (isLocked) {
          await notificationService.requestApproval({}, { route: "/notification/unlock" })
      }
      return next();
  })
  // .use(async (ctx: any, next: any) => {
  //     let isLocked = await keyringService.isLocked()
  //     console.log("isLocked2", isLocked)
  //     return next();
  // })
  .callback();

export default (request: any) => {
  const ctx: any = { request: { ...request, requestedApproval: false } };
  console.log("flowContext ctx", ctx)
  return flowContext(ctx).finally(() => {
    // if (ctx.request.requestedApproval) {
    //   flow.requestedApproval = false;
    //   // only unlock notification if current flow is an approval flow
    //   notificationService.unLock();
    // }
  });
};