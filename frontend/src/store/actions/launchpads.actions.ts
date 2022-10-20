import { createAsyncThunk } from "@reduxjs/toolkit";

import { getLaunchpadsMock } from "../mocks/launchpads.mocks";

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

export type ProjectType = {
  address: string;
  tokenAddress: string;
  tokenOwnerAddress: string;
  projectStruct: ProjectStruct;
  nft: NftContractType;
  stakingContract: string;
};

export const getLaunchpads = createAsyncThunk<ProjectType[]>(
  "getLaunchpads",
  async () => {
    return await getLaunchpadsMock();
  }
);
