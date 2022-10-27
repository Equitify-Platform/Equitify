import testAny, { ExecutionContext } from 'ava';
import { NearAccount, Worker } from 'near-workspaces';
import { getContractWasmPath, parseUnits, TestContext, TestFuncWithWorker } from './utils/helpers';
import { GetIdoDataResult, IDOData, IDOParams } from "../../contracts/src/launchpad";
import { BN } from 'bn.js';
import { LaunchpadJsonToken } from '../../contracts/src/nft';
import { FTContractMetadata } from '../../contracts/src/ft';

const launchpadContractPath = getContractWasmPath('launchpad');
const launchpadFactoryContractPath = getContractWasmPath('launchpad_factory');
const idoTokenContractPath = getContractWasmPath('ft');
const nftContractPath = getContractWasmPath('nft');

type Context = {
  // launchpadFactory: NearAccount,
  launchpad: NearAccount,
  root: NearAccount,
  beneficiary: NearAccount,
  idoToken: NearAccount,
  nft: NearAccount
}

type TestExecutionContext = ExecutionContext<TestContext<Context>>;

const test = testAny as TestFuncWithWorker<Context>;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const ftDeposit = async (t: TestExecutionContext, of: string) => {
  const { root, idoToken } = t.context.accounts;

  await root.call(idoToken.accountId, 'storage_deposit', {
    account_id: of,
  }, {
    attachedDeposit: parseUnits('1', 24)
  })
}

const config = {
  price: '1'
}

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;

  const beneficiary = await root.createSubAccount('beneficiary');
  const idoToken = await root.createSubAccount('idotoken');
  const nft = await root.createSubAccount('nft');
  // const launchpadFactory = await root.createSubAccount('factory');
  const launchpad = await root.createSubAccount('testido');

  t.context.accounts = { root, launchpad, beneficiary, idoToken, nft };

  // await launchpadFactory.deploy(launchpadFactoryContractPath);

  await idoToken.deploy(idoTokenContractPath);

  await idoToken.call(idoToken, 'init', {
    owner_id: root.accountId,
    total_supply: parseUnits(1000000).toString(),
    metadata: {
      decimals: 18,
      name: 'Test FT',
      symbol: 'TFT'
    } as FTContractMetadata
  });

  console.log('Token Metadata', await idoToken.view('ft_metadata'));

  console.log('balance owner', await idoToken.view('ft_balance_of', {
    account_id: root.accountId
  }))

  // Get wasm file path from package.json test script in folder above
  await launchpad.deploy(launchpadContractPath);

  const launchAmount = parseUnits(100).toString()

  await ftDeposit(t, launchpad.accountId);
  await ftDeposit(t, beneficiary.accountId);
  await ftDeposit(t, root.accountId);
  await ftDeposit(t, nft.accountId);


  await root.call(idoToken.accountId, 'ft_transfer', {
    receiver_id: launchpad.accountId,
    amount: launchAmount,
    memo: '',
  }, {
    attachedDeposit: parseUnits('1', 24)
  })

  await nft.deploy(nftContractPath);

  await nft.call(nft.accountId, 'init', {
    ido_id: launchpad.accountId,
    ido_token_id: idoToken.accountId,
  })

  console.log('balance owner after transfer', await idoToken.view('ft_balance_of', {
    account_id: root.accountId
  }))

  const saleEnd = (Math.floor(new Date().getTime() * 1_000_000) + 1_000_000_000_000).toString();

  await launchpad.call(launchpad, 'init', {
    _deployer: root.accountId,
    _launchedToken: idoToken.accountId,
    _nft: nft.accountId,
    _tokenFounder: root.accountId,
    _project: {
      hardCap: '1000',
      softCap: '100',
      saleStartTime: '0',// Math.floor(new Date().getTime() / 1000).toString(),
      saleEndTime: saleEnd,
      price: config.price,
    },
    cliffDuration: '0',
    cliffStart: saleEnd,
    vestingDuration: '0'
  } as IDOParams,
    {
      gas: parseUnits(300, 12),
    });

  // await launchpadFactory.call(launchpadFactory.accountId, 'add_ido', {
  //   account_id: launchpad.accountId
  // })

  // console.log('All idos', await launchpadFactory.view('get_all_idos'));

  await root.transfer(launchpad.accountId, parseUnits(4, 24));
  const launchpadBalance: string = await idoToken.view('ft_balance_of', {
    account_id: launchpad.accountId
  });

  const updIdoData = await launchpad.view('get_ido_info') as GetIdoDataResult;

  t.is(launchpadBalance, launchAmount);
  t.is(updIdoData.idoData.totalClaimableAmount, launchAmount)

  // // Save state for test runs, it is unique for each test
  t.context.worker = worker;
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

const testPurchaseToken = async (
  t: TestExecutionContext,
  tokenId: number = 0
) => {
  const { launchpad, root, beneficiary, nft } = t.context.accounts;
  console.log('purchase tokens');

  const tx = await root.call(launchpad.accountId, 'purchaseTokens', {
    beneficiary: beneficiary.accountId,
    token_id: tokenId.toString()
  }, {
    attachedDeposit: new BN('500'),
    gas: parseUnits(300, 12)
  })

  const ownerTokens = await nft.view('nft_tokens_for_owner', {
    account_id: beneficiary.accountId,
    from_index: '0',
  }) as Array<any>;

  console.log('All tokens for owner', ownerTokens)

  console.log('Get token data', await nft.view('get_token_data', {
    token_id: tokenId.toString(),
  }))

  // t.is(ownerTokens.length, 1)
  t.is(ownerTokens[0].owner_id, beneficiary.accountId);
}

const getNftData = async (t: TestExecutionContext, nftId: number) => {
  const { nft } = t.context.accounts;

  return await nft.view('get_token_data', {
    token_id: nftId.toString(),
  }) as LaunchpadJsonToken
}

const getFtBalance = async (t: TestExecutionContext, of: string) => {
  const { idoToken } = t.context.accounts;

  return new BN(await idoToken.view('ft_balance_of', {
    account_id: of,
  }).catch(err => { console.log(err); return '0' }) as string)
}

const testClaim = async (t: TestExecutionContext, claimTokenId: number) => {
  const { launchpad, root, beneficiary, nft } = t.context.accounts;
  console.log('testClaim');

  const token = await getNftData(t, claimTokenId);

  const balanceBefore = await getFtBalance(t, beneficiary.accountId);

  await beneficiary.call(launchpad.accountId, 'claimVestedTokens', {
    beneficiary: beneficiary.accountId,
    token_id: claimTokenId.toString()
  }, {
    gas: parseUnits(300, 12)
  })

  const balanceAfter = await getFtBalance(t, beneficiary.accountId);

  console.log({
    balanceAfter,
    balanceBefore
  })
  // t.is(balanceAfter.eq(balanceBefore.add(new BN(token?.token_data?.balance ?? '0'))), true);
}

// test('purchase tokens', async (t) => {
//   await testPurchaseToken(t);
// });

// test('purchase tokens and claim', async (t) => {
//   await testPurchaseToken(t);
//   await testClaim(t, 1);
// });

test('purchase tokens and make another purchase on the same id', async (t) => {
  await testPurchaseToken(t);
  await testPurchaseToken(t, 1);
});