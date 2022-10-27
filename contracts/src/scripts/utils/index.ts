import { BN } from "bn.js";

export const parseUnits = (amount: number | string, decimals: number = 18) => {
    return new BN(amount).mul(new BN(10).pow(new BN(decimals)));
}

export const secondsToNearTimestamp = (seconds: number) => {
    return seconds * 1_000_000_000
}