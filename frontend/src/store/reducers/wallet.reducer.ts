import { createSlice } from "@reduxjs/toolkit";

import { Wallet } from "../../near-wallet";
import {
  signInWallet,
  signOutWallet,
  startUpWallet,
  wallet,
} from "../actions/wallet.actions";

interface InitialState {
  wallet: Wallet;
  isSignedIn: boolean;
}

const initialState: InitialState = {
  wallet,
  isSignedIn: false,
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
  },
});

export const walletReducer = walletSlice.reducer;
