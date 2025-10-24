import { Address } from '../address';
import {NetworkId, ScriptPublicKey} from '../consensus';
import { OpCodes, ScriptBuilder } from '../tx/script';
import { addressFromScriptPublicKey } from '../util';
import { validateU64, validateU8 } from '../util';

/**
 * Options for deploying a KRC-20 token.
 */
interface Krc20DeployOptions {
  tick: string;
  max: string;
  lim: string;
  to?: string;
  dec?: number;
  pre?: string;
}

/**
 * Options for minting a KRC-20 token.
 */
interface Krc20MintOptions {
  tick: string;
  to?: string;
}

/**
 * Options for transferring a KRC-20 token.
 * Either tick or ca must be provided, but not both.
 */
interface Krc20TransferOptions {
  tick?: string;
  ca?: string;
  to: string;
  amount: bigint;
}


type Krc20OperationOptions = Krc20DeployOptions | Krc20MintOptions | Krc20TransferOptions;

abstract class Krc20Script {
  sender: Address;
  networkId: NetworkId;
  options: Krc20OperationOptions;

  protected constructor(
    sender: Address | string,
    networkId: NetworkId,
    options: Krc20OperationOptions,
  ) {
    const hasCa = 'ca' in options && typeof options.ca === 'string' && options.ca.length > 0;
    const hasTick = typeof options.tick === 'string' && options.tick.length > 0;

    if (hasCa && hasTick) {
      throw new Error('Cannot specify both tick and ca');
    }
    if (!hasCa && !hasTick) {
      throw new Error('Must specify either tick or ca');
    }
    if (hasCa) {
      if (!/^[a-zA-Z0-9]{64}$/.test(options.ca!)) {
        throw new Error('Invalid ca format');
      }
    }
    if (hasTick) {
      if (!/^[a-zA-Z]{4,6}$/.test(options.tick!)) {
        throw new Error('Invalid tick');
      }
    }

    this.sender = typeof sender === 'string' ? Address.fromString(sender) : sender;
    this.networkId = networkId;
    this.options = options;
  }

  // /**
  //  * Converts the parameters to commit transaction generator settings.
  //  * @param uxtos - The UTXO entries.
  //  * @returns The generator settings.
  //  */
  // toCommitTxGeneratorSettings(uxtos: UtxoEntryReference[] | RpcUtxosByAddressesEntry[] = []): GeneratorSettings {
  //   const P2SHAddress = addressFromScriptPublicKey(
  //     this.script.createPayToScriptHashScript(),
  //     this.networkId.networkType
  //   )!;
  //
  //   const output = new PaymentOutput(P2SHAddress, this.outputAmount);
  //   return new GeneratorSettings(output, this.sender, uxtos, this.networkId, this.commitTxPriorityFee);
  // }

  // /**
  //  * Converts the parameters to reveal transaction generator settings.
  //  * @param uxtos - The UTXO entries.
  //  * @param commitTxId - The commit transaction ID.
  //  * @returns The generator settings.
  //  */
  // toRevealTxGeneratorSettings(
  //   uxtos: UtxoEntryReference[] | RpcUtxosByAddressesEntry[] = [],
  //   commitTxId: TransactionId
  // ): GeneratorSettings {
  //   const P2SHAddress = addressFromScriptPublicKey(
  //     this.script.createPayToScriptHashScript(),
  //     this.networkId.networkType
  //   )!;
  //   const priorityEntries = [
  //     new UtxoEntryReference(
  //       P2SHAddress,
  //       new TransactionOutpoint(commitTxId, 0),
  //       this.outputAmount,
  //       this.script.createPayToScriptHashScript(),
  //       0n,
  //       false
  //     )
  //   ];
  //   return new GeneratorSettings([], this.sender, uxtos, this.networkId, this.revealPriorityFee, priorityEntries);
  // }

