
import { bytes, Bytes, call, near, view } from "near-sdk-js"

export type Callback = {
    function: string,
    args?: Bytes
}

export const FIVE_TGAS = BigInt("50000000000000");
export const NO_DEPOSIT = BigInt(0);
export const NO_ARGS = bytes(JSON.stringify({}));


export abstract class WithCallback { 
    @call({ privateFunction: true })
    __WithCallback_init() {
    }

    @call({ privateFunction: true })
    _execute_callback_private({ 
        callback,
        promise,
        depositAmount = NO_DEPOSIT,
        gas = FIVE_TGAS,
    }: { 
        callback: Callback,
        promise: number | bigint,
        depositAmount?: number | bigint,
        gas?: number | bigint,
    }) {
        near.promiseThen(
            promise,
            near.currentAccountId(),
            callback.function,
            callback.args ?? NO_ARGS,
            depositAmount,
            gas
        )
    }
}