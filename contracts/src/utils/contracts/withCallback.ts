
import { bytes, Bytes, call, near, view } from "near-sdk-js"
import { PromiseIndex } from "near-sdk-js/lib/utils";
import { parseTGas } from "..";

export type Callback = {
    function: string,
    args?: Bytes,
    gas?: bigint,
    deposit?:bigint
}

export const FIVE_TGAS = parseTGas(5);
export const NO_DEPOSIT = BigInt(0);
export const NO_ARGS = bytes(JSON.stringify({}));

export abstract class WithCallback { 
    @call({ privateFunction: true })
    __WithCallback_init() {
    }

    @call({ privateFunction: true })
    _execute_callback_private({ 
        callback,
        promise
    }: { 
        callback: Callback,
        promise: PromiseIndex,
    }) {
        near.promiseThen(
            promise,
            near.currentAccountId(),
            callback.function,
            callback.args ?? NO_ARGS,
            callback.deposit ?? NO_DEPOSIT ,
            callback?.gas ?? FIVE_TGAS
        )
    }
}