  /**
   * Abstract method to get the script builder for the transaction.
   * @returns The script builder.
   */
  abstract get script(): ScriptBuilder;

  /**
   * Helper method to create a script builder with the given data.
   * @param data - The data to include in the script.
   * @returns The script builder.
   */
  protected getScriptBuilder = (data: object): ScriptBuilder => {
    return new ScriptBuilder()
      .addData(this.sender.payload)
      .addOp(OpCodes.OpCheckSig)
      .addOp(OpCodes.OpFalse)
      .addOp(OpCodes.OpIf)
      .addData(Buffer.from('kasplex'))
      .addI64(0n)
      .addData(Buffer.from(JSON.stringify(data, null, 0)))
      .addOp(OpCodes.OpEndIf);
  };

  /**
   * Gets the P2SH address for the transaction.
   * @returns The P2SH address.
   */
  get p2shAddress(): Address {
    return addressFromScriptPublicKey(this.script.createPayToScriptHashScript(), this.networkId.networkType)!;
  }

  payToScriptPublicKey(): ScriptPublicKey {
    return this.script.createPayToScriptHashScript()
  }
}

/**
 * Class representing the parameters for deploying a KRC-20 token.
 */
class Krc20DeployScript extends Krc20Script {
  constructor(
    sender: Address,
    networkId: NetworkId,
    options: Krc20DeployOptions,
  ) {
    if (options.max < options.lim) throw new Error('max must be greater than or equal to lim');
    if (options.dec !== undefined) validateU8(options.dec, 'options.dec');
    if (options.pre !== undefined) validateU64(BigInt(options.pre), 'options.pre');
    if (options.to != undefined && !Address.validate(options.to)) throw new Error('Invalid address format');

    super(sender, networkId, options);
  }

  /**
   * Gets the script builder for the deployment transaction.
   * @returns The script builder.
   */
  get script(): ScriptBuilder {
    const { tick, max, lim, to, dec, pre } = this.options as Krc20DeployOptions;
    const data = { p: 'krc-20', op: 'deploy', tick: tick, max: max.toString(), lim: lim.toString() } as any;
    if (to) data['to'] = to;
    if (dec) data['dec'] = dec;
    if (pre) data['pre'] = pre.toString();
    return this.getScriptBuilder(data);
  }
}

class Krc20MintScript extends Krc20Script {
  constructor(
    sender: Address,
    networkId: NetworkId,
    options: Krc20MintOptions,
  ) {
    if (options.to != undefined && !Address.validate(options.to)) throw new Error('Invalid address format');
    super(sender, networkId, options);
  }

  get script(): ScriptBuilder {
    const { tick, to } = this.options as Krc20MintOptions;
    const data = { p: 'krc-20', op: 'mint', tick: tick } as any;
    if (to) data['to'] = to;
    return this.getScriptBuilder(data);
  }
}

class Krc20TransferScript extends Krc20Script {
  constructor(
    sender: Address | string,
    networkId: NetworkId,
    options: Krc20TransferOptions,
  ) {
    if (options.amount <= 0n) throw new Error('amount must be greater than 0');
    if (!Address.validate(options.to)) throw new Error('Invalid address format');
    if (options.tick !== undefined && options.ca !== undefined) throw new Error('Cannot specify both tick and ca');
    if (options.tick === undefined && options.ca === undefined) throw new Error('Must specify either tick or ca');
    super(sender, networkId, options);
  }

  get script(): ScriptBuilder {
    const { tick, ca, to, amount } = this.options as Krc20TransferOptions;
    const data = {
      p: 'krc-20',
      op: 'transfer',
      ...(tick ? { tick } : { ca }),
      amt: amount.toString(),
      to
    } as any;
    return this.getScriptBuilder(data);
  }
}

export { Krc20DeployScript, Krc20MintScript, Krc20TransferScript, Krc20Script };
export type { Krc20DeployOptions, Krc20MintOptions, Krc20TransferOptions };
