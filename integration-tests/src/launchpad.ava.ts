import testAny, { ExecutionContext } from 'ava';
import { NearAccount, parseGas, Worker, } from 'near-workspaces';
import { getContractWasmPath, parseUnits, TestContext, TestFuncWithWorker } from './utils/helpers';
import { GetIdoDataResult, IDOData, IDOParams } from "../../contracts/src/launchpad";
import { BN } from 'bn.js';
import { LaunchpadJsonToken } from '../../contracts/src/nft';
import { FTContractMetadata } from '../../contracts/src/ft';
import { currentTimeToNearTimestamp, secondsToNearTimestamp } from '../../contracts/src/scripts/utils';


const launchpadContractPath = getContractWasmPath('launchpad');
const launchpadFactoryContractPath = getContractWasmPath('launchpad_factory');
const idoTokenContractPath = getContractWasmPath('ft');
const nftContractPath = getContractWasmPath('nft');
const platformContractPath = getContractWasmPath('equitify_platform');

type Context = {
  // launchpadFactory: NearAccount,
  launchpad: NearAccount,
  root: NearAccount,
  beneficiary: NearAccount,
  offerer: NearAccount,
  idoToken: NearAccount,
  nft: NearAccount,
  platform: NearAccount,
  // idoSaleTimeInfo?: {
  //   saleEnd: string,
  //   cliffStart: string,
  //   cliffDuration: string,
  //   vestingDuration: string,
  // }
}

type TestExecutionContext = ExecutionContext<TestContext<Context>>;

const test = testAny as TestFuncWithWorker<Context>;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const ftDeposit = async (t: TestExecutionContext, of: string) => {
  const { root, idoToken } = t.context.context;

  await root.call(idoToken.accountId, 'storage_deposit', {
    account_id: of,
  }, {
    attachedDeposit: parseUnits('1', 24)
  })
}

const config = {
  price: '1'
}

const saleEnd = currentTimeToNearTimestamp() + secondsToNearTimestamp(100000);
const cliffStart = saleEnd;
const cliffDuration = secondsToNearTimestamp(0);
const vestingDuration = secondsToNearTimestamp(2);


test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;

  const beneficiary = await root.createSubAccount('beneficiary');
  const offerer = await root.createSubAccount('offerer');

  const idoToken = await root.createSubAccount('idotoken');
  const nft = await root.createSubAccount('nft');
  const platform = await root.createSubAccount('platform');



  // const launchpadFactory = await root.createSubAccount('factory');
  const launchpad = await root.createSubAccount('testido');

  t.context.context = { root, launchpad, beneficiary, idoToken, nft, platform, offerer };

  // await launchpadFactory.deploy(launchpadFactoryContractPath);

  await platform.deploy(platformContractPath)
  await platform.call(platform, 'init', {})

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


  // t.context.context.idoSaleTimeInfo = {
  //   saleEnd:saleEnd.toString(),
  //   cliffStart:cliffStart.toString(),
  //   cliffDuration:cliffDuration.toString(),
  //   vestingDuration:vestingDuration.toString(),
  // }

  await launchpad.call(launchpad, 'init', {
    _deployer: root.accountId,
    _launchedToken: idoToken.accountId,
    _nft: nft.accountId,
    _tokenFounder: root.accountId,
    _project: {
      hardCap: '1000',
      softCap: '100',
      saleStartTime: '0',// Math.floor(new Date().getTime() / 1000).toString(),
      saleEndTime: saleEnd.toString(),
      price: config.price,
    },
    cliffDuration: cliffDuration.toString(),
    cliffStart: cliffStart.toString(),
    vestingDuration: vestingDuration.toString()
  } as IDOParams,
    {
      gas: parseUnits(300, 12),
    });

  // await launchpadFactory.call(launchpadFactory.accountId, 'add_ido', {
  //   account_id: launchpad.accountId
  // })platformContractPath
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
  const { launchpad, root, beneficiary, nft } = t.context.context;
  console.log('purchase tokens');

  // console.log('Claim times:', {
  //   current: currentTimeToNearTimestamp(),
  //   saleEnd: idoSaleTimeInfo.saleEnd
  // })

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
  const { nft } = t.context.context;

  return await nft.view('get_token_data', {
    token_id: nftId.toString(),
  }) as LaunchpadJsonToken
}

const getFtBalance = async (t: TestExecutionContext, of: string) => {
  const { idoToken } = t.context.context;

  return new BN(await idoToken.view('ft_balance_of', {
    account_id: of,
  }).catch(err => { console.log(err); return '0' }) as string)
}

