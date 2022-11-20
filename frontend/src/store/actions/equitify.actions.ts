import { createAsyncThunk } from "@reduxjs/toolkit";

import type {
  AcceptOfferFromGuaranteeProviderArgs,
  AcceptOfferFromNftProviderArgs,
  CreateOfferFromGuaranteeProviderArgs,
  CreateOfferFromNftProviderArgs,
  Offer,
  Protection,
} from "../../contracts/equitifyPlatform";
import { Wallet } from "../../near-wallet";
import {
  acceptOfferFromGuaranteeProviderNear,
  acceptOfferFromNftProviderNear,
  cancelOrderNear,
  createOfferFromGuaranteeProviderNear,
  createOfferFromNftProviderNear,
  getOffersNear,
  getProtectionsNear,
  protectionClaimGuaranteeNear,
  protectionClaimNftNear,
} from "../near/equitify.near";

export const getOffers = createAsyncThunk<Offer[], Wallet>(
  "getOffers",
  async (wallet) => {
    return await getOffersNear(wallet);
  }
);

export const getProtections = createAsyncThunk<Protection[], Wallet>(
  "getProtections",
  async (wallet) => {
    return await getProtectionsNear(wallet);
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

export const cancelOrder = createAsyncThunk<
  void,
  { wallet: Wallet; offer_id: string }
>("cancelOrder", async ({ wallet, offer_id }) => {
  await cancelOrderNear(wallet, offer_id);
});

export const acceptOfferFromNftProvider = createAsyncThunk<
  void,
  { wallet: Wallet; args: AcceptOfferFromNftProviderArgs }
>("acceptOfferFromNftProvider", async ({ wallet, args }) => {
  await acceptOfferFromNftProviderNear(wallet, args);
});

export const acceptOfferFromGuaranteeProvider = createAsyncThunk<
  void,
  { wallet: Wallet; args: AcceptOfferFromGuaranteeProviderArgs }
>("acceptOfferFromGuaranteeProvider", async ({ wallet, args }) => {
  await acceptOfferFromGuaranteeProviderNear(wallet, args);
});

export const protectionClaimGuarantee = createAsyncThunk<
  void,
  { wallet: Wallet; offerId: string }
>("protectionClaimGuarantee", async ({ wallet, offerId }) => {
  await protectionClaimGuaranteeNear(wallet, offerId);
});

export const protectionClaimNft = createAsyncThunk<
  void,
  { wallet: Wallet; offerId: string }
>("protectionClaimNft", async ({ wallet, offerId }) => {
  await protectionClaimNftNear(wallet, offerId);
});
