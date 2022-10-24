import { createAsyncThunk } from "@reduxjs/toolkit";

import { NETWORK } from "../../constants";
import { Wallet } from "../../near-wallet";

export const wallet = new Wallet(NETWORK);

export const startUpWallet = createAsyncThunk("startUpWallet", async () => {
  const wallet = new Wallet(NETWORK);
  const isSignedIn = await wallet.startUp();
  return {
    wallet,
    isSignedIn,
  };
});

export const signInWallet = createAsyncThunk<void, Wallet>(
  "signInWallet",
  (wallet) => {
    wallet.signIn();
  }
);

export const signOutWallet = createAsyncThunk<void, Wallet>(
  "signOutWallet",
  async (wallet) => {
    await wallet.signOut();
  }
);
