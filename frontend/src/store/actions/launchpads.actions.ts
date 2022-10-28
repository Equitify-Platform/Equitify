import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  claimTokensNear,
  getLaunchpadsNear,
  purchaseTokensNear,
  transferNftNear,
} from "../near/launchpads.near";
import { store } from "../store";

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

export const getLaunchpads = createAsyncThunk<ProjectType[]>(
  "getLaunchpads",
  async () => {
    return await getLaunchpadsNear(store.getState().wallet.wallet);
  }
);

export type PurchaseTokensParams = {
  launchpadAddress: string;
  tokenId: string;
  amount: string;
};

export const purchaseTokens = createAsyncThunk<void, PurchaseTokensParams>(
  "purchaseTokens",
  async ({ launchpadAddress, tokenId, amount }) => {
    return await purchaseTokensNear(
      store.getState().wallet.wallet,
      launchpadAddress,
      tokenId,
      amount
    );
  }
);

export type ClaimTokensParams = {
  launchpadAddress: string;
  tokenId: string;
};

export const claimTokens = createAsyncThunk<void, ClaimTokensParams>(
  "claimTokens",
  async ({ launchpadAddress, tokenId }) => {
    return await claimTokensNear(
      store.getState().wallet.wallet,
      launchpadAddress,
      tokenId
    );
  }
);

export type TransferNftParams = {
  nftAddress: string;
  receiverId: string;
  tokenId: string;
};

export const transferNft = createAsyncThunk<void, TransferNftParams>(
  "transferNft",
  async ({ nftAddress, tokenId, receiverId }) => {
    return await transferNftNear(
      store.getState().wallet.wallet,
      nftAddress,
      receiverId,
      tokenId
    );
  }
);
