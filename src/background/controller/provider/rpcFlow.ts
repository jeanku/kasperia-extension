/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ethErrors } from 'eth-rpc-errors';
// import 'reflect-metadata';

import { keyringService, notificationService, permissionService } from '@/background/service';
import { PromiseFlow, underline2Camelcase } from '@/background/utils';
import providerController from './controller';

export const IS_CHROME = /Chrome\//i.test(navigator.userAgent);

export const IS_FIREFOX = /Firefox\//i.test(navigator.userAgent);

export const IS_LINUX = /linux/i.test(navigator.userAgent);


const flow = new PromiseFlow();

const flowContext = flow
    // .use(async (ctx: any, next: any) => {
    //     const {
    //         data: { method }
    //     } = ctx.request;
    //     ctx.mapMethod = underline2Camelcase(method);
    //     if (!(providerController as any)[ctx.mapMethod]) {
    //         throw ethErrors.rpc.methodNotFound({
    //             message: `method [${method}] doesn't has corresponding handler`,
    //             data: ctx.request.data
    //         });
    //     }
    //     return next();
    // })
  .use(async (ctx: any, next: any) => {
      let isLocked = await keyringService.isLocked()
      if (isLocked) {
          ctx.flowContinue = true;
          await notificationService.requestApproval({}, { route: "/evokeBoost/notification/unlock" })
      }
      return next();
  })
  .use(async (ctx: any, next: any) => {
      const {
          request: {
              session: { origin, name, icon }
          },
      } = ctx;
      console.log("origin", origin, await permissionService.hasPermission(origin))
      if (!await permissionService.hasPermission(origin)) {
          ctx.flowContinue = true;
          await notificationService.requestApproval(
              {
                  params: {
                      data: {},
                      session: { origin, name, icon }
                  },
                },
          { route: "/evokeBoost/notification/connect" }
          )
      }
      return next()
  })
    .use(async (ctx: any, next: any) => {
        const {
            data: { method, params }
        } = ctx.request;
        ctx.mapMethod = underline2Camelcase(method);
        if ((providerController as any)[ctx.mapMethod]) {
            return await (providerController as any)[ctx.mapMethod](params)
        }
        return
    })
  .callback();

export default (request: any) => {
  const ctx: any = { request: { ...request, requestedApproval: false } };
  return flowContext(ctx).finally(() => {
    // if (ctx.request.requestedApproval) {
    //   flow.requestedApproval = false;
    //   // only unlock notification if current flow is an approval flow
    //   notificationService.unLock();
    // }
  });
};