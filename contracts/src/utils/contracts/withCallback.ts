
import { bytes, Bytes, call, near, NearPromise, view } from "near-sdk-js"
import { PromiseIndex } from "near-sdk-js/lib/utils";
import { parseTGas } from "..";

export type PromiseCall = {
    function: string,
    accountId?: string
    args?: Bytes,
    gas?: bigint,
    deposit?: bigint
}


export const MAX_TGAS = parseTGas(30);
export const NO_DEPOSIT = BigInt(0);
export const NO_ARGS = JSON.stringify({});

export abstract class WithCallback {
    @call({ privateFunction: true })
    __WithCallback_init() {
    }

    protected _executePromise({ call, callback }: { call: PromiseCall, callback?: PromiseCall }) {
        let promise = NearPromise.new(call.accountId ?? near.currentAccountId());

        promise = promise.functionCall(
            call.function,
            call.args ?? NO_ARGS,
            call.deposit ?? NO_DEPOSIT,
            call.gas ?? MAX_TGAS
        );

        if (callback)
            return this._execute_callback_private({
                promise,
                callback,
            })
        
        return promise;
    }
    protected _execute_callback_private({
        callback,
        promise
    }: {
        callback: PromiseCall,
        promise: NearPromise,
    }) {
        return promise.then(
            NearPromise.new(near.currentAccountId()).
                functionCall(
                    callback.function,
                    callback?.args ?? NO_ARGS,
                    callback?.deposit ?? NO_DEPOSIT,
                    callback?.gas ?? MAX_TGAS
                ));
    }
}