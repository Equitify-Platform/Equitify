import { near } from "near-sdk-js"

export const log = (...params: any[]) =>{
    near.log(params)
}