import { formatUnits } from "@ethersproject/units";
import BN from "bn.js";

import { NATIVE_DECIMALS, PLATFORM_ADDRESS } from "../../constants";
import {
  AcceptOfferFromGuaranteeProviderArgs,
  AcceptOfferFromNftProviderArgs,
  CreateOfferFromGuaranteeProviderArgs,
  CreateOfferFromNftProviderArgs,
  EquitifyPlatform,
  Offer,
  Protection,
} from "../../contracts/equitifyPlatform";
import { Wallet } from "../../near-wallet";

export const getOffersNear = async (wallet: Wallet): Promise<Offer[]> => {
  const platform = new EquitifyPlatform(PLATFORM_ADDRESS, wallet);
  const offers = await platform.getOffers({
    is_active: true,
    is_cancelled: false,
  });
  return offers.map((o) => ({
    ...o,
    nearFeeAmount: formatUnits(o.nearFeeAmount, NATIVE_DECIMALS),
    nearGuaranteeAmount: formatUnits(o.nearGuaranteeAmount, NATIVE_DECIMALS),
    protectionDuration: new BN(o.protectionDuration)
      .div(new BN(1_000_000_000))
      .toString(),
  }));
};

export const getProtectionsNear = async (
  wallet: Wallet
): Promise<Protection[]> => {
  const platform = new EquitifyPlatform(PLATFORM_ADDRESS, wallet);
  const protections = await platform.getProtections({ is_active: true });
  return protections.map((p) => ({
    ...p,
    offer: {
      ...p.offer,
      nearFeeAmount: formatUnits(p.offer.nearFeeAmount, NATIVE_DECIMALS),
      nearGuaranteeAmount: formatUnits(
        p.offer.nearGuaranteeAmount,
        NATIVE_DECIMALS
      ),
      protectionDuration: new BN(p.offer.protectionDuration)
        .div(new BN(1_000_000_000))
        .toString(),
    },
    protectionStart: new BN(p.protectionStart)
      .div(new BN(1_000_000_000))
      .toString(),
  }));
};

export const createOfferFromGuaranteeProviderNear = async (
  wallet: Wallet,
  args: CreateOfferFromGuaranteeProviderArgs
) => {
  const platform = new EquitifyPlatform(PLATFORM_ADDRESS, wallet);
  return await platform.createOfferFromGuaranteeProvider(args);
};

export const createOfferFromNftProviderNear = async (
  wallet: Wallet,
  args: CreateOfferFromNftProviderArgs
) => {
  const platform = new EquitifyPlatform(PLATFORM_ADDRESS, wallet);
  return await platform.createOfferFromNftProvider(args);
};

export const cancelOrderNear = async (wallet: Wallet, offer_id: string) => {
  const platform = new EquitifyPlatform(PLATFORM_ADDRESS, wallet);
  return await platform.cancelOrder(offer_id);
};

export const acceptOfferFromNftProviderNear = async (
  wallet: Wallet,
  args: AcceptOfferFromNftProviderArgs
) => {
  const platform = new EquitifyPlatform(PLATFORM_ADDRESS, wallet);
  return await platform.acceptOfferFromNftProvider(args);
};

export const acceptOfferFromGuaranteeProviderNear = async (
  wallet: Wallet,
  args: AcceptOfferFromGuaranteeProviderArgs
) => {
  const platform = new EquitifyPlatform(PLATFORM_ADDRESS, wallet);
  return await platform.acceptOfferFromGuaranteeProvider(args);
};

export const protectionClaimGuaranteeNear = async (
  wallet: Wallet,
  offerId: string
) => {
  const platform = new EquitifyPlatform(PLATFORM_ADDRESS, wallet);
  return await platform.protectionClaimGuarantee(offerId);
};

export const protectionClaimNftNear = async (
  wallet: Wallet,
  offerId: string
) => {
  const platform = new EquitifyPlatform(PLATFORM_ADDRESS, wallet);
  return await platform.protectionClaimNft(offerId);
};
