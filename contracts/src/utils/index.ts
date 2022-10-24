import { near } from "near-sdk-js"

export const log = (...params: any[]) =>{
    near.log(params)
}

export const parseTGas =(tgas: bigint | number | string) =>{
    return  BigInt(tgas) * BigInt('1000000000000')
}

export const promiseResult = (): {result: string, success: boolean} => {
    let result: string, success: boolean;
    
    try{ result = near.promiseResult(0); success = true }
    catch{ result = undefined; success = false }
    
    return {result, success}
  }