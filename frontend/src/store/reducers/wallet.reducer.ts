import { createSlice } from "@reduxjs/toolkit";

import { Wallet } from "../../near-wallet";
import {
  getBalance,
  signInWallet,
  signOutWallet,
  startUpWallet,
  wallet,
} from "../actions/wallet.actions";

interface InitialState {
  wallet: Wallet;
  isSignedIn: boolean;
  balance: {
    available: string;
  };
}

const initialState: InitialState = {
  wallet,
  isSignedIn: false,
  balance: {
    available: "0",
  },
};

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(startUpWallet.fulfilled, (state, action) => {
      state.wallet = action.payload.wallet;
      state.isSignedIn = action.payload.isSignedIn;
    });
    builder.addCase(signInWallet.fulfilled, (state) => {
      state.isSignedIn = true;
    });
    builder.addCase(signOutWallet.fulfilled, (state) => {
      state.isSignedIn = false;
    });
    builder.addCase(getBalance.fulfilled, (state, action) => {
      state.balance.available = action.payload;
    });
  },
});

export const walletReducer = walletSlice.reducer;
