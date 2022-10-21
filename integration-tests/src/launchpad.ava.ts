import testAny from 'ava';
import { NearAccount, Worker } from 'near-workspaces';
import { getContractWasmPath, parseUnits, TestFuncWithWorker } from './utils/helpers';
import { IDOParams} from "../../contracts/src/launchpad";
import { BN } from 'bn.js';

const launchpadContractPath = getContractWasmPath('launchpad');
const idoTokenContractPath = getContractWasmPath('fungibleToken');

const test = testAny as TestFuncWithWorker<{
  launchpad: NearAccount,
  root: NearAccount,
  beneficiary: NearAccount,
  idoToken: NearAccount
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;

  const beneficiary = await root.createSubAccount('beneficiary');
  const idoToken = await root.createSubAccount('idotoken');

  const launchpad = await root.createSubAccount('launchpad');

  await idoToken.deploy(idoTokenContractPath);
  
  await idoToken.call(idoToken, 'init', {
    owner_id: root.accountId, 
    total_supply: parseUnits(1000000).toString()
  });
  
  console.log('balance owner', await idoToken.view('ft_balance_of', {
    account_id: root.accountId
  }))

  // Get wasm file path from package.json test script in folder above
  await launchpad.deploy(launchpadContractPath);

  const launchAmount = parseUnits(100).toString()

  await root.call(idoToken.accountId, 'storage_deposit', {
    account_id: launchpad.accountId,
  }, {
    attachedDeposit: parseUnits('1', 24)
  })

  await root.call(idoToken.accountId, 'ft_transfer', {
    receiver_id: launchpad.accountId,
    amount: launchAmount,
    memo: '',
  }, {
    attachedDeposit: parseUnits('1', 24)
  })


  console.log('balance owner after transfer', await idoToken.view('ft_balance_of', {
    account_id: root.accountId
  }))

  await launchpad.call(launchpad, 'init', {
    _deployer: root.accountId,
    _launchedToken: idoToken.accountId,
    _tokenFounder: root.accountId,
    _project: {
      hardCap: '1000',
      softCap: '100',
      saleStartTime:  '0',// Math.floor(new Date().getTime() / 1000).toString(),
      saleEndTime: (Math.floor(new Date().getTime()* 1_000_000) + 1_000_000_000_000).toString(),
      price: '1'
    },
    _nft: root.accountId,
  });

  const launchpadBalance: string = await idoToken.view('ft_balance_of', {
    account_id: launchpad.accountId
  });

  t.is(launchpadBalance, launchAmount);
  
  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, launchpad, beneficiary, idoToken};
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test('purchase tokens', async (t) => {
  const { launchpad, root, beneficiary } = t.context.accounts;

  const tx = await root.call(launchpad.accountId, 'purchaseTokens', {
    _beneficiary: beneficiary.accountId,
    _id: '0'
  }, {
    attachedDeposit: new BN('1000'),
    // gas: new BN('1000').mul(new BN(10).pow(new BN(18)))
  })

  console.log(tx);
});

// test('returns the default greeting', async (t) => {
//   const { contract } = t.context.accounts;
//   const message: string = await contract.view('get_greeting', {});
//   t.is(message, 'Hello');
// });

// test('changes the message', async (t) => {
//   const { root, contract } = t.context.accounts;
//   await root.call(contract, 'set_greeting', { message: 'Howdy' });
//   const message: string = await contract.view('get_greeting', {});
//   t.is(message, 'Howdy');
// });