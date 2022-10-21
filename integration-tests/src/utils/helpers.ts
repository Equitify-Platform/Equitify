import testAny, { TestFn } from 'ava';
import BN from 'bn.js';
import { NearAccount, Worker } from 'near-workspaces';
import path from 'path';

export type TestFuncWithWorker<TAccounts = Record<string, NearAccount>> = TestFn<{
  worker: Worker;
  accounts: TAccounts;
}>

type Contract = 'launchpad' | 'fungibleToken'

export const getContractWasmPath = (contract: Contract) => {
    return path.join('build', `${contract}.wasm`);
}

export const parseUnits = (amount: number | string, decimals: number = 18): BN => {
  return new BN('1000000').mul(new BN(10).pow(new BN(decimals)));
}