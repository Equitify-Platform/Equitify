import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getStakingInfoMock,
  getStakingPersonalMock,
} from "../mocks/staking.mocks";

export type StakingInfo = {
  symbol: string;
  numberOfStakers: string;
  APY: string;
  totalStaked: string;
};

export type StakingPersonal = {
  staked: string;
  spw: string;
  rewards: string;
};

export const getStakingInfo = createAsyncThunk<StakingInfo>(
  "getStakingInfo",
  async () => {
    return await getStakingInfoMock();
  }
);

export const getStakingPersonal = createAsyncThunk<StakingPersonal, string>(
  "getStakingPersonal",
  async (account) => {
    return await getStakingPersonalMock();
  }
);
