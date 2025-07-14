import { keyringService, notificationService, permissionService } from '@/background/service';
import { PromiseFlow, underline2Camelcase } from '@/background/utils';
import providerController from './controller';


const flow = new PromiseFlow();

const flowContext = flow
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
  }).use(async (ctx: any, next: any) => {
        const {
            data: { method, params }
        } = ctx.request;
        const r = ctx.request
        ctx.mapMethod = underline2Camelcase(method);
        if ((providerController as any)[ctx.mapMethod]) {
            return await (providerController as any)[ctx.mapMethod](ctx.request)
        }
    })
  .callback();

export default (request: any) => {
  const ctx: any = { request: { ...request, requestedApproval: false } };
  return flowContext(ctx);
};