import * as nearAPI from "near-api-js";
import { Account, Near, utils, WalletConnection } from "near-api-js";
import * as fs from "fs";
import { FTContractMetadata } from "../../ft";
import { parseUnits, secondsToNearTimestamp } from "../utils";
import { testnetConfig } from "./config";
import { IDOParams, Project } from "../../launchpad";
const { keyStores, KeyPair, connect } = nearAPI;

const KEY_STORE_PATH = '/home/kostya/near/keystore' // process.env.KEY_STORE ?? "~/near/keystore";
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(KEY_STORE_PATH);

console.log("keystore path is ", KEY_STORE_PATH);
const connectionConfig = {
  networkId: "testnet",
  keyStore: keyStore, // first create a key store
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
  headers: {},
};

let nearConnection: Near;

const DEPLOYER_PK = '' //process.env.SIGNER_PK;
const DEPLOYER_NAME = 'launchpad-deployer.testnet' //process.env.SIGNER_PK;

const globalDeployPrefix = process.argv[2] ?? "default";

console.log('globalDeployPrefix', globalDeployPrefix)

const init = async () => {
  // creates a public / private key pair using the provided private key
  const keyPair = KeyPair.fromString(DEPLOYER_PK);
  // adds the keyPair you created to keyStore
  await keyStore.setKey(connectionConfig.networkId, DEPLOYER_NAME, keyPair);

  nearConnection = await connect(connectionConfig);

  console.log("account id", await nearConnection.account(DEPLOYER_NAME));
};

async function createAccount(
  creatorAccountId: string,
  newAccountId: string,
  amount: string
) {
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

async function createAccountAndDeploy(
  creatorAccountId: string,
  newAccountId: string,
  bytecode: Uint8Array,
  amount: string
) {
  const newAccountFullId = `${newAccountId}-${globalDeployPrefix}.${creatorAccountId}`;
  // return await nearConnection.account(newAccountFullId);

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

  console.log("Contract deployed at", res.accountId);
  return res;
}

function getContract(name: string) {
  return fs.readFileSync(`../build/${name}.wasm`);
}

const ftDeposit = async (ftAccountId: string, to: string) => {
  const deployer = await nearConnection.account(DEPLOYER_NAME);

  await deployer.functionCall({
    contractId: ftAccountId,
    methodName: "storage_deposit",
    args: {
      account_id: to,
    },
    attachedDeposit: utils.format.parseNearAmount("1"),
  });
};

const main = async () => {
  await init();

  const config = testnetConfig.idos.find(
    (v) => v.name.toLowerCase() === globalDeployPrefix
  );
  if (!config) throw "Config is not found";
  else console.log('Config found')
  const deployer = await nearConnection.account(DEPLOYER_NAME);

  const factory = await createAccountAndDeploy(
    deployer.accountId,
    `factory`,
    getContract("launchpad_factory"),
    "1"
  );

  const platform = await createAccountAndDeploy(
    deployer.accountId,
    `platform`,
    getContract("equitify_platform"),
    "5.5"
  );

  await platform.functionCall({
    contractId: platform.accountId,
    methodName: "init",
    args: {},
  })

  const idoToken = await createAccountAndDeploy(
    deployer.accountId,
    `ido-token`,
    getContract("ft"),
    "5.5"
  );

  await idoToken.functionCall({
    contractId: idoToken.accountId,
    methodName: "init",
    args: {
      owner_id: deployer.accountId,
      total_supply: parseUnits(1000000).toString(),
      metadata: {
        decimals: 18,
        name: "Test FT",
        symbol: "TFT",
      } as FTContractMetadata,
    },
  });

  const launchpad = await createAccountAndDeploy(
    deployer.accountId,
    `ido-launchpad`,
    getContract("launchpad"),
    "10"
  );

  const launchAmount = parseUnits(1000000).toString();

  await ftDeposit(idoToken.accountId, launchpad.accountId);
  await ftDeposit(idoToken.accountId, deployer.accountId);

  await deployer.functionCall({
    contractId: idoToken.accountId,
    methodName: "ft_transfer",
    args: {
      receiver_id: launchpad.accountId,
      amount: launchAmount,
      memo: "",
    },
    attachedDeposit: utils.format.parseNearAmount("1"),
  });

  const nft = await createAccountAndDeploy(
    deployer.accountId,
    `nft`,
    getContract("nft"),
    "5.7"
  );

  await ftDeposit(idoToken.accountId, nft.accountId);

  await nft.functionCall({
    contractId: nft.accountId,
    methodName: "init",
    args: {
      ido_id: launchpad.accountId,
      ido_token_id: idoToken.accountId,
    },
  });

  const saleStart = (Math.floor((new Date().getTime()) * 1_000_000) + secondsToNearTimestamp(3 * 60));
  const saleEnd = (saleStart + 60 * 60 * 1 * 1000 * 1_000_000).toString();

  await launchpad.functionCall({
    contractId: launchpad.accountId,
    methodName: "init",
    args: {
      _deployer: deployer.accountId,
      _launchedToken: idoToken.accountId,
      _nft: nft.accountId,
      _tokenFounder: deployer.accountId,
      _project: {
        hardCap: utils.format.parseNearAmount("50"),
        softCap: utils.format.parseNearAmount("0.1"),
        saleStartTime: saleStart.toString(),
        saleEndTime: saleEnd,
        price: "1",
        projectDescription: 'Its aboba project for aboba people',
        projectName: 'ABOBA project',
        projectSignature: 'ABOBA'
      } as Project,
      cliffDuration: secondsToNearTimestamp(2 * 60).toString(),
      cliffStart: saleEnd,
      vestingDuration: secondsToNearTimestamp(1 * 60 * 60).toString(),
    } as IDOParams,

    gas: parseUnits(300, 12),
  });

  await factory.functionCall({
    contractId: factory.accountId, 
    methodName: 'add_ido', 
    args: {
      account_id: launchpad.accountId
    },
    attachedDeposit: utils.format.parseNearAmount("0.1")
  })

};

main().catch((e) => console.log("Error", e));
