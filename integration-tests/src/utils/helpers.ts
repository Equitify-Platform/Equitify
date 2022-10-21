import testAny, { TestFn } from 'ava';
import { NearAccount, Worker } from 'near-workspaces';
import path from 'path';

export const test = testAny as TestFn<{
    worker: Worker;
    accounts: Record<string, NearAccount>;
  }>

type Contract = 'launchpad'

export const getContractWasmPath = (contract: Contract) => {
    return path.join('build', `${contract}.wasm`);
}