import { keyringService, notificationService, permissionService } from '@/background/service';
import { PromiseFlow, underline2Camelcase } from '@/background/utils';
import providerController from './controller';

const flow = new PromiseFlow();

const flowContext = flow
  .use(async (ctx: any, next: any) => {
      if (notificationService.notifiRoute == "/evokeBoost/notification/unlock") {
          return
      }
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
      if (notificationService.notifiRoute == "/evokeBoost/notification/connect" ) return
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
        ctx.mapMethod = underline2Camelcase(method);
        if ((providerController as any)[ctx.mapMethod]) {
            return await (providerController as any)[ctx.mapMethod](ctx.request)
        }
    })
  .callback();

export default async (request: any) => {
    const ctx: any = { request: { ...request, requestedApproval: false } };
    const {
        data: { method },
        session: { origin }
    } = ctx.request;

    if (method === 'eth_accounts' || method === 'getAccounts') {
        let isLocked = await keyringService.isLocked()
        if (isLocked || !await permissionService.hasPermission(origin) ) {
            return []
        }
        return (providerController as any)[method](ctx.request)
    }

    if (method == "eth_chainId" || method == "net_version" || method == "eth_blockNumber" || method == "eth_getTransactionReceipt" || method == "eth_getTransactionByHash"
        || method == "eth_getBlockByNumber" || method == "eth_getBalance" || method == "wallet_revokePermissions" || method == "eth_call"
        || method == "eth_estimateGas" || method == "eth_getCode" || method == "wallet_getPermissions" || method == "eth_getTransactionCount"
        || method == "getNetwork") {
        return (providerController as any)[method](ctx.request)
    }

    return flowContext(ctx);
};