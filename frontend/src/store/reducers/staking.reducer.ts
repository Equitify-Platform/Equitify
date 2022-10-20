import { createSlice } from "@reduxjs/toolkit";

import {
  getStakingInfo,
  getStakingPersonal,
  StakingInfo,
  StakingPersonal,
} from "../actions/staking.actions";

interface InitialState {
  info: StakingInfo;
  personal: StakingPersonal;
}

const initialState: InitialState = {
  info: {
    APY: "Soon",
    numberOfStakers: "0",
    symbol: "SLT",
    totalStaked: "0.00",
  },
  personal: {
    rewards: "0.00",
    spw: "0.00",
    staked: "0.00",
  },
};

export const stakingSlice = createSlice({
  name: "staking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getStakingInfo.fulfilled, (state, action) => {
      state.info = action.payload;
    });
    builder.addCase(getStakingPersonal.fulfilled, (state, action) => {
      state.personal = action.payload;
    });
  },
});

export const stakingReducer = stakingSlice.reducer;
