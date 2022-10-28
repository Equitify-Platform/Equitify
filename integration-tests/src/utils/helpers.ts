import testAny, { TestFn } from 'ava';
import BN from 'bn.js';
import { NearAccount, Worker } from 'near-workspaces';
import path from 'path';

export type TestContext<TAccounts> = {
  worker: Worker;
  accounts: TAccounts;
}


export type TestFuncWithWorker<TAccounts = Record<string, NearAccount>> = TestFn<TestContext<TAccounts>>

type Contract = 'launchpad' | 'launchpad_factory' | 'ft' | 'nft' | 'equitify_platform'

export const getContractWasmPath = (contract: Contract) => {
    return path.join('build', `${contract}.wasm`);
}

export const parseUnits = (amount: number | string, decimals: number = 18): BN => {
  return new BN(amount).mul(new BN(10).pow(new BN(decimals)));
}