const testClaim = async (t: TestExecutionContext, claimTokenId: number) => {
  const { launchpad, root, beneficiary, nft } = t.context.context;
  console.log('testClaim');

  const token = await getNftData(t, claimTokenId);

  const balanceBefore = await getFtBalance(t, beneficiary.accountId);


  await delay(7000);
  // await t.context.worker.provider.sendJsonRpc('sandbox_fast_forward', {
  //   "delta_height": (cliffStart + cliffDuration + vestingDuration) - currentTimeToNearTimestamp() + 100
  // });

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


const postOffer = async (t: TestExecutionContext, tokenId: number) => {
  const { offerer, platform, nft } = t.context.context;

  await offerer.call(platform.accountId, 'create_offer', {
    nft_contract_id: nft.accountId,
    nft_id: tokenId.toString(),
    near_fee_amount: parseUnits('1', 24).toString(),
    near_guarantee_amount: parseUnits('10', 24).toString(),
    duration: '1'
  }, {
    attachedDeposit: parseUnits('11', 24),
    gas: parseUnits(300, 12),
  })
}

const cancelOffer = async (t: TestExecutionContext, orderId: number) => {
  const { offerer, platform, nft } = t.context.context;

  await offerer.call(platform.accountId, 'cancel_order', {
    offer_id: orderId.toString()
  }, {
    attachedDeposit: parseUnits('1', 20),
    gas: parseUnits(300, 12),
  })
}

const acceptOffer = async (t: TestExecutionContext, approvalId: number, orderId: number) => {
  const { offerer, platform, beneficiary } = t.context.context;

  await beneficiary.call(platform.accountId, 'accept_offer', {
    offer_id: orderId.toString(),
    approval_id: approvalId.toString()
  }, {
    attachedDeposit: parseUnits('1', 24),
    gas: parseUnits(300, 12),
  })

  console.log('Offers', await platform.view('get_offers', {}))
  console.log('Protections', await platform.view('get_protections', {}))
}

const approveNft = async (t: TestExecutionContext, nftId: number, approveTo: string) => {
  const { offerer, nft, beneficiary } = t.context.context;

  await beneficiary.call(nft.accountId, 'nft_approve', {
    token_id: nftId.toString(),
    account_id: approveTo
  }, {
    attachedDeposit: parseUnits('1', 24),
    gas: parseUnits(300, 12),
  })
}

const claimNft = async (t: TestExecutionContext, offerId: number) => {
  const { offerer, nft, beneficiary, platform } = t.context.context;

  await beneficiary.call(platform.accountId, 'taker_claim_nft', {
    offer_id: offerId.toString(),
  }, {
    attachedDeposit: parseUnits('1', 15),
    gas: parseUnits(300, 12),
  })

}

const claimGuarantee = async (t: TestExecutionContext, offerId: number) => {
  const { offerer, nft, beneficiary, platform } = t.context.context;

  await beneficiary.call(platform.accountId, 'taker_claim_guarantee', {
    offer_id: offerId.toString(),
  }, {
    attachedDeposit: parseUnits('1', 15),
    gas: parseUnits(300, 12),
  })
}


// test('purchase tokens', async (t) => {
//   await testPurchaseToken(t);
// });

// test('purchase tokens and claim', async (t) => {
//   await testPurchaseToken(t);
//   await testClaim(t, 1);
// });

// test('purchase tokens and make another purchase on the same id', async (t) => {
//   await testPurchaseToken(t);
//   await testPurchaseToken(t, 1);
// });

// test('purchase tokens and post offer to platform', async (t) => {
//   await testPurchaseToken(t);
// });

// test('post offer', async (t) => {
//   postOffer(t, 1)
// })

// test('post offer and cancel', async (t) => {
//   postOffer(t, 1)
//   cancelOffer(t, 0);
// })

test('post offer and accept it from beneficiary', async (t) => {
  await testPurchaseToken(t);
  await approveNft(t, 1, t.context.context.platform.accountId);
  await postOffer(t, 1)
  await acceptOffer(t, 0, 0)
})


test('post offer and accept it from beneficiary, wait till it ended and claim nft', async (t) => {
  await testPurchaseToken(t);
  await approveNft(t, 1, t.context.context.platform.accountId);
  await postOffer(t, 1)
  await acceptOffer(t, 0, 0)
  await delay(100);
  await claimNft(t, 0);

})

test('post offer and accept it from beneficiary, wait till it ended and claim near guarantee', async (t) => {
  await testPurchaseToken(t);
  await approveNft(t, 1, t.context.context.platform.accountId);
  await postOffer(t, 1)
  await acceptOffer(t, 0, 0)
  await delay(100);
  await claimGuarantee(t, 0);
})