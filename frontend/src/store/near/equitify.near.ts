import { PLATFORM_ADDRESS } from "../../constants";
import {
  CreateOfferFromGuaranteeProviderArgs,
  CreateOfferFromNftProviderArgs,
  EquitifyPlatform,
  Offer,
  Protection,
} from "../../contracts/equitifyPlatform";
import { Wallet } from "../../near-wallet";

export const getOffersNear = async (wallet: Wallet): Promise<Offer[]> => {
  const platform = new EquitifyPlatform(PLATFORM_ADDRESS, wallet);
  return await platform.getOffers({ is_active: true, is_cancelled: false });
};

export const getProtectionsNear = async (
  wallet: Wallet
): Promise<Protection[]> => {
  const platform = new EquitifyPlatform(PLATFORM_ADDRESS, wallet);
  return await platform.getProtections({ is_active: true });
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
