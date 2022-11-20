import { createAsyncThunk } from "@reduxjs/toolkit";

import type {
  CreateOfferFromGuaranteeProviderArgs,
  CreateOfferFromNftProviderArgs,
  Offer,
  Protection,
} from "../../contracts/equitifyPlatform";
import { Wallet } from "../../near-wallet";
import { getOffersMock, getProtectionsMock } from "../mocks/equitify.mocks";
import {
  createOfferFromGuaranteeProviderNear,
  createOfferFromNftProviderNear,
  // getOffersNear,
  // getProtectionsNear,
} from "../near/equitify.near";

export const getOffers = createAsyncThunk<Offer[], Wallet>(
  "getOffers",
  async (wallet) => {
    return await getOffersMock();
  }
);

export const getProtections = createAsyncThunk<Protection[], Wallet>(
  "getProtections",
  async (wallet) => {
    return await getProtectionsMock();
  }
);

export const createOfferFromGuaranteeProvider = createAsyncThunk<
  void,
  { wallet: Wallet; args: CreateOfferFromGuaranteeProviderArgs }
>("createOfferFromGuaranteeProvider", async ({ wallet, args }) => {
  await createOfferFromGuaranteeProviderNear(wallet, args);
});

export const createOfferFromNftProvider = createAsyncThunk<
  void,
  { wallet: Wallet; args: CreateOfferFromNftProviderArgs }
>("createOfferFromNftProvider", async ({ wallet, args }) => {
  await createOfferFromNftProviderNear(wallet, args);
});
