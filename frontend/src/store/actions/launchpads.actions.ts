import { createAsyncThunk } from "@reduxjs/toolkit";

import { Wallet } from "../../near-wallet";
import {
  claimTokensNear,
  getLaunchpadsNear,
  purchaseTokensNear,
} from "../near/launchpads.near";

export type ProjectStruct = {
  projectName: string;
  projectSignatures: string;
  projectDescription: string;
  hardCap: string;
  softCap: string;
  saleStartTime: string;
  saleEndTime: string;
  price: string;
};

export type NftType = {
  balance: string;
  claimed: boolean;
  initialized: boolean;
  released: string;
  revoked: boolean;
  tokenId: string;
  tokenUri: string;
};

export type NftContractType = {
  address: string;
  nfts: NftType[];
};

export type TokenType = {
  address: string;
  name: string;
  symbol: string;
  decimals: string;
};

export type ProjectType = {
  address: string;
  token: TokenType;
  projectStruct: ProjectStruct;
  nft: NftContractType;
  stakingContract: string;
  totalRaised: string;
};

export const getLaunchpads = createAsyncThunk<ProjectType[], Wallet>(
  "getLaunchpads",
  async (wallet: Wallet) => {
    return await getLaunchpadsNear(wallet);
  }
);

export type PurchaseTokensParams = {
  wallet: Wallet;
  launchpadAddress: string;
  tokenId: string;
  amount: string;
};

export const purchaseTokens = createAsyncThunk<void, PurchaseTokensParams>(
  "purchaseTokens",
  async ({ wallet, launchpadAddress, tokenId, amount }) => {
    return await purchaseTokensNear(wallet, launchpadAddress, tokenId, amount);
  }
);

export type ClaimTokensParams = {
  wallet: Wallet;
  launchpadAddress: string;
  tokenId: string;
};

export const claimTokens = createAsyncThunk<void, ClaimTokensParams>(
  "claimTokens",
  async ({ wallet, launchpadAddress, tokenId }) => {
    return await claimTokensNear(wallet, launchpadAddress, tokenId);
  }
);
