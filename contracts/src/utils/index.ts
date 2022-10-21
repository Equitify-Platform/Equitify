import { near } from "near-sdk-js"

export const log = (...params: any[]) =>{
    near.log(params)
}

export const parseTGas =(tgas: bigint | number | string) =>{
    return  BigInt(tgas) * BigInt('10000000000000')
}