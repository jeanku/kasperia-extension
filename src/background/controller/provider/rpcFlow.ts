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
      console.log("flowContext step1 start")
      let isLocked = await keyringService.isLocked()
      if (isLocked) {
          await notificationService.requestApproval({}, { route: "/evokeBoost/notification/unlock" })
      }
      console.log("flowContext step1 end")
      return next();
  })
  .use(async (ctx: any, next: any) => {
      console.log("flowContext step2 start", ctx)
      await notificationService.requestApproval({

      }, { route: "/notification/sendkaspa?address=qr6uzet8l842fz33kjl4jk0t6t7m43n8rxvfj6jms9jjz0n08rneuej3f0m08&amount=100000" })
      return next();
  })
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