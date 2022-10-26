import * as nearAPI from "near-api-js"
import { Account, Near, utils, WalletConnection } from "near-api-js";
import * as fs from 'fs'
import { FTContractMetadata } from "../../ft";
import { parseUnits } from "../utils";
import { testnetConfig } from "./config";
const { keyStores, KeyPair, connect } = nearAPI;

const KEY_STORE_PATH = process.env.KEY_STORE ?? '~/near/keystore';
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(KEY_STORE_PATH);

console.log('keystore path is ', KEY_STORE_PATH);
const connectionConfig = {
  networkId: "testnet",
  keyStore: keyStore, // first create a key store 
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};

let nearConnection: Near;
let walletConnection: WalletConnection

const DEPLOYER_PK = '<>' //process.env.SIGNER_PK;
const DEPLOYER_NAME = 'launchpad-deployer.testnet' //process.env.SIGNER_PK;

const globalDeployPrefix = process.argv[2] ?? 'default';

const init = async () => {
  // TODO: move to env

  // creates a public / private key pair using the provided private key
  const keyPair = KeyPair.fromString(DEPLOYER_PK);
  // adds the keyPair you created to keyStore
  await keyStore.setKey(connectionConfig.networkId, DEPLOYER_NAME, keyPair);

  nearConnection = await connect(connectionConfig);

  // walletConnection = new WalletConnection(nearConnection, 'deploy');

  // const walletAccountId = walletConnection.getAccountId();

  console.log('account id', await nearConnection.account(DEPLOYER_NAME));
}

async function createAccount(creatorAccountId: string, newAccountId: string, amount: string) {
  const creatorAccount = await nearConnection.account(creatorAccountId);
  const keyPair = KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.getPublicKey().toString();
  await keyStore.setKey(connectionConfig.networkId, newAccountId, keyPair);

  await creatorAccount.functionCall({
    contractId: "testnet",
    methodName: "create_account",
    args: {
      new_account_id: newAccountId,
      new_public_key: publicKey,
    },
    gas: "300000000000000",
    attachedDeposit: utils.format.parseNearAmount(amount),
  });

  return nearConnection.account(newAccountId);
}

async function createAccountAndDeploy(creatorAccountId: string, newAccountId: string, bytecode: Uint8Array, amount: string) {
  const newAccountFullId = `${newAccountId}-${globalDeployPrefix}.${creatorAccountId}`
  const creatorAccount = await nearConnection.account(creatorAccountId);
  const keyPair = KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.getPublicKey().toString();
  await keyStore.setKey(connectionConfig.networkId, newAccountFullId, keyPair);

  const res = await creatorAccount.createAndDeployContract(
    newAccountFullId,
    publicKey,
    bytecode,
    utils.format.parseNearAmount(amount)
  );

  console.log('Contract deployed at', res.accountId)
  return res;
}

function getContract(name: string) {
  return fs.readFileSync(`../build/${name}.wasm`)
}

const ftDeposit = async (ftAccountId: string, to: string) => {
  const deployer = await nearConnection.account(DEPLOYER_NAME);

  deployer.functionCall({
    contractId: ftAccountId,
    methodName: 'storage_deposit',
    args: {
      account_id: to,
    },
    attachedDeposit: utils.format.parseNearAmount('1')
  })
}



const main = async () => {
  await init();

  const config = testnetConfig.idos.find(v=>v.name.toLowerCase() === globalDeployPrefix);
  if(!config) throw 'Config is not found';

  const deployer = await nearConnection.account(DEPLOYER_NAME);

  
  if(config.idoTokenAccountId)
  const idoToken = await createAccountAndDeploy(
    deployer.accountId,
    `ido-token`,
    getContract('ft'),
    '5.5'
  )

  idoToken.functionCall({
    contractId: idoToken.accountId,
    methodName: 'init',
    args: {
      owner_id: deployer.accountId,
      total_supply: parseUnits(1000000).toString(),
      metadata: {
        decimals: 18,
        name: 'Test FT',
        symbol: 'TFT'
      } as FTContractMetadata
    }
  })

  const launchpad = await createAccountAndDeploy(
    deployer.accountId,
    `ido-launchpad`,
    getContract('launchpad'),
    '10'
  )

  const launchAmount = parseUnits(100).toString()

  await ftDeposit(idoToken.accountId, launchpad.accountId);
  await ftDeposit(idoToken.accountId, deployer.accountId);

  await deployer.functionCall({
    contractId: idoToken.accountId,
    methodName: 'ft_transfer', args: {
      receiver_id: launchpad.accountId,
      amount: launchAmount,
      memo: '',
    },
    attachedDeposit: utils.format.parseNearAmount('1')
  })

  const nft = await createAccountAndDeploy(
    deployer.accountId,
    `nft`,
    getContract('nft'),
    '5.7'
  )

  nft.functionCall({
    contractId: nft.accountId,
    methodName: 'init',
    args: {
      owner_id: launchpad.accountId,
    }
  })

  await launchpad.functionCall({
    contractId: launchpad.accountId, methodName: 'init', args: {
      _deployer: deployer.accountId,
      _launchedToken: idoToken.accountId,
      _nft: nft.accountId,
      _tokenFounder: deployer.accountId,
      _project: {
        hardCap: '1000',
        softCap: '100',
        saleStartTime: '0',// Math.floor(new Date().getTime() / 1000).toString(),
        saleEndTime: (Math.floor(new Date().getTime() * 1_000_000) + 1_000_000_000_000).toString(),
        price: '1'
      },
    },

    gas: parseUnits(300, 12),
  });
}

main()

