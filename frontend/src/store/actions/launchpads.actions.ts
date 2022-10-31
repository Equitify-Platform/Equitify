import { createAsyncThunk } from "@reduxjs/toolkit";

import { Wallet } from "../../near-wallet";
import {
  claimTokensNear,
  getLaunchpadsNear,
  purchaseTokensNear,
  transferNftNear,
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
  decimals: number;
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
  async (wallet) => {
    return await getLaunchpadsNear(wallet);
  }
);

export type PurchaseTokensParams = {
  launchpadAddress: string;
  tokenId: string;
  amount: string;
  wallet: Wallet;
};

export const purchaseTokens = createAsyncThunk<void, PurchaseTokensParams>(
  "purchaseTokens",
  async ({ launchpadAddress, tokenId, amount, wallet }) => {
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
  async ({ launchpadAddress, tokenId, wallet }) => {
    return await claimTokensNear(wallet, launchpadAddress, tokenId);
  }
);

export type TransferNftParams = {
  nftAddress: string;
  receiverId: string;
  tokenId: string;
  wallet: Wallet;
};

export const transferNft = createAsyncThunk<void, TransferNftParams>(
  "transferNft",
  async ({ nftAddress, tokenId, receiverId, wallet }) => {
    return await transferNftNear(wallet, nftAddress, receiverId, tokenId);
  }
);
