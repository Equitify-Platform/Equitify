import { Worker, NearAccount } from 'near-workspaces';
import { getContractWasmPath, test } from './utils/helpers';
import { IDOParams} from "../../contracts/src/launchpad";

const contractPath = getContractWasmPath('launchpad');

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;
  const contract = await root.createSubAccount('test-account');
  // Get wasm file path from package.json test script in folder above
  await contract.deploy(contractPath);

  await contract.call(contract, 'init', {
    _deployer: root.accountId,
    _launchedToken: root.accountId,
    _tokenFounder: root.accountId,
    _project: {
      hardCap: '1000',
      softCap: '100',
      saleStartTime: Math.floor(new Date().getTime() / 1000).toString(),
      saleEndTime: (Math.floor(new Date().getTime() / 1000) + 10000).toString(),
      price: '1'
    },
    _nft: root.accountId,
  });
  
  const state = await contract.viewState();

  console.log('contract state: ', state.get('token'));

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, contract };
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test('test', async (t) => {
  t.notThrows();
  
  t.is('Hello', 'Hello');